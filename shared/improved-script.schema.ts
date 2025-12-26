import { z } from 'zod';

/**
 * Represents a single segment of the improved script.
 * This is the atomic unit of the script after LLM processing.
 */
export const ImprovedScriptSegmentSchema = z.object({
    /**
     * Start time in seconds from the beginning of the video/audio.
     */
    startTime: z.number(),

    /**
     * End time in seconds from the beginning of the video/audio.
     */
    endTime: z.number(),

    /**
     * The raw text as transcribed by the Whisper model (with filler words, etc.).
     */
    originalText: z.string(),

    /**
     * The polished text after LLM improvement (grammar fixed, fillers removed).
     */
    improvedText: z.string(),
});

/**
 * Type inferred from the ImprovedScriptSegmentSchema.
 */
export type ImprovedScriptSegment = z.infer<typeof ImprovedScriptSegmentSchema>;

/**
 * Represents the full improved script for a project/job.
 * This is the final output of the SCRIPT_IMPROVED pipeline stage.
 */
export const ImprovedScriptSchema = z.object({
    /**
     * Unique identifier for the improved script artifact.
     */
    id: z.string(),

    /**
     * The ID of the project this script belongs to.
     */
    projectId: z.string(),

    /**
     * The ID of the job that generated this script.
     */
    jobId: z.string(),

    /**
     * Array of improved script segments with timing information.
     */
    segments: z.array(ImprovedScriptSegmentSchema),

    /**
     * Timestamp of when this script was generated.
     */
    createdAt: z.date(),

    /**
     * Timestamp of the last update to this script.
     */
    updatedAt: z.date(),
});

/**
 * Type inferred from the ImprovedScriptSchema.
 */
export type ImprovedScript = z.infer<typeof ImprovedScriptSchema>;
