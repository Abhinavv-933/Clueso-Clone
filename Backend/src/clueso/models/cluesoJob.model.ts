import mongoose, { Schema, Document } from 'mongoose';
import { JobStatus } from '../types/jobStatus';

export interface ICluesoJob extends Document {
    jobId: string;
    userId: string;
    projectId?: string;
    inputUploadId: string;
    inputVideoPublicId: string;
    status: JobStatus;
    audioPublicId?: string;
    transcriptPublicId?: string;
    transcriptText?: string;
    improvedScriptPublicId?: string;
    aiVoicePublicId?: string;
    finalVideoPublicId?: string;
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
        inputVideoPublicId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [
                'UPLOADED',
                'AUDIO_EXTRACTED',
                'TRANSCRIBING',
                'TRANSCRIBED',
                'SCRIPT_IMPROVED',
                'VOICE_GENERATED',
                'VIDEO_MERGED',
                'COMPLETED',
                'FAILED',
            ],
            default: 'UPLOADED',
        },
        audioPublicId: String,
        transcriptPublicId: String,
        transcriptText: String,
        improvedScriptPublicId: String,
        aiVoicePublicId: String,
        finalVideoPublicId: String,
        errorMessage: String,
    },
    {
        timestamps: true,
    }
);

export const CluesoJobModel = mongoose.model<ICluesoJob>('CluesoJob', cluesoJobSchema);
