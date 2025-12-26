import { Request, Response, NextFunction } from 'express';
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { UploadModel } from '../models/upload.model';
import { ShareModel } from '../models/share.model';

import { s3Client } from '../config/s3';
import { env } from '../config/env';

/**
 * Allowed MIME types for uploads
 */
const allowedMimeTypes = [
    // Video formats
    'video/mp4',
    'video/webm',
    'video/quicktime',      // .mov
    'video/x-matroska',     // .mkv
    // Audio formats
    'audio/mpeg',
    'audio/wav',
    // Image formats
    'image/jpeg',
    'image/png',
    'image/webp',
    // Document formats
    'application/pdf',
];

/**
 * Request body validation
 */
const presignedUrlSchema = z.object({
    filename: z.string().min(1),
    contentType: z.string().min(1),
    fileSize: z.number().positive(),
});

export const getPresignedUploadUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Clerk injects auth here
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const parsed = presignedUrlSchema.safeParse(req.body);

        if (!parsed.success) {
            console.error('[Upload] Invalid request body:', parsed.error);
            return res.status(400).json({ message: 'Invalid request body', errors: parsed.error.format() });
        }

        const { filename, contentType, fileSize } = parsed.data;

        // Log received data for debugging
        console.log('[Upload] Received upload request:', {
            filename,
            contentType,
            fileSize,
            userId
        });

        if (!allowedMimeTypes.includes(contentType)) {
            console.error('[Upload] Unsupported MIME type:', contentType);
            console.error('[Upload] Allowed MIME types:', allowedMimeTypes);
            return res.status(400).json({
                error: 'Unsupported file format',
                receivedMime: contentType,
                supported: ['mp4', 'mov', 'mkv', 'webm', 'wav', 'mp3', 'jpg', 'png', 'webp', 'pdf'],
                message: 'Unsupported file format. Supported formats: mp4, mov, mkv, webm, wav, mp3, jpg, png, webp, pdf'
            });
        }

        console.log('[Upload] MIME type accepted:', contentType);

        // Basic filename sanitization
        const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');

        const s3Key = `uploads/${userId}/${randomUUID()}-${safeFilename}`;

        const command = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: s3Key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 5, // 5 minutes
        });

        return res.status(200).json({
            uploadUrl,
            s3Key,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Saves file metadata after successful S3 upload
 */
export const saveUploadMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const metadataSchema = z.object({
            fileKey: z.string().min(1),
            fileName: z.string().min(1),
            fileType: z.string().min(1),
            fileSize: z.number().positive(),
        });

        const parsed = metadataSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: 'Invalid metadata' });
        }

        const upload = await UploadModel.create({
            ...parsed.data,
            userId,
            status: 'COMPLETED',
        });

        // Return the full upload object so frontend can get the _id
        return res.status(201).json(upload);
    } catch (error) {
        next(error);
    }
};

/**
 * List all uploads for the logged-in user
 */
export const listUploads = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const uploads = await UploadModel.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json(uploads);
    } catch (error) {
        next(error);
    }
};
/**
 * Generates a signed GET URL for file preview
 */
export const getDownloadUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { fileKey } = req.params;
        if (!fileKey) {
            return res.status(400).json({ message: 'File key is required' });
        }

        // Verify ownership in DB
        const upload = await UploadModel.findOne({ fileKey, userId });
        if (!upload) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }

        const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 60, // 1 hour
        });

        return res.status(200).json({ downloadUrl });
    } catch (error) {
        next(error);
    }
};
/**
 * Creates a public share token for a file
 */
export const createShareLink = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { uploadId, expiresIn } = req.body;
        if (!uploadId) {
            return res.status(400).json({ message: 'uploadId is required' });
        }

        // Verify ownership
        const upload = await UploadModel.findOne({ _id: uploadId, userId });
        if (!upload) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }

        // Calculate expiresAt based on duration
        let expiresAt: Date | undefined;
        if (expiresIn) {
            expiresAt = new Date();
            switch (expiresIn) {
                case '1h':
                    expiresAt.setHours(expiresAt.getHours() + 1);
                    break;
                case '24h':
                    expiresAt.setHours(expiresAt.getHours() + 24);
                    break;
                case '7d':
                    expiresAt.setDate(expiresAt.getDate() + 7);
                    break;
                default:
                    expiresAt = undefined;
            }
        }

        // Create token
        const token = randomUUID();

        const share = await ShareModel.create({
            token,
            uploadId,
            ownerId: userId,
            expiresAt,
        });

        return res.status(201).json({
            token: share.token,
            shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/share/${share.token}`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Resolves a share token and returns file info + signed media URL
 */
export const resolveShareToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Find share and populate upload info
        const share = await ShareModel.findOne({ token }).populate('uploadId');
        if (!share) {
            return res.status(404).json({ message: 'Share link not found' });
        }

        // Check expiry
        if (share.expiresAt && share.expiresAt < new Date()) {
            return res.status(410).json({ message: 'Share link has expired' });
        }

        const upload = share.uploadId as any; // Cast because of populate

        // Generate signed URL for S3
        const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: upload.fileKey,
        });

        const mediaUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 60, // 1 hour
        });

        return res.status(200).json({
            fileName: upload.fileName,
            fileType: upload.fileType,
            fileSize: upload.fileSize,
            mediaUrl,
        });
    } catch (error) {
        next(error);
    }
};
