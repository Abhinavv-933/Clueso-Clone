import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { UploadModel } from '../../models/upload.model';
import { CluesoJobModel } from '../models/cluesoJob.model';
import { CluesoService } from '../services/clueso.service';

const createJobSchema = z.object({
    uploadId: z.string().min(1),
    projectId: z.string().optional(),
});

export const createJob = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const parsed = createJobSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid request body', errors: parsed.error });
        }

        const { uploadId, projectId } = parsed.data;

        // Validate ownership of the upload
        const upload = await UploadModel.findOne({ _id: uploadId, userId });
        if (!upload) {
            return res.status(404).json({ message: 'Upload not found or access denied' });
        }

        if (upload.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Upload is not yet complete' });
        }

        const jobId = randomUUID();

        // Save to database
        const job = await CluesoJobModel.create({
            jobId,
            userId,
            projectId,
            inputUploadId: uploadId,
            inputVideoS3Key: upload.fileKey,
            status: 'UPLOADED',
        });

        // Trigger processing asynchronously
        // We do NOT await this, as we want to return the jobId immediately
        CluesoService.processJob(jobId).catch((err) => {
            console.error(`[Controller] Background processing failed to start for ${jobId}:`, err);
        });

        return res.status(201).json({
            jobId,
            uploadId,
            inputVideoS3Key: job.inputVideoS3Key,
            status: job.status,
        });

    } catch (error) {
        next(error);
    }
};

export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const { jobId } = req.params;

        if (!userId) {
            return res.status(401).json({ status: 'FAILED', error: 'Unauthorized' });
        }

        const job = await CluesoJobModel.findOne({ jobId, userId });

        if (!job) {
            return res.status(404).json({ status: 'FAILED', error: 'Job not found' });
        }

        // Standardized success response
        return res.status(200).json({
            status: job.status,
            job: job
        });
    } catch (error: any) {
        console.error('[JobController] Error fetching job status:', error);
        return res.status(500).json({
            status: 'FAILED',
            error: error?.message || 'Internal server error while fetching job status'
        });
    }
};

