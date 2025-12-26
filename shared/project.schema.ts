import { z } from 'zod';

export const ProjectStatus = z.enum([
    'UPLOADED',
    'TRANSCRIBING',
    'TRANSCRIBED',
    'GENERATING',
    'COMPLETED',
    'FAILED',
]);

export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const ProjectSchema = z.object({
    id: z.string(),
    userId: z.string(),
    title: z.string(),
    status: ProjectStatus,
    s3Key: z.string(),
    uploadId: z.string().optional(),
    error: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;
