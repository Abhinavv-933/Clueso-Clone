import mongoose from 'mongoose';

export interface IShare {
    token: string;
    uploadId: mongoose.Types.ObjectId;
    ownerId: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const shareSchema = new mongoose.Schema<IShare>(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        uploadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Upload',
            required: true,
        },
        ownerId: {
            type: String,
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Optional: Logic to handle expirations automatically via MongoDB TTL index
// shareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ShareModel = mongoose.model<IShare>('Share', shareSchema);
