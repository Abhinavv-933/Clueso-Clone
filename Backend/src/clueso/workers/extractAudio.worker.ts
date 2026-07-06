import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { downloadFileFromCloudinary, uploadFileToCloudinary } from '../../config/cloudinary';

interface ExtractAudioInput {
    jobId: string;
    userId: string;
    inputVideoPublicId: string;
}

interface ExtractAudioOutput {
    audioPublicId: string;
}

/**
 * Extracts audio from a video file and uploads it to Cloudinary.
 * Cleans up local temporary files after successful upload.
 */
export const extractAudio = async ({
    jobId,
    userId,
    inputVideoPublicId,
}: ExtractAudioInput): Promise<ExtractAudioOutput> => {
    const tempDir = path.join(process.cwd(), 'temp');

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const videoExt = path.extname(inputVideoPublicId) || '.mp4';
    const localVideoPath = path.join(tempDir, `${jobId}.video${videoExt}`);
    const localAudioPath = path.join(tempDir, `${jobId}.wav`);

    console.log(`[Worker] Starting audio extraction for Job ${jobId}`);

    try {
        // 1. Download Video from Cloudinary
        console.log(`[Worker] Downloading from Cloudinary: ${inputVideoPublicId}`);
        await downloadFileFromCloudinary(inputVideoPublicId, 'video', localVideoPath);
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

        // 3. Upload Audio to Cloudinary
        const audioPublicId = `clueso/audio/${userId}/${jobId}`;
        console.log(`[Worker] Uploading extracted audio to Cloudinary: ${audioPublicId}`);

        await uploadFileToCloudinary(localAudioPath, audioPublicId, 'video');

        console.log(`[Worker] Upload complete: ${audioPublicId}`);

        // 4. Cleanup Local Files
        console.log(`[Worker] Cleaning up local temporary files...`);
        [localVideoPath, localAudioPath].forEach(p => {
            if (fs.existsSync(p)) {
                fs.unlinkSync(p);
                console.log(`[Worker] Deleted: ${p}`);
            }
        });

        return { audioPublicId };

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
