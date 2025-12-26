import { Request, Response } from 'express';
import { JobLifecycleService } from '../services/jobLifecycle.service';
import { renderFinalVideoFromS3 } from '../workers/videoRender.worker';

/**
 * Controller to handle final video rendering requests.
 * Merges the original video with the generated AI voiceover.
 */
export const handleVideoRendering = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { jobId } = req.body;

    // 1. Require Clerk authentication
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2. Accept jobId from request body
    if (!jobId) {
        return res.status(400).json({ message: 'jobId is required in request body' });
    }

    try {
        // 3. Validate the job exists
        const job = JobLifecycleService.getJob(jobId);
        if (!job) {
            return res.status(404).json({ message: `Job ${jobId} not found` });
        }

        // 4. Ensure job.userId matches authenticated user
        if (job.userId && job.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this job' });
        }

        // 5. Ensure job.status === VOICE_GENERATED
        // This is the stage where the AI voiceover is ready.
        if (job.status !== 'VOICE_GENERATED') {
            return res.status(400).json({
                message: `Invalid job status: ${job.status}. Expected: VOICE_GENERATED`
            });
        }

        // 6. Resolve required inputs
        const originalVideoS3Key = job.videoS3Key; // Assuming original video is stored here
        const voiceoverS3Key = job.voiceoverS3Key;

        if (!originalVideoS3Key || !voiceoverS3Key) {
            return res.status(400).json({
                message: 'Missing required artifacts (video or voiceover) for rendering'
            });
        }

        console.log(`[VideoRenderController] Starting final rendering for Job ${jobId}`);

        // 7. Invoke videoRender.worker
        const { renderedVideoS3Key, renderedVideoAsset } = await renderFinalVideoFromS3({
            jobId,
            userId,
            originalVideoS3Key,
            voiceoverS3Key,
        });

        // 8. Call updateJobAfterVideoRender
        await JobLifecycleService.updateJobAfterVideoRender(jobId, renderedVideoAsset);

        // 9. Return JSON response
        return res.status(200).json({
            jobId,
            status: "VIDEO_RENDERED",
            renderedVideoS3Key
        });

    } catch (error) {
        console.error(`[VideoRenderController] Video rendering failed for Job ${jobId}:`, error);
        return res.status(500).json({
            message: 'Internal server error during video rendering',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
