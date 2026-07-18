import { downloadTextFromCloudinary } from '../../config/cloudinary';
import { GroqService } from '../services/groq.service';
import { TranscriptSegment, ImprovedScript, ImprovedScriptSegment } from '../../../shared';

interface ImproveScriptInput {
    jobId: string;
    userId: string;
    transcriptPublicId: string;
}

/**
 * Downloads a transcript from Cloudinary, improves segments in batches using Groq,
 * and assembles the final ImprovedScript object.
 */
export const improveScriptFromCloudinary = async ({
    jobId,
    userId,
    transcriptPublicId,
}: ImproveScriptInput): Promise<ImprovedScript> => {
    console.log(`[ImproveScriptWorker] Starting improvement for Job ${jobId}`);

    try {
        // 1. Download Transcript from Cloudinary
        console.log(`[ImproveScriptWorker] Downloading transcript from Cloudinary: ${transcriptPublicId}`);
        const transcriptText = await downloadTextFromCloudinary(transcriptPublicId, 'raw');

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
                const improvements = await GroqService.improveTranscriptChunk(chunk);

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
