import fs from 'fs';
import { uploadFileToCloudinary, uploadContentToCloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import { CluesoJobModel } from '../models/cluesoJob.model';
import { JobStatus } from '../types/jobStatus';

// Import workers
import { extractAudio } from '../workers/extractAudio.worker';
import { transcribeAudioFromCloudinary } from '../workers/transcribeAudio.worker';
import { improveScriptFromCloudinary } from '../workers/improveScript.worker';
import { generateVoice } from '../workers/generateVoice.worker';
import { renderFinalVideoFromCloudinary } from '../workers/videoRender.worker';
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
            const { audioPublicId } = await extractAudio({
                jobId: job.jobId,
                userId: job.userId,
                inputVideoPublicId: job.inputVideoPublicId,
            });

            console.log(`[CluesoService] [Step 1/4] Audio extraction successful for Job ${jobId}. Key: ${audioPublicId}`);

            // Explicitly persist Audio public_id and New Status
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    status: 'AUDIO_EXTRACTED',
                    audioPublicId,
                    updatedAt: new Date()
                }
            );
            await JobLifecycleService.updateJobAfterAudioExtraction(jobId, audioPublicId);

            // 2. Transcription (Detached workflow starts here)
            // We move all subsequent steps into a try/catch block to ensure status handles failures
            console.log(`[CluesoService] [Step 2/4] Moving to TRANSCRIBING for Job ${jobId}...`);
            await CluesoJobModel.updateOne({ jobId }, { status: 'TRANSCRIBING', updatedAt: new Date() });

            // Proceed with transcription
            console.log(`[CluesoService] [Step 2/4] Invoking transcription provider for Job ${jobId}...`);
            const { transcriptPublicId, transcript } = await transcribeAudioFromCloudinary({
                jobId: job.jobId,
                userId: job.userId,
                audioPublicId: audioPublicId,
            });

            console.log(`[CluesoService] [Step 2/4] Provider response received for Job ${jobId}. Length: ${transcript.length}`);

            // Persist results explicitly before updating status
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    transcriptPublicId,
                    transcriptText: transcript,
                    updatedAt: new Date()
                }
            );

            // Finalize transcription status
            await CluesoJobModel.updateOne({ jobId }, { status: 'TRANSCRIBED', updatedAt: new Date() });
            await JobLifecycleService.updateJobAfterTranscription(jobId, transcriptPublicId);
            console.log(`[CluesoService] [Step 3/4] Job marked as TRANSCRIBED: ${jobId}`);

            // 3. Mark as COMPLETED
            await CluesoJobModel.updateOne({ jobId }, { status: 'COMPLETED', updatedAt: new Date() });
            console.log(`[CluesoService] [Step 4/4] Job ${jobId} reached terminal success state: COMPLETED.`);

            // 4. Bonus Steps (Non-blocking)
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

            const aiVoicePublicId = `clueso/voice/${userId}/${jobId}`;
            await uploadFileToCloudinary(localVoicePath, aiVoicePublicId, 'video');
            await CluesoJobModel.updateOne({ jobId }, { aiVoicePublicId });

            // Final Video Render
            console.log(`[CluesoService] [Bonus] Rendering final video for Job ${jobId}...`);
            await this.updateStatus(jobId, 'VIDEO_MERGED');
            const { renderedVideoPublicId } = await renderFinalVideoFromCloudinary({
                jobId,
                userId,
                originalVideoPublicId: inputVideoPublicId,
                voiceoverPublicId: aiVoicePublicId
            });

            await CluesoJobModel.updateOne({ jobId }, { finalVideoPublicId: renderedVideoPublicId });
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
