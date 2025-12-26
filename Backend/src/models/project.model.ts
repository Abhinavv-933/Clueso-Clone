import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    uploadId: {
      type: String, // ID from the Upload collection
      index: true,
    },
    status: {
      type: String,
      enum: [
        'UPLOADED',
        'TRANSCRIBING',
        'TRANSCRIBED',
        'GENERATING',
        'COMPLETED',
        'FAILED',
      ],
      required: true,
      default: 'UPLOADED',
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ProjectModel = mongoose.model('Project', projectSchema);
