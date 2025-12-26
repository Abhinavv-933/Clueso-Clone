import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';
import { VideoRenderedAsset } from '../../../../shared';

interface VideoRenderWorkerInput {
    jobId: string;
    userId: string;
    originalVideoS3Key: string;
    voiceoverS3Key: string;
}

interface VideoRenderWorkerOutput {
    renderedVideoS3Key: string;
    renderedVideoAsset: VideoRenderedAsset;
}

/**
 * Worker to render the final video by merging the original visuals with the AI voiceover.
 * Uses FFmpeg for efficient audio swapping and ffprobe for metadata extraction.
 */
export const renderFinalVideoFromS3 = async ({
    jobId,
    userId,
    originalVideoS3Key,
    voiceoverS3Key,
}: VideoRenderWorkerInput): Promise<VideoRenderWorkerOutput> => {
    console.log(`[VideoRenderWorker] Starting final render for Job ${jobId}`);

    const tempDir = path.join(process.cwd(), 'temp', 'renders', jobId);
    const localVideoInput = path.join(tempDir, 'input_video.mp4');
    const audioExtension = path.extname(voiceoverS3Key) || '.mp3';
    const localAudioInput = path.join(tempDir, `voiceover${audioExtension}`);
    const localVideoOutput = path.join(tempDir, 'final.mp4');

    try {
        // 1. Setup temp directory
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 2. Download inputs from S3
        console.log(`[VideoRenderWorker] Downloading original video and voiceover...`);
        const downloadFile = async (key: string, localPath: string) => {
            const command = new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET_NAME, Key: key });
            const response = await s3Client.send(command);
            if (!response.Body) throw new Error(`Empty body for ${key}`);
            await pipeline(response.Body as Readable, fs.createWriteStream(localPath));
        };

        await Promise.all([
            downloadFile(originalVideoS3Key, localVideoInput),
            downloadFile(voiceoverS3Key, localAudioInput)
        ]);

        // 3. Execute FFmpeg to merge
        console.log(`[VideoRenderWorker] Executing FFmpeg...`);
        await new Promise<void>((resolve, reject) => {
            // Strategy from docs/ffmpeg-strategy.md
            // -c:v copy preserves quality and is extremely fast
            const ffmpeg = spawn('ffmpeg', [
                '-y',
                '-i', localVideoInput,
                '-i', localAudioInput,
                '-map', '0:v:0',
                '-map', '1:a:0',
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-b:a', '192k',
                '-shortest',
                localVideoOutput
            ]);

            let stderr = '';
            ffmpeg.stderr.on('data', (data) => stderr += data.toString());

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log(`[VideoRenderWorker] FFmpeg render successful`);
                    resolve();
                } else {
                    console.error(`[VideoRenderWorker] FFmpeg failed with code ${code}. Stderr: ${stderr}`);
                    reject(new Error(`FFmpeg failed with code ${code}`));
                }
            });

            ffmpeg.on('error', (err) => reject(new Error(`Failed to spawn FFmpeg: ${err.message}`)));
        });

        // 4. Extract metadata using ffprobe
        console.log(`[VideoRenderWorker] Extracting metadata via ffprobe...`);
        const metadata = await new Promise<{ duration: number; width: number; height: number; fps: number }>((resolve, reject) => {
            const ffprobe = spawn('ffprobe', [
                '-v', 'error',
                '-select_streams', 'v:0',
                '-show_entries', 'stream=width,height,avg_frame_rate,duration',
                '-of', 'json',
                localVideoOutput
            ]);

            let stdout = '';
            ffprobe.stdout.on('data', (data) => stdout += data.toString());

            ffprobe.on('close', (code) => {
                if (code === 0) {
                    try {
                        const data = JSON.parse(stdout);
                        const stream = data.streams[0];

                        // Parse fps (e.g., "30/1" or "24000/1001")
                        const fpsParts = stream.avg_frame_rate.split('/');
                        const fps = fpsParts.length === 2 ? parseFloat(fpsParts[0]) / parseFloat(fpsParts[1]) : 0;

                        resolve({
                            duration: parseFloat(stream.duration) || 0,
                            width: stream.width,
                            height: stream.height,
                            fps: Math.round(fps * 100) / 100
                        });
                    } catch (e) {
                        reject(new Error('Failed to parse ffprobe output'));
                    }
                } else {
                    reject(new Error(`ffprobe failed with code ${code}`));
                }
            });
        });

        // 5. Upload to S3
        const renderedVideoS3Key = `clueso/rendered-videos/${userId}/${jobId}/final.mp4`;
        console.log(`[VideoRenderWorker] Uploading rendered video to S3: ${renderedVideoS3Key}`);

        const uploadStream = fs.createReadStream(localVideoOutput);
        const putCommand = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: renderedVideoS3Key,
            Body: uploadStream,
            ContentType: 'video/mp4',
        });

        await s3Client.send(putCommand);

        // 6. Build Rendered Asset object
        const renderedVideoAsset: VideoRenderedAsset = {
            id: `rv_${jobId}_${Date.now()}`,
            projectId: 'pending', // Usually passed in or extracted from job, placeholder for pure worker logic
            jobId: jobId,
            input: {
                originalVideoS3Key,
                voiceoverS3Key,
            },
            output: {
                renderedVideoS3Key,
                format: 'mp4',
            },
            metadata: {
                durationSeconds: metadata.duration,
                resolution: `${metadata.width}x${metadata.height}`,
                fps: metadata.fps,
            },
            createdAt: new Date(),
        };

        return {
            renderedVideoS3Key,
            renderedVideoAsset,
        };

    } catch (error) {
        console.error(`[VideoRenderWorker] Failed to process video rendering:`, error);
        throw error;
    } finally {
        // 7. Cleanup
        console.log(`[VideoRenderWorker] Cleaning up temporary files...`);
        [localVideoInput, localAudioInput, localVideoOutput].forEach(f => {
            if (fs.existsSync(f)) try { fs.unlinkSync(f); } catch (e) { }
        });
        if (fs.existsSync(tempDir)) try { fs.rmdirSync(tempDir); } catch (e) { }
    }
};
