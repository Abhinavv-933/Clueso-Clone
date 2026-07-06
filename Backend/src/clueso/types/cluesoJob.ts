import { JobStatus } from './jobStatus';

export interface CluesoJob {
    jobId: string;
    userId: string;
    projectId?: string;

    // Inputs
    inputUploadId: string; // Reference to the Upload record
    inputVideoPublicId: string;

    status: JobStatus;

    // Output Artifacts matching the pipeline steps
    audioPublicId?: string;
    transcriptPublicId?: string;
    improvedScriptPublicId?: string;
    aiVoicePublicId?: string;
    finalVideoPublicId?: string;

    createdAt: Date;
    updatedAt: Date;
}
