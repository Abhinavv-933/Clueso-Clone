import fs from 'fs';
import path from 'path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { spawn, execSync } from 'child_process';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';

interface ExtractAudioInput {
    jobId: string;
    userId: string;
    inputVideoS3Key: string;
}

interface ExtractAudioOutput {
    audioS3Key: string;
}

/**
 * Extracts audio from a video file and uploads it to S3.
 * Cleans up local temporary files after successful upload.
 */
export const extractAudio = async ({
    jobId,
    userId,
    inputVideoS3Key,
}: ExtractAudioInput): Promise<ExtractAudioOutput> => {
    const tempDir = path.join(process.cwd(), 'temp');

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const videoExt = path.extname(inputVideoS3Key) || '.mp4';
    const localVideoPath = path.join(tempDir, `${jobId}.video${videoExt}`);
    const localAudioPath = path.join(tempDir, `${jobId}.wav`);

    console.log(`[Worker] Starting audio extraction for Job ${jobId}`);

    try {
        // 1. Download Video from S3
        console.log(`[Worker] Downloading from S3: ${inputVideoS3Key}`);
        const getCommand = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: inputVideoS3Key,
        });

        const getResponse = await s3Client.send(getCommand);
        if (!getResponse.Body) throw new Error('S3 response body is empty');

        const writeStream = fs.createWriteStream(localVideoPath);
        // @ts-ignore
        await pipeline(getResponse.Body as Readable, writeStream);
        console.log(`[Worker] Download complete: ${localVideoPath}`);

        // 2. Preflight Probe & Delay
        // Give the OS a moment to finish file indexing/locking
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[Worker] Probing video file: ${localVideoPath}`);
        try {
            execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${localVideoPath}"`);
            console.log(`[Worker] Preflight probe successful: Video is readable.`);
        } catch (probeError) {
            console.error(`[Worker] Preflight probe failed. Video may be corrupted or unsupported.`);
            throw new Error(`Invalid video file: FFmpeg could not probe the media. The file may be corrupted or in an unsupported format.`);
        }

        // 3. Extract Audio using FFmpeg
        console.log(`[Worker] Spawning FFmpeg for audio extraction with strict flags...`);
        await new Promise<void>((resolve, reject) => {
            const ffmpeg = spawn('ffmpeg', [
                '-y',
                '-i', localVideoPath,
                '-vn',
                '-acodec', 'pcm_s16le',
                '-ar', '16000',
                '-ac', '1',
                localAudioPath
            ]);

            let stderrOutput = '';

            // Capture stderr for debugging (FFmpeg outputs progress to stderr)
            ffmpeg.stderr.on('data', (data) => {
                stderrOutput += data.toString();
            });

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    // Validate extracted audio file exists and has content
                    if (!fs.existsSync(localAudioPath)) {
                        console.error(`[Worker] FFmpeg succeeded but audio file not found: ${localAudioPath}`);
                        return reject(new Error('Audio extraction failed: output file not created'));
                    }

                    const audioStats = fs.statSync(localAudioPath);
                    if (audioStats.size === 0) {
                        console.error(`[Worker] Extracted audio file is empty (0 bytes)`);
                        return reject(new Error('Audio extraction failed: video may not contain audio track'));
                    }

                    console.log(`[Worker] Audio extraction success: ${localAudioPath} (${audioStats.size} bytes)`);
                    resolve();
                } else {
                    const cleanStderr = stderrOutput.trim();
                    console.error(`[Worker] FFmpeg failed with code ${code}`);
                    console.error(`[Worker] FFmpeg stderr:`, cleanStderr);

                    // Specific error mapping for common FFmpeg issues
                    let errorMsg = `Audio extraction failed (FFmpeg exit code ${code}).`;
                    if (cleanStderr.includes("Invalid data found")) {
                        errorMsg = "Transcription failed: The video format is invalid or corrupted.";
                    } else if (cleanStderr.includes("Output file is empty")) {
                        errorMsg = "Transcription failed: The video contains no audio track.";
                    } else if (cleanStderr.includes("Permission denied")) {
                        errorMsg = "Transcription failed: System permission error during processing.";
                    } else {
                        errorMsg += ` Details: ${cleanStderr.split('\n').pop() || 'Unknown error'}`;
                    }

                    reject(new Error(errorMsg));
                }
            });

            ffmpeg.on('error', (err) => {
                console.error(`[Worker] Failed to spawn FFmpeg:`, err);
                reject(new Error(`Failed to spawn FFmpeg: ${err.message}. Ensure FFmpeg is installed and in PATH.`));
            });
        });

        // 3. Upload Audio to S3
        const audioS3Key = `clueso/audio/${userId}/${jobId}.wav`;
        console.log(`[Worker] Uploading extracted audio to S3: ${audioS3Key}`);

        const audioBuffer = fs.readFileSync(localAudioPath);
        const putCommand = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: audioS3Key,
            Body: audioBuffer,
            ContentType: 'audio/wav',
        });

        await s3Client.send(putCommand);

        console.log(`[Worker] Upload complete: ${audioS3Key}`);

        // 4. Cleanup Local Files
        console.log(`[Worker] Cleaning up local temporary files...`);
        [localVideoPath, localAudioPath].forEach(p => {
            if (fs.existsSync(p)) {
                fs.unlinkSync(p);
                console.log(`[Worker] Deleted: ${p}`);
            }
        });

        return { audioS3Key };

    } catch (error) {
        console.error(`[Worker] Audio extraction/upload failed:`, error);

        // Final attempt at cleanup on error
        [localVideoPath, localAudioPath].forEach(p => {
            if (fs.existsSync(p)) {
                try { fs.unlinkSync(p); } catch (e) { }
            }
        });

        throw error;
    }
};
