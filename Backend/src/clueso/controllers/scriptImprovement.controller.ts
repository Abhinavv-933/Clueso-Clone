import { Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';
import { JobLifecycleService } from '../services/jobLifecycle.service';
import { improveScriptFromS3 } from '../workers/improveScript.worker';

/**
 * Controller to handle script improvement requests.
 * Uses LLM (Ollama) to clean up raw transcripts into polished scripts.
 */
export const handleScriptImprovement = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
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
        const improvedScript = await improveScriptFromS3({
            jobId,
            userId,
            transcriptS3Key: job.transcriptS3Key,
        });

        // 7. Upload improved script JSON to S3
        const improvedScriptS3Key = `clueso/scripts/${userId}/${jobId}.json`;
        console.log(`[ScriptImprovementController] Uploading improved script to S3: ${improvedScriptS3Key}`);

        const putCommand = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: improvedScriptS3Key,
            Body: JSON.stringify(improvedScript),
            ContentType: 'application/json',
        });
        await s3Client.send(putCommand);

        // 8. Call updateJobAfterScriptImprovement
        await JobLifecycleService.updateJobAfterScriptImprovement(jobId, improvedScriptS3Key);

        // 9. Return JSON response
        return res.status(200).json({
            jobId,
            status: "SCRIPT_IMPROVED",
            improvedScriptS3Key
        });

    } catch (error) {
        console.error(`[ScriptImprovementController] Script improvement failed for Job ${jobId}:`, error);
        return res.status(500).json({
            message: 'Internal server error during script improvement',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
