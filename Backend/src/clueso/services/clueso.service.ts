import fs from 'fs';
import path from 'path';
import { uploadFileToCloudinary, uploadContentToCloudinary, getResourceTypeForMime } from '../../config/cloudinary';
import { env } from '../../config/env';
import { CluesoJobModel } from '../models/cluesoJob.model';
import { UploadModel } from '../../models/upload.model';
import { JobStatus } from '../types/jobStatus';

// Import workers
import { transcribeVideo } from '../workers/transcribeVideo.worker';
import { improveScriptFromCloudinary } from '../workers/improveScript.worker';
import { generateVoice } from '../workers/generateVoice.worker';
import { renderFinalVideoFromCloudinary } from '../workers/videoRender.worker';

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

            // 1. Transcription (download from Cloudinary -> maybe FFmpeg -> Groq Whisper, merged worker)
            const upload = await UploadModel.findOne({ _id: job.inputUploadId });
            if (!upload) {
                throw new Error(`Upload ${job.inputUploadId} not found for Job ${jobId}`);
            }
            const resourceType = getResourceTypeForMime(upload.fileType);
            const originalExtension = path.extname(upload.fileName) || '.mp4';

            console.log(`[CluesoService] [Step 1/3] Starting transcription for Job ${jobId}...`);
            await CluesoJobModel.updateOne({ jobId }, { status: 'TRANSCRIBING', updatedAt: new Date() });

            const { text: transcript, segments, usedFfmpeg } = await transcribeVideo(
                job.inputVideoPublicId,
                resourceType,
                originalExtension
            );

            console.log(`[CluesoService] [Step 1/3] Transcription complete for Job ${jobId} (ffmpeg used: ${usedFfmpeg}). Length: ${transcript.length}`);

            // Bonus steps (script improvement) still read the transcript back from
            // Cloudinary by public_id, so keep publishing it there for compatibility.
            const transcriptPublicId = `clueso/transcripts/${job.userId}/${jobId}`;
            await uploadContentToCloudinary(transcript, transcriptPublicId);

            // Persist results explicitly before updating status
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    transcriptPublicId,
                    transcriptText: transcript,
                    segments: segments ?? [],
                    updatedAt: new Date()
                }
            );

            // Finalize transcription status
            await CluesoJobModel.updateOne({ jobId }, { status: 'TRANSCRIBED', updatedAt: new Date() });
            console.log(`[CluesoService] [Step 2/3] Job marked as TRANSCRIBED: ${jobId}`);

            // 2. Mark as COMPLETED
            await CluesoJobModel.updateOne({ jobId }, { status: 'COMPLETED', updatedAt: new Date() });
            console.log(`[CluesoService] [Step 3/3] Job ${jobId} reached terminal success state: COMPLETED.`);

            // 3. Bonus Steps (Non-blocking)
            this.runBonusSteps(jobId, job.userId, job.inputVideoPublicId, transcript, transcriptPublicId).catch(err => {
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
        inputVideoPublicId: string,
        transcript: string,
        transcriptPublicId: string
    ) {
        try {
            let improvedScriptContent = transcript;

            if (env.ENABLE_SCRIPT_IMPROVEMENT) {
                console.log(`[CluesoService] [Bonus] Improving script for Job ${jobId}...`);
                await this.updateStatus(jobId, 'SCRIPT_IMPROVED');

                const improvedScript = await improveScriptFromCloudinary({
                    jobId,
                    userId,
                    transcriptPublicId
                });

                improvedScriptContent = JSON.stringify(improvedScript);
                const improvedScriptPublicId = `clueso/script/${userId}/${jobId}`;
                await uploadContentToCloudinary(improvedScriptContent, improvedScriptPublicId);

                await CluesoJobModel.updateOne({ jobId }, { improvedScriptPublicId });
            }

            // Voiceover Generation
            console.log(`[CluesoService] [Bonus] Generating voiceover for Job ${jobId}...`);
            await this.updateStatus(jobId, 'VOICE_GENERATED');
            const localVoicePath = await generateVoice({ jobId, text: improvedScriptContent });

            let aiVoicePublicId: string | undefined;
            if (localVoicePath) {
                aiVoicePublicId = `clueso/voice/${userId}/${jobId}`;
                await uploadFileToCloudinary(localVoicePath, aiVoicePublicId, 'video');
                await CluesoJobModel.updateOne({ jobId }, { aiVoicePublicId });
            } else {
                console.log(`[CluesoService] [Bonus] Voiceover is stubbed for Job ${jobId}; skipping Cloudinary upload.`);
                await CluesoJobModel.updateOne({ jobId }, { voiceoverStubbed: true });
            }

            // Final Video Render (requires a real voiceover to merge in)
            if (aiVoicePublicId) {
                console.log(`[CluesoService] [Bonus] Rendering final video for Job ${jobId}...`);
                await this.updateStatus(jobId, 'VIDEO_MERGED');
                const { renderedVideoPublicId } = await renderFinalVideoFromCloudinary({
                    jobId,
                    userId,
                    originalVideoPublicId: inputVideoPublicId,
                    voiceoverPublicId: aiVoicePublicId
                });

                await CluesoJobModel.updateOne({ jobId }, { finalVideoPublicId: renderedVideoPublicId });
                if (localVoicePath) this.cleanup(localVoicePath);
            } else {
                console.log(`[CluesoService] [Bonus] Skipping final video render for Job ${jobId} (voiceover stubbed).`);
            }

            await this.updateStatus(jobId, 'COMPLETED');
            console.log(`[CluesoService] [Bonus] All extra steps finalized for Job ${jobId}`);

        } catch (error) {
            console.error(`[CluesoService] [Bonus] Partial failure for Job ${jobId}:`, error);
        }
    }


    private static async updateStatus(jobId: string, status: JobStatus) {
        await CluesoJobModel.updateOne({ jobId }, { status, updatedAt: new Date() });
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
