import { z } from 'zod';

/**
 * Represents a single segment of the generated voiceover.
 * Each segment corresponds to a part of the transcript with its own audio artifact.
 */
export const VoiceoverSegmentSchema = z.object({
    /**
     * Start time in seconds relative to the beginning of the video.
     */
    startTime: z.number(),

    /**
     * End time in seconds relative to the beginning of the video.
     */
    endTime: z.number(),

    /**
     * The specific text that was converted to speech for this segment.
     */
    text: z.string(),

    /**
     * The S3 key for the individual audio file of this segment.
     */
    audioS3Key: z.string(),
});

/**
 * Type inferred from VoiceoverSegmentSchema.
 */
export type VoiceoverSegment = z.infer<typeof VoiceoverSegmentSchema>;

/**
 * Represents the complete voiceover asset for a project.
 * This is the output of the VOICE_GENERATED stage.
 */
export const VoiceoverAssetSchema = z.object({
    /**
     * Unique identifier for the voiceover asset.
     */
    id: z.string(),

    /**
     * The ID of the project this voiceover belongs to.
     */
    projectId: z.string(),

    /**
     * The ID of the job that generated this voiceover.
     */
    jobId: z.string(),

    /**
     * Metadata regarding the voice generation.
     */
    metadata: z.object({
        /**
         * The service used (e.g., 'coqui-tts', 'elevenlabs', 'openai').
         */
        provider: z.string(),

        /**
         * The specific AI model used for generation.
         */
        model: z.string(),

        /**
         * The language code (e.g., 'en', 'es').
         */
        language: z.string(),

        /**
         * Optional identifier for the specific voice used.
         */
        voiceId: z.string().optional(),
    }),

    /**
     * Array of voiceover segments with timing and individual audio keys.
     */
    segments: z.array(VoiceoverSegmentSchema),

    /**
     * Optional S3 key for the single, concatenated audio file containing all segments.
     * Useful for direct playback or final merging.
     */
    combinedAudioS3Key: z.string().optional(),

    /**
     * Timestamp of when this asset was generated.
     */
    createdAt: z.date(),

    /**
     * Timestamp of the last update to this asset.
     */
    updatedAt: z.date(),
});

/**
 * Type inferred from VoiceoverAssetSchema.
 */
export type VoiceoverAsset = z.infer<typeof VoiceoverAssetSchema>;
