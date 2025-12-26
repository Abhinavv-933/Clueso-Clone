import { Request, Response } from 'express';
import { JobLifecycleService } from '../services/jobLifecycle.service';
import { generateVoiceoverFromS3 } from '../workers/voiceover.worker';

/**
 * Controller to handle voiceover generation requests.
 * Triggers the Piper TTS pipeline for an improved script.
 */
export const handleVoiceoverGeneration = async (req: Request, res: Response) => {
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

        // 5. Ensure job.status === SCRIPT_IMPROVED
        if (job.status !== 'SCRIPT_IMPROVED') {
            return res.status(400).json({
                message: `Invalid job status: ${job.status}. Expected: SCRIPT_IMPROVED`
            });
        }

        console.log(`[VoiceoverController] Starting voiceover generation for Job ${jobId}`);

        // 6. Invoke voiceover.worker
        const { voiceoverPrefixS3Key } = await generateVoiceoverFromS3({
            jobId,
            userId,
            improvedScriptS3Key: job.improvedScriptS3Key,
        });

        // 7. Call updateJobAfterVoiceover
        await JobLifecycleService.updateJobAfterVoiceover(jobId, voiceoverPrefixS3Key);

        // 8. Return JSON response
        return res.status(200).json({
            jobId,
            status: "VOICE_GENERATED",
            voiceoverPrefixS3Key
        });

    } catch (error) {
        console.error(`[VoiceoverController] Voiceover generation failed for Job ${jobId}:`, error);
        return res.status(500).json({
            message: 'Internal server error during voiceover generation',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
