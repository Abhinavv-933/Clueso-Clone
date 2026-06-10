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
import { transcribeAudioFromS3 } from '../workers/transcribeAudio.worker';
import { improveScriptFromS3 } from '../workers/improveScript.worker';
import { generateVoice } from '../workers/generateVoice.worker';
import { renderFinalVideoFromS3 } from '../workers/videoRender.worker';
import { JobLifecycleService } from './jobLifecycle.service';

export class CluesoService {
    /**
     * Orchestrates the full Clueso pipeline for a job
     */
    static async processJob(jobId: string): Promise<void> {
        try {
            console.log(`[CluesoService] Starting background pipeline for Job ${jobId}`);

            const job = await CluesoJobModel.findOne({ jobId });
            if (!job) {
                console.error(`[CluesoService] Job ${jobId} not found at start of processJob`);
                return;
            }

            // 1. Extract Audio
            console.log(`[CluesoService] [Step 1/4] Initiating audio extraction for Job ${jobId}...`);
            const { audioS3Key } = await extractAudio({
                jobId: job.jobId,
                userId: job.userId,
                inputVideoS3Key: job.inputVideoS3Key,
            });

            console.log(`[CluesoService] [Step 1/4] Audio extraction successful for Job ${jobId}. Key: ${audioS3Key}`);

            // Explicitly persist Audio S3 Key and New Status
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    status: 'AUDIO_EXTRACTED',
                    audioS3Key,
                    updatedAt: new Date()
                }
            );
            await JobLifecycleService.updateJobAfterAudioExtraction(jobId, audioS3Key);

            // 2. Transcription (Detached workflow starts here)
            // We move all subsequent steps into a try/catch block to ensure status handles failures
            console.log(`[CluesoService] [Step 2/4] Moving to TRANSCRIBING for Job ${jobId}...`);
            await CluesoJobModel.updateOne({ jobId }, { status: 'TRANSCRIBING', updatedAt: new Date() });

            // Proceed with transcription
            console.log(`[CluesoService] [Step 2/4] Invoking transcription provider for Job ${jobId}...`);
            const { transcriptS3Key, transcript } = await transcribeAudioFromS3({
                jobId: job.jobId,
                userId: job.userId,
                audioS3Key: audioS3Key,
            });

            console.log(`[CluesoService] [Step 2/4] Provider response received for Job ${jobId}. Length: ${transcript.length}`);

            // Persist results explicitly before updating status
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    transcriptS3Key,
                    transcriptText: transcript,
                    updatedAt: new Date()
                }
            );

            // Finalize transcription status
            await CluesoJobModel.updateOne({ jobId }, { status: 'TRANSCRIBED', updatedAt: new Date() });
            await JobLifecycleService.updateJobAfterTranscription(jobId, transcriptS3Key);
            console.log(`[CluesoService] [Step 3/4] Job marked as TRANSCRIBED: ${jobId}`);

            // 3. Mark as COMPLETED
            await CluesoJobModel.updateOne({ jobId }, { status: 'COMPLETED', updatedAt: new Date() });
            console.log(`[CluesoService] [Step 4/4] Job ${jobId} reached terminal success state: COMPLETED.`);

            // 4. Bonus Steps (Non-blocking)
            this.runBonusSteps(jobId, job.userId, job.inputVideoS3Key, transcript, transcriptS3Key).catch(err => {
                console.error(`[CluesoService] Bonus steps failed (non-fatal) for Job ${jobId}:`, err);
            });

        } catch (error) {
            console.error(`[CluesoService] FATAL pipeline failure for Job ${jobId}:`, error);

            const errorMessage = error instanceof Error ? error.message : 'Unknown fatal pipeline error';
            await CluesoJobModel.updateOne(
                { jobId, status: { $ne: 'COMPLETED' } },
                {
                    status: 'FAILED',
                    errorMessage,
                    updatedAt: new Date()
                }
            );
            console.log(`[CluesoService] Job ${jobId} safely marked as FAILED`);
        }
    }

    /**
     * Handles non-essential steps like script improvement and voiceover generation
     */
    private static async runBonusSteps(
        jobId: string,
        userId: string,
        inputVideoS3Key: string,
        transcript: string,
        transcriptS3Key: string
    ) {
        try {
            let improvedScriptContent = transcript;

            if (env.ENABLE_SCRIPT_IMPROVEMENT) {
                console.log(`[CluesoService] [Bonus] Improving script for Job ${jobId}...`);
                await this.updateStatus(jobId, 'SCRIPT_IMPROVED');

                const improvedScript = await improveScriptFromS3({
                    jobId,
                    userId,
                    transcriptS3Key
                });

                improvedScriptContent = JSON.stringify(improvedScript);
                const improvedScriptKey = `clueso/script/${userId}/${jobId}.txt`;
                await this.uploadContentToS3(improvedScriptContent, improvedScriptKey, 'text/plain');

                await CluesoJobModel.updateOne({ jobId }, { improvedScriptS3Key: improvedScriptKey });
            }

            // Voiceover Generation
            console.log(`[CluesoService] [Bonus] Generating voiceover for Job ${jobId}...`);
            await this.updateStatus(jobId, 'VOICE_GENERATED');
            const localVoicePath = await generateVoice({ jobId, text: improvedScriptContent });

            const aiVoiceKey = `clueso/voice/${userId}/${jobId}.mp3`;
            await this.uploadToS3(localVoicePath, aiVoiceKey, 'audio/mpeg');
            await CluesoJobModel.updateOne({ jobId }, { aiVoiceS3Key: aiVoiceKey });

            // Final Video Render
            console.log(`[CluesoService] [Bonus] Rendering final video for Job ${jobId}...`);
            await this.updateStatus(jobId, 'VIDEO_MERGED');
            const { renderedVideoS3Key } = await renderFinalVideoFromS3({
                jobId,
                userId,
                originalVideoS3Key: inputVideoS3Key,
                voiceoverS3Key: aiVoiceKey
            });

            await CluesoJobModel.updateOne({ jobId }, { finalVideoS3Key: renderedVideoS3Key });
            await this.updateStatus(jobId, 'COMPLETED');

            console.log(`[CluesoService] [Bonus] All extra steps finalized for Job ${jobId}`);
            this.cleanup(localVoicePath);

        } catch (error) {
            console.error(`[CluesoService] [Bonus] Partial failure for Job ${jobId}:`, error);
        }
    }


    private static async updateStatus(jobId: string, status: JobStatus) {
        await CluesoJobModel.updateOne({ jobId }, { status, updatedAt: new Date() });
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
