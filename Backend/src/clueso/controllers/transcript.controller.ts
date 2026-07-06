import { Request, Response } from 'express';
import { downloadTextFromCloudinary } from '../../config/cloudinary';
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

        // Check if transcript public_id exists
        if (!job.transcriptPublicId) {
            console.log(`[GetTranscript] 202: Job ${job.jobId} is ${job.status} but transcriptPublicId is missing`);
            return res.status(202).json({
                success: true,
                status: 'PROCESSING',
                message: 'Transcript is still being generated'
            });
        }

        // Fetch from Cloudinary
        let transcriptText = "";
        try {
            transcriptText = await downloadTextFromCloudinary(job.transcriptPublicId, 'raw');
        } catch (cloudinaryError: any) {
            if (cloudinaryError.status === 404) {
                console.log(`[GetTranscript] 202: Cloudinary asset not found for public_id ${job.transcriptPublicId}`);
                return res.status(202).json({
                    success: true,
                    status: 'PROCESSING',
                    message: 'Transcript is still being generated'
                });
            }
            console.error(`[GetTranscript] Cloudinary error:`, cloudinaryError);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve transcript from storage'
            });
        }

        if (!transcriptText || transcriptText.trim().length === 0) {
            console.log(`[GetTranscript] 202: Cloudinary asset is empty for public_id ${job.transcriptPublicId}`);
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

        // Validate content - ONLY trigger 202 for "short" text if job is NOT yet TRANSCRIBED
        const isFinished = ['TRANSCRIBED', 'COMPLETED', 'SCRIPT_IMPROVED'].includes(job.status);
        if (!isFinished && (!transcriptData.text || transcriptData.text.trim().length < 10)) {
            console.log(`[GetTranscript] 202: Transcript text too short (${transcriptData.text?.length || 0} chars) and job ${job.jobId} still ${job.status}`);
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
