import { Request, Response } from 'express';
import { uploadContentToCloudinary } from '../../config/cloudinary';
import { JobLifecycleService } from '../services/jobLifecycle.service';
import { improveScriptFromCloudinary } from '../workers/improveScript.worker';

/**
 * Controller to handle script improvement requests.
 * Uses Groq's LLM API to clean up raw transcripts into polished scripts.
 */
export const handleScriptImprovement = async (req: Request, res: Response) => {
    const userId = req.auth().userId;
    const { jobId } = req.body;

    // 1. Authenticated
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2. Accept jobId from request body
    if (!jobId) {
        return res.status(400).json({ message: 'jobId is required' });
    }

    try {
        // 3. Validate the job exists
        const job = JobLifecycleService.getJob(jobId);
        if (!job) {
            return res.status(404).json({ message: `Job ${jobId} not found` });
        }

        // 4. Ensure job.status === TRANSCRIBED
        if (job.status !== 'TRANSCRIBED') {
            return res.status(400).json({
                message: `Invalid job status: ${job.status}. Expected: TRANSCRIBED`
            });
        }

        // 5. Ensure job.userId matches authenticated user
        if (job.userId && job.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this job' });
        }

        console.log(`[ScriptImprovementController] Starting script improvement for Job ${jobId}`);

        // 6. Invoke improveScript.worker
        const improvedScript = await improveScriptFromCloudinary({
            jobId,
            userId,
            transcriptPublicId: job.transcriptPublicId,
        });

        // 7. Upload improved script JSON to Cloudinary
        const improvedScriptPublicId = `clueso/scripts/${userId}/${jobId}`;
        console.log(`[ScriptImprovementController] Uploading improved script to Cloudinary: ${improvedScriptPublicId}`);

        await uploadContentToCloudinary(JSON.stringify(improvedScript), improvedScriptPublicId);

        // 8. Call updateJobAfterScriptImprovement
        await JobLifecycleService.updateJobAfterScriptImprovement(jobId, improvedScriptPublicId);

        // 9. Return JSON response
        return res.status(200).json({
            jobId,
            status: "SCRIPT_IMPROVED",
            improvedScriptPublicId
        });

    } catch (error) {
        console.error(`[ScriptImprovementController] Script improvement failed for Job ${jobId}:`, error);
        return res.status(500).json({
            message: 'Internal server error during script improvement',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
