import { Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/s3';
import { CluesoJobModel } from '../models/cluesoJob.model';
import { ProjectModel } from '../../models/project.model';

export const getTranscript = async (req: Request, res: Response) => {
    try {
        const userId = req.auth?.userId;
        const { projectId } = req.params;

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!projectId) {
            return res.status(400).json({ success: false, message: 'Project ID is required' });
        }

        // Find project
        const project = await ProjectModel.findOne({ _id: projectId, userId });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const uploadId = project.uploadId;
        if (!uploadId) {
            return res.status(400).json({ success: false, message: 'Project has no associated upload ID' });
        }

        // Find job
        const job = await CluesoJobModel.findOne({
            $or: [{ inputUploadId: uploadId }, { projectId: projectId }],
            userId
        }).sort({ createdAt: -1 });

        if (!job) {
            return res.status(202).json({
                success: true,
                status: 'PROCESSING',
                message: 'Transcript is still being generated'
            });
        }

        // Check if job failed
        if (job.status === 'FAILED') {
            return res.status(422).json({
                success: false,
                status: 'FAILED',
                message: 'Transcription failed',
                error: job.errorMessage || 'Unknown error during transcription'
            });
        }

        // Check if transcript key exists
        if (!job.transcriptS3Key) {
            return res.status(202).json({
                success: true,
                status: 'PROCESSING',
                message: 'Transcript is still being generated'
            });
        }

        // Fetch from S3
        let transcriptText = "";
        try {
            const command = new GetObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
                Key: job.transcriptS3Key,
            });
            const response = await s3Client.send(command);
            if (response.Body) {
                transcriptText = await response.Body.transformToString("utf-8");
            }
        } catch (s3Error: any) {
            if (s3Error.name === 'NoSuchKey' || s3Error.Code === 'NoSuchKey') {
                return res.status(202).json({
                    success: true,
                    status: 'PROCESSING',
                    message: 'Transcript is still being generated'
                });
            }
            console.error(`[GetTranscript] S3 error:`, s3Error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve transcript from storage'
            });
        }

        if (!transcriptText || transcriptText.trim().length === 0) {
            return res.status(202).json({
                success: true,
                status: 'PROCESSING',
                message: 'Transcript is still being generated'
            });
        }

        // Parse JSON or handle plain text
        let transcriptData: any;
        try {
            transcriptData = JSON.parse(transcriptText);
        } catch (parseError) {
            console.log(`[GetTranscript] Not JSON format, treating as plain text`);
            // If it's not JSON, treat the entire content as the transcript text
            transcriptData = {
                text: transcriptText,
                language: 'unknown',
                length: transcriptText.length,
                wordCount: transcriptText.split(/\s+/).length,
                generatedAt: new Date().toISOString()
            };
        }

        // Validate content
        if (!transcriptData.text || transcriptData.text.trim().length < 10) {
            console.log(`[GetTranscript] Transcript text too short (${transcriptData.text?.length || 0} chars)`);
            return res.status(202).json({
                success: true,
                status: 'PROCESSING',
                message: 'Transcript is incomplete'
            });
        }

        console.log(`[GetTranscript] Returning transcript. Length: ${transcriptData.text.length} chars`);

        // Return transcript
        return res.status(200).json({
            success: true,
            transcript: transcriptData.text,
            metadata: {
                language: transcriptData.language || 'unknown',
                length: transcriptData.text.length,
                wordCount: transcriptData.wordCount || transcriptData.text.split(/\s+/).length,
                generatedAt: transcriptData.generatedAt || new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error(`[TranscriptController] Error:`, error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error?.message
        });
    }
};
