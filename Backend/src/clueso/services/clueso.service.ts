import fs from 'fs';
import path from 'path';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';
import { CluesoJobModel } from '../models/cluesoJob.model';
import { JobStatus } from '../types/jobStatus';

// Import workers
import { extractAudio } from '../workers/extractAudio.worker';
import { transcribeAudio } from '../workers/transcribe.worker';
import { improveScriptFromS3 } from '../workers/improveScript.worker';
import { generateVoice } from '../workers/generateVoice.worker';
import { renderFinalVideoFromS3 } from '../workers/videoRender.worker';

export class CluesoService {
    /**
     * Orchestrates the full Clueso pipeline for a job
     */
    static async processJob(jobId: string): Promise<void> {
        const job = await CluesoJobModel.findOne({ jobId });
        if (!job) {
            console.error(`[CluesoService] Job ${jobId} not found`);
            return;
        }

        try {
            console.log(`[CluesoService] Starting pipeline for Job ${jobId}`);

            // 1. Extract Audio (Worker now handles S3 upload and local cleanup)
            await this.updateStatus(jobId, 'AUDIO_EXTRACTED');
            const { audioS3Key } = await extractAudio({
                jobId: job.jobId,
                userId: job.userId,
                inputVideoS3Key: job.inputVideoS3Key,
            });

            job.audioS3Key = audioS3Key;
            await job.save();

            // 2. Transcription (Needs local file, so we download from S3)
            await this.updateStatus(jobId, 'TRANSCRIBED');
            const localAudioPath = await this.downloadFromS3(audioS3Key, `${jobId}.wav`);
            const transcript = await transcribeAudio({ localAudioPath });

            // Upload transcript artifact
            const transcriptKey = `clueso/transcript/${job.userId}/${job.jobId}.txt`;
            await this.uploadContentToS3(transcript, transcriptKey, 'text/plain');
            job.transcriptS3Key = transcriptKey;

            // 3. Mark as COMPLETED immediately (New requirement: Transcription is the bar for success)
            job.status = 'COMPLETED';
            await job.save();
            console.log(`[CluesoService] Job ${jobId} marked as COMPLETED after transcription`);

            // Cleanup local audio after transcription
            this.cleanup(localAudioPath);

            // 4. Bonus Steps (Optional/Non-blocking)
            // We wrap these in a nested try/catch so they don't fail the job if they error
            try {
                let improvedScriptContent = transcript;
                if (env.ENABLE_SCRIPT_IMPROVEMENT) {
                    // 4a. Script Improvement (Optional)
                    await this.updateStatus(jobId, 'SCRIPT_IMPROVED'); // Visual feedback only
                    try {
                        const improvedScript = await improveScriptFromS3({
                            jobId,
                            userId: job.userId,
                            transcriptS3Key: transcriptKey
                        });

                        improvedScriptContent = JSON.stringify(improvedScript);
                        const improvedScriptKey = `clueso/script/${job.userId}/${job.jobId}.txt`;
                        await this.uploadContentToS3(improvedScriptContent, improvedScriptKey, 'text/plain');

                        job.improvedScriptS3Key = improvedScriptKey;
                        await job.save();
                    } catch (error) {
                        console.error(`[CluesoService] Script improvement skipped for Job ${jobId}:`, error);
                    }
                } else {
                    console.log(`[CluesoService] Script improvement disabled by feature flag for Job ${jobId}.`);
                }


                // 4b. Voiceover Generation
                await this.updateStatus(jobId, 'VOICE_GENERATED');
                const localVoicePath = await generateVoice({ jobId, text: improvedScriptContent });

                const aiVoiceKey = `clueso/voice/${job.userId}/${job.jobId}.mp3`;
                await this.uploadToS3(localVoicePath, aiVoiceKey, 'audio/mpeg');
                job.aiVoiceS3Key = aiVoiceKey;
                await job.save();

                // 4c. Final Video Render
                await this.updateStatus(jobId, 'VIDEO_MERGED');
                const { renderedVideoS3Key } = await renderFinalVideoFromS3({
                    jobId,
                    userId: job.userId,
                    originalVideoS3Key: job.inputVideoS3Key,
                    voiceoverS3Key: job.aiVoiceS3Key
                });

                job.finalVideoS3Key = renderedVideoS3Key;
                await job.save();

                // Final status update to COMPLETED (redundant but ensures the last state is correct)
                await this.updateStatus(jobId, 'COMPLETED');
                console.log(`[CluesoService] Bonus steps for Job ${jobId} finished successfully`);

                // Cleanup temp files
                this.cleanup(localVoicePath);

            } catch (bonusError) {
                console.error(`[CluesoService] Bonus steps failed for Job ${jobId} (Post-Completion):`, bonusError);
                // We DON'T set job status to FAILED here because the primary goal (transcription) succeeded.
            }

        } catch (error) {
            console.error(`[CluesoService] Pipeline failure for Job ${jobId}:`, error);

            // Only mark as FAILED if transcription wasn't completed
            // (A successfully uploaded transcript guarantees COMPLETED status)
            const latestJob = await CluesoJobModel.findOne({ jobId });
            if (latestJob && latestJob.status !== 'COMPLETED') {
                latestJob.status = 'FAILED';
                latestJob.errorMessage = error instanceof Error ? error.message : 'Unknown fatal pipeline error';
                await latestJob.save();
                console.log(`[CluesoService] Job ${jobId} marked as FAILED due to fatal error`);
            } else {
                console.log(`[CluesoService] Error occurred for Job ${jobId}, but status remains COMPLETED (Transcription was successful)`);
            }
        }

    }

    private static async updateStatus(jobId: string, status: JobStatus) {
        await CluesoJobModel.updateOne({ jobId }, { status });
    }

    private static async uploadToS3(localPath: string, key: string, contentType: string) {
        console.log(`[CluesoService] Uploading artifact to S3: ${key}`);
        const stream = fs.createReadStream(localPath);
        const command = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: stream,
            ContentType: contentType,
        });
        await s3Client.send(command);
    }

    private static async uploadContentToS3(content: string, key: string, contentType: string) {
        console.log(`[CluesoService] Uploading text artifact to S3: ${key}`);
        const command = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: content,
            ContentType: contentType,
        });
        await s3Client.send(command);
    }

    private static async downloadFromS3(key: string, localFilename: string): Promise<string> {
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const localPath = path.join(tempDir, localFilename);
        console.log(`[CluesoService] Downloading from S3: ${key} -> ${localPath}`);

        const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        const response = await s3Client.send(command);
        if (!response.Body) throw new Error('S3 body is empty');

        const writeStream = fs.createWriteStream(localPath);
        // @ts-ignore
        await pipeline(response.Body as Readable, writeStream);

        return localPath;
    }

    private static cleanup(...paths: string[]) {
        paths.forEach(p => {
            if (fs.existsSync(p)) {
                try {
                    fs.unlinkSync(p);
                    console.log(`[CluesoService] Cleaned up: ${p}`);
                } catch (e) {
                    console.error(`[CluesoService] Cleanup failed for ${p}:`, e);
                }
            }
        });
    }
}
