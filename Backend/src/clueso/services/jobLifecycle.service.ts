import { JobStatus } from '../types/jobStatus';
import { VideoRenderedAsset } from '../../../shared';

/**
 * Placeholder for in-memory job storage as requested.
 * Note: Database persistence is handled in CluesoJobModel, but this service 
 * currently implements the transition logic independently.
 */
const jobStore: Record<string, any> = {};

export class JobLifecycleService {
    /**
     * Updates the job state after the audio extraction worker completes successfully.
     * 
     * @param jobId - Unique identifier for the job
     * @param audioPublicId - The Cloudinary public_id where the extracted audio is stored
     */
    static async updateJobAfterAudioExtraction(jobId: string, audioPublicId: string) {
        console.log(`[JobLifecycleService] Updating Job ${jobId} after audio extraction...`);

        // Initialize or retrieve job from mock store
        if (!jobStore[jobId]) {
            jobStore[jobId] = {
                jobId,
                createdAt: new Date(),
            };
        }

        // Apply updates
        jobStore[jobId].status = 'AUDIO_EXTRACTED' as JobStatus;
        jobStore[jobId].audioPublicId = audioPublicId;
        jobStore[jobId].updatedAt = new Date();

        console.log(`[JobLifecycleService] Job ${jobId} status: ${jobStore[jobId].status}`);
        return jobStore[jobId];
    }

    /**
     * Retrieves a job from the in-memory store.
     * 
     * @param jobId - Unique identifier for the job
     */
    static getJob(jobId: string) {
        return jobStore[jobId];
    }

    /**
     * Updates the job state after the transcription worker completes successfully.
     *
     * @param jobId - Unique identifier for the job
     * @param transcriptPublicId - The Cloudinary public_id where the transcript JSON is stored
     */
    static async updateJobAfterTranscription(jobId: string, transcriptPublicId: string) {
        console.log(`[JobLifecycleService] Updating Job ${jobId} after transcription...`);

        if (!jobStore[jobId]) {
            throw new Error(`Job ${jobId} not found in store`);
        }

        // Apply updates to in-memory store
        jobStore[jobId].status = 'TRANSCRIBED' as JobStatus;
        jobStore[jobId].transcriptPublicId = transcriptPublicId;
        jobStore[jobId].updatedAt = new Date();

        // Persist to MongoDB
        try {
            const { CluesoJobModel } = await import('../models/cluesoJob.model');
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    status: 'TRANSCRIBED',
                    transcriptPublicId: transcriptPublicId,
                    updatedAt: new Date()
                }
            );
            console.log(`[JobLifecycleService] Job ${jobId} status persisted to MongoDB: TRANSCRIBED`);
        } catch (dbError) {
            console.error(`[JobLifecycleService] Failed to persist TRANSCRIBED status to MongoDB:`, dbError);
            throw dbError; // Re-throw to ensure caller knows persistence failed
        }

        console.log(`[JobLifecycleService] Job ${jobId} status: ${jobStore[jobId].status}`);
        return jobStore[jobId];
    }

    /**
     * Updates the job state after the script improvement stage completes successfully.
     * 
     * @param jobId - Unique identifier for the job
     * @param improvedScriptPublicId - The Cloudinary public_id where the improved script JSON is stored
     */
    static async updateJobAfterScriptImprovement(jobId: string, improvedScriptPublicId: string) {
        console.log(`[JobLifecycleService] Updating Job ${jobId} after script improvement...`);

        if (!jobStore[jobId]) {
            throw new Error(`Job ${jobId} not found in store`);
        }

        // Apply updates
        jobStore[jobId].status = 'SCRIPT_IMPROVED' as JobStatus;
        jobStore[jobId].improvedScriptPublicId = improvedScriptPublicId;
        jobStore[jobId].updatedAt = new Date();

        console.log(`[JobLifecycleService] Job ${jobId} status: ${jobStore[jobId].status}`);
        return jobStore[jobId];
    }

    /**
     * Updates the job state after the voiceover generation worker completes successfully.
     * 
     * @param jobId - Unique identifier for the job
     * @param voiceoverAssetPublicId - The Cloudinary public_id (or prefix) where the voiceover artifacts are stored
     */
    static async updateJobAfterVoiceover(jobId: string, voiceoverAssetPublicId: string) {
        console.log(`[JobLifecycleService] Updating Job ${jobId} after voiceover generation...`);

        if (!jobStore[jobId]) {
            throw new Error(`Job ${jobId} not found in store`);
        }

        // Apply updates
        jobStore[jobId].status = 'VOICE_GENERATED' as JobStatus;
        jobStore[jobId].voiceoverAssetPublicId = voiceoverAssetPublicId;
        jobStore[jobId].updatedAt = new Date();

        console.log(`[JobLifecycleService] Job ${jobId} status: ${jobStore[jobId].status}`);
        return jobStore[jobId];
    }

    /**
     * Updates the job state after the video rendering worker completes successfully.
     * 
     * @param jobId - Unique identifier for the job
     * @param renderedVideoAsset - The asset metadata returned by the video rendering worker
     */
    static async updateJobAfterVideoRender(jobId: string, renderedVideoAsset: VideoRenderedAsset) {
        console.log(`[JobLifecycleService] Updating Job ${jobId} after video rendering...`);

        if (!jobStore[jobId]) {
            throw new Error(`Job ${jobId} not found in store`);
        }

        // Apply updates
        jobStore[jobId].status = 'VIDEO_RENDERED' as JobStatus;
        jobStore[jobId].renderedVideoPublicId = renderedVideoAsset.output.renderedVideoPublicId;

        // Persist technical metadata
        jobStore[jobId].durationSeconds = renderedVideoAsset.metadata.durationSeconds;
        jobStore[jobId].resolution = renderedVideoAsset.metadata.resolution;
        if (renderedVideoAsset.metadata.fps) {
            jobStore[jobId].fps = renderedVideoAsset.metadata.fps;
        }

        jobStore[jobId].updatedAt = new Date();

        console.log(`[JobLifecycleService] Job ${jobId} status: ${jobStore[jobId].status}`);
        return jobStore[jobId];
    }

    /**
     * Updates the job state after a failure occurs.
     * 
     * @param jobId - Unique identifier for the job
     * @param errorMessage - The error message describing the failure
     */
    static async updateJobAfterFailure(jobId: string, errorMessage: string) {
        console.log(`[JobLifecycleService] Marking Job ${jobId} as FAILED...`);

        if (!jobStore[jobId]) {
            console.warn(`[JobLifecycleService] Job ${jobId} not found in store, cannot mark as FAILED`);
            return null;
        }

        // Apply updates to in-memory store
        jobStore[jobId].status = 'FAILED' as JobStatus;
        jobStore[jobId].errorMessage = errorMessage;
        jobStore[jobId].updatedAt = new Date();

        // Persist to MongoDB
        try {
            const { CluesoJobModel } = await import('../models/cluesoJob.model');
            await CluesoJobModel.updateOne(
                { jobId },
                {
                    status: 'FAILED',
                    errorMessage: errorMessage,
                    updatedAt: new Date()
                }
            );
            console.log(`[JobLifecycleService] Job ${jobId} status persisted to MongoDB: FAILED`);
        } catch (dbError) {
            console.error(`[JobLifecycleService] Failed to persist FAILED status to MongoDB:`, dbError);
        }

        console.log(`[JobLifecycleService] Job ${jobId} status: FAILED. Error: ${errorMessage}`);
        return jobStore[jobId];
    }
}
