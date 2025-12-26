import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CluesoJobModel } from '../models/cluesoJob.model';
import { extractAudio } from '../workers/extractAudio.worker';
import { JobLifecycleService } from '../services/jobLifecycle.service';

const extractAudioSchema = z.object({
    jobId: z.string().min(1),
});

/**
 * Controller for triggering the audio extraction step manually.
 */
export const triggerAudioExtraction = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const parsed = extractAudioSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid request body', errors: parsed.error });
        }

        const { jobId } = parsed.data;

        // 1. Validate job existence and ownership
        const job = await CluesoJobModel.findOne({ jobId, userId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or access denied' });
        }

        console.log(`[AudioExtractionController] Triggering extraction for Job ${jobId}`);

        // 2. Invoke worker (AWAITED for this specific endpoint behavior)
        const { audioS3Key } = await extractAudio({
            jobId: job.jobId,
            userId: job.userId,
            inputVideoS3Key: job.inputVideoS3Key,
        });

        // 3. Update status using lifecycle service
        await JobLifecycleService.updateJobAfterAudioExtraction(jobId, audioS3Key);

        // 4. Return response
        return res.status(200).json({
            jobId,
            status: "AUDIO_EXTRACTED",
            audioS3Key
        });

    } catch (error) {
        console.error(`[AudioExtractionController] Failed:`, error);
        next(error);
    }
};
