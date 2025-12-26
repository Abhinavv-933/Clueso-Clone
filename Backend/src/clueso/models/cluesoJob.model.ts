import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus } from '../types/jobStatus';

export interface ICluesoJob extends Document {
    jobId: string;
    userId: string;
    projectId?: string;
    inputUploadId: string;
    inputVideoS3Key: string;
    status: JobStatus;
    audioS3Key?: string;
    transcriptS3Key?: string;
    improvedScriptS3Key?: string;
    aiVoiceS3Key?: string;
    finalVideoS3Key?: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const cluesoJobSchema = new Schema<ICluesoJob>(
    {
        jobId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        projectId: {
            type: String,
            index: true,
        },
        inputUploadId: {
            type: String,
            required: true,
        },
        inputVideoS3Key: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [
                'UPLOADED',
                'AUDIO_EXTRACTED',
                'TRANSCRIBED',
                'SCRIPT_IMPROVED',
                'VOICE_GENERATED',
                'VIDEO_MERGED',
                'COMPLETED',
                'FAILED',
            ],
            default: 'UPLOADED',
        },
        audioS3Key: String,
        transcriptS3Key: String,
        improvedScriptS3Key: String,
        aiVoiceS3Key: String,
        finalVideoS3Key: String,
        errorMessage: String,
    },
    {
        timestamps: true,
    }
);

export const CluesoJobModel = mongoose.model<ICluesoJob>('CluesoJob', cluesoJobSchema);
