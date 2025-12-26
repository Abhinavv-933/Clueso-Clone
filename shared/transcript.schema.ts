import { z } from 'zod';

export const TranscriptSegmentSchema = z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
    speaker: z.string(),
});

export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

export const TranscriptSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    fullText: z.string(),
    segments: z.array(TranscriptSegmentSchema),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Transcript = z.infer<typeof TranscriptSchema>;
