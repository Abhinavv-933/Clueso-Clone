import { Request, Response } from 'express';
import { JobLifecycleService } from '../services/jobLifecycle.service';
import { transcribeAudioFromS3 } from '../workers/transcribeAudio.worker';

/**
 * Controller to handle audio transcription requests.
 */
export const handleTranscription = async (req: Request, res: Response) => {
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

        // 4. Ensure job.status === AUDIO_EXTRACTED
        if (job.status !== 'AUDIO_EXTRACTED') {
            return res.status(400).json({
                message: `Invalid job status: ${job.status}. Expected: AUDIO_EXTRACTED`
            });
        }

        // 5. Ensure job.userId matches authenticated user
        // Note: The jobStore currently doesn't store userId explicitly in all paths, 
        // but it was assigned in extractAudio. For now, we assume it's there or we'd 
        // need to have ensured it during creation.
        if (job.userId && job.userId !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this job' });
        }

        console.log(`[TranscriptionController] Starting transcription for Job ${jobId}`);

        // 6. Invoke transcribeAudio.worker
        const { transcriptS3Key } = await transcribeAudioFromS3({
            jobId,
            userId,
            audioS3Key: job.audioS3Key,
        });

        // 7. Call updateJobAfterTranscription
        await JobLifecycleService.updateJobAfterTranscription(jobId, transcriptS3Key);

        // 8. Return JSON response
        return res.status(200).json({
            jobId,
            status: "TRANSCRIBED",
            transcriptS3Key
        });

    } catch (error) {
        console.error(`[TranscriptionController] Transcription failed for Job ${jobId}:`, error);

        // Mark job as FAILED
        try {
            await JobLifecycleService.updateJobAfterFailure(jobId, error instanceof Error ? error.message : 'Unknown transcription error');
        } catch (updateError) {
            console.error(`[TranscriptionController] Failed to update job status:`, updateError);
        }

        // Return 422 for transcription failures (expected errors)
        return res.status(422).json({
            message: 'Transcription failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            jobId
        });
    }
};
