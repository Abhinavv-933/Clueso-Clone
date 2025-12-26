import mongoose from 'mongoose';

export interface IUpload {
    userId: string;
    fileKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: Date;
    updatedAt: Date;
}

const uploadSchema = new mongoose.Schema<IUpload>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        fileKey: {
            type: String,
            required: true,
            unique: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            default: 'PENDING',
        },
    },
    {
        timestamps: true,
    }
);

export const UploadModel = mongoose.model<IUpload>('Upload', uploadSchema);
