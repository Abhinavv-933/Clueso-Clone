import { z } from 'zod';

export const ContentType = z.enum([
    'BLOG_POST',
    'TWITTER_THREAD',
    'LINKEDIN_POST',
]);

export type ContentType = z.infer<typeof ContentType>;

export const ContentArtifactSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    type: ContentType,
    content: z.string(),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type ContentArtifact = z.infer<typeof ContentArtifactSchema>;
