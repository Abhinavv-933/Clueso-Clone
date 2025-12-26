import { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { s3Client } from '../config/s3';
import { env } from '../config/env';
import { ProjectModel } from '../models/project.model';
import { ProjectSchema } from '../../../shared/project.schema';
import { UploadModel } from '../models/upload.model';
import { CluesoJobModel } from '../clueso/models/cluesoJob.model';

const CreateProjectSchema = ProjectSchema.pick({
    title: true,
    s3Key: true,
    uploadId: true,
}).required({
    title: true,
    s3Key: true,
    uploadId: true,
});

const UpdateProjectSchema = z.object({
    title: z.string().min(1).optional(),
});

export const updateProject = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { id } = req.params;

    console.log('[UpdateProject] Received update request:', { id, userId, body: req.body });

    if (!userId) {
        console.error('[UpdateProject] Unauthorized - no userId');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = UpdateProjectSchema.safeParse(req.body);
    if (!result.success) {
        console.error('[UpdateProject] Invalid request body:', result.error);
        return res.status(400).json({ message: 'Invalid request body', errors: result.error.format() });
    }

    console.log('[UpdateProject] Validated data:', result.data);

    try {
        const project = await ProjectModel.findOneAndUpdate(
            { _id: id, userId },
            { $set: result.data },
            { new: true }
        );

        if (!project) {
            console.error('[UpdateProject] Project not found:', { id, userId });
            return res.status(404).json({ message: 'Project not found' });
        }

        console.log('[UpdateProject] Successfully updated project:', project._id.toString());

        return res.status(200).json({
            id: project._id.toString(),
            userId: project.userId,
            title: project.title,
            status: project.status,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });
    } catch (error) {
        console.error('[UpdateProject] Error updating project:', error);
        return res.status(500).json({ message: 'Failed to update project' });
    }
};

export const createProject = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const parsed = CreateProjectSchema.parse(req.body);

    // Verify upload exists if uploadId provided
    if (parsed.uploadId) {
        const upload = await UploadModel.findOne({ _id: parsed.uploadId, userId });
        if (!upload) {
            return res.status(404).json({ message: 'Upload not found or access denied' });
        }
    }

    const project = await ProjectModel.create({
        userId,
        title: parsed.title,
        s3Key: parsed.s3Key,
        uploadId: parsed.uploadId,
        status: 'UPLOADED',
    });

    return res.status(201).json({
        id: project._id.toString(),
        userId: project.userId,
        title: project.title,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
    });
};

export const getProjects = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const projects = await ProjectModel.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json(projects);
};

export const deleteProject = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const project = await ProjectModel.findOneAndDelete({ _id: id, userId });

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ message: 'Project deleted successfully' });
};

export const getProject = async (req: Request, res: Response) => {
    const userId = req.auth?.userId;
    const { id } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const project = await ProjectModel.findOne({ _id: id, userId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Generate Presigned GET URL
        const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: project.s3Key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 900, // 15 minutes
        });

        // Lookup Upload and Job to facilitate frontend flows
        // If project has uploadId saved, use it. Otherwise try to find it by s3Key (legacy fallback)
        let uploadId = project.uploadId;
        if (!uploadId) {
            const upload = await UploadModel.findOne({ fileKey: project.s3Key });
            if (upload) uploadId = upload._id.toString();
        }

        // Job lookup logic remains same
        const job = await CluesoJobModel.findOne({ projectId: project._id.toString() });

        return res.status(200).json({
            id: project._id.toString(),
            userId: project.userId,
            title: project.title,
            status: project.status,
            s3Key: project.s3Key,
            fileUrl: signedUrl,
            uploadId: uploadId,
            jobId: job?.jobId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        });
    } catch (error) {
        // CastError happens if id is not a valid ObjectId
        return res.status(404).json({ message: 'Project not found' });
    }
};
