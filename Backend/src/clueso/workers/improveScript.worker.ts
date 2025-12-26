import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';
import { OllamaService } from '../services/ollama.service';
import { TranscriptSegment, ImprovedScript, ImprovedScriptSegment } from '../../../../shared';
import { Readable } from 'stream';

interface ImproveScriptInput {
    jobId: string;
    userId: string;
    transcriptS3Key: string;
}

/**
 * Downloads a transcript from S3, improves segments in batches using Ollama,
 * and assembles the final ImprovedScript object.
 */
export const improveScriptFromS3 = async ({
    jobId,
    userId,
    transcriptS3Key,
}: ImproveScriptInput): Promise<ImprovedScript> => {
    console.log(`[ImproveScriptWorker] Starting improvement for Job ${jobId}`);

    try {
        // 1. Download Transcript from S3
        console.log(`[ImproveScriptWorker] Downloading transcript from S3: ${transcriptS3Key}`);
        const getCommand = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: transcriptS3Key,
        });

        const getResponse = await s3Client.send(getCommand);
        if (!getResponse.Body) throw new Error('S3 response body is empty');

        // Helper to read stream to string
        const streamToString = (stream: Readable): Promise<string> =>
            new Promise((resolve, reject) => {
                const chunks: any[] = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            });

        const transcriptText = await streamToString(getResponse.Body as Readable);

        // Removed JSON.parse as transcript is now plain text (Task 7)
        // const transcript = JSON.parse(transcriptDataRaw);
        // const segments: TranscriptSegment[] = transcript.segments;

        // Create a single segment from the whole text to maintain pipeline compatibility
        // The previous logic relied on "segments" from Whisper JSON.
        // Since we are now using raw text, we lose segment timing.
        // We will mock a single segment for the entire text.
        const segments: TranscriptSegment[] = [{
            start: 0,
            end: 0, // Unknown duration
            text: transcriptText,
            speaker: "Speaker" // Default speaker
        }];

        if (!transcriptText || transcriptText.trim().length === 0) {
            console.warn(`[ImproveScriptWorker] Empty transcript text for Job ${jobId}`);
            return {
                id: `is_${jobId}`,
                projectId: "unknown", // ProjectId was in JSON, now lost. Fallback.
                jobId: jobId,
                segments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }

        console.log(`[ImproveScriptWorker] Processing ${segments.length} segments in batches...`);

        // 2. Chunk segments into batches (5–10 segments per chunk)
        const CHUNK_SIZE = 8;
        const improvedSegments: ImprovedScriptSegment[] = [];

        for (let i = 0; i < segments.length; i += CHUNK_SIZE) {
            const chunk = segments.slice(i, i + CHUNK_SIZE);
            console.log(`[ImproveScriptWorker] Processing batch ${Math.floor(i / CHUNK_SIZE) + 1}...`);

            try {
                const improvements = await OllamaService.improveTranscriptChunk(chunk);

                // Assemble improved segments
                chunk.forEach((seg, index) => {
                    improvedSegments.push({
                        startTime: seg.start,
                        endTime: seg.end,
                        originalText: seg.text,
                        improvedText: improvements[index] || seg.text, // Fallback if LLM misses a segment
                    });
                });
            } catch (chunkError) {
                console.error(`[ImproveScriptWorker] Failed to improve batch starting at index ${i}:`, chunkError);
                // Fallback: use original text for this batch
                chunk.forEach((seg) => {
                    improvedSegments.push({
                        startTime: seg.start,
                        endTime: seg.end,
                        originalText: seg.text,
                        improvedText: seg.text,
                    });
                });
            }
        }

        // 3. Assemble and return final ImprovedScript object
        const finalScript: ImprovedScript = {
            id: `is_${jobId}_${Date.now()}`,
            projectId: "unknown", // Lost in plain text conversion
            jobId: jobId,
            segments: improvedSegments,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        console.log(`[ImproveScriptWorker] Successfully completed script improvement for Job ${jobId}`);
        return finalScript;

    } catch (error) {
        console.error(`[ImproveScriptWorker] Failed to process transcript improvement:`, error);
        throw error;
    }
};
