import { z } from 'zod';

/**
 * Represents the data contract for a rendered video asset.
 * This contract is used during the VIDEO_RENDERED stage of the pipeline.
 */
export const VideoRenderedAssetSchema = z.object({
    /**
     * Unique identifier for the rendered asset.
     */
    id: z.string(),

    /**
     * The ID of the project this video belongs to.
     */
    projectId: z.string(),

    /**
     * The ID of the job that produced this rendering.
     */
    jobId: z.string(),

    /**
     * Input artifacts used for rendering.
     */
    input: z.object({
        /**
         * The S3 key of the original uploaded video.
         */
        originalVideoS3Key: z.string(),

        /**
         * The S3 key of the generated voiceover (concatenated or prefix).
         */
        voiceoverS3Key: z.string(),
    }),

    /**
     * Final output artifacts.
     */
    output: z.object({
        /**
         * The S3 key of the final rendered video file.
         */
        renderedVideoS3Key: z.string(),

        /**
         * The file format of the output (e.g., "mp4").
         */
        format: z.literal('mp4'),
    }),

    /**
     * Technical metadata of the rendered video.
     */
    metadata: z.object({
        /**
         * Total duration of the video in seconds.
         */
        durationSeconds: z.number(),

        /**
         * Video resolution (e.g., "1920x1080").
         */
        resolution: z.string(),

        /**
         * Frames per second of the rendered video.
         */
        fps: z.number().optional(),
    }),

    /**
     * Timestamp of when the rendering was completed.
     */
    createdAt: z.date(),
});

/**
 * Type inferred from VideoRenderedAssetSchema.
 */
export type VideoRenderedAsset = z.infer<typeof VideoRenderedAssetSchema>;
