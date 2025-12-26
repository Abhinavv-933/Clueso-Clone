import { JobStatus } from './jobStatus';

export interface CluesoJob {
    jobId: string;
    userId: string;
    projectId?: string;

    // Inputs
    inputUploadId: string; // Reference to the Upload record
    inputVideoS3Key: string;

    status: JobStatus;

    // Output Artifacts matching the pipeline steps
    audioS3Key?: string;
    transcriptS3Key?: string;
    improvedScriptS3Key?: string;
    aiVoiceS3Key?: string;
    finalVideoS3Key?: string;

    createdAt: Date;
    updatedAt: Date;
}
