import fs from 'fs';
import path from 'path';
import { downloadTextFromCloudinary, uploadFileToCloudinary } from '../../config/cloudinary';
import { PiperService } from '../services/piper.service';
import { ImprovedScript, VoiceoverAsset, VoiceoverSegment } from '../../../shared';

interface VoiceoverWorkerInput {
    jobId: string;
    userId: string;
    improvedScriptPublicId: string;
}

interface VoiceoverWorkerOutput {
    voiceoverAsset: VoiceoverAsset;
    voiceoverPrefixPublicId: string;
}

/**
 * Downloads the improved script from Cloudinary, generates individual audio segments using Piper TTS,
 * and uploads them back to Cloudinary.
 */
export const generateVoiceoverFromCloudinary = async ({
    jobId,
    userId,
    improvedScriptPublicId,
}: VoiceoverWorkerInput): Promise<VoiceoverWorkerOutput> => {
    console.log(`[VoiceoverWorker] Starting voice generation for Job ${jobId}`);

    const tempDir = path.join(process.cwd(), 'temp', 'voiceovers', jobId);
    const voiceoverSegments: VoiceoverSegment[] = [];
    const localFiles: string[] = [];

    try {
        // 1. Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // 2. Download Improved Script from Cloudinary
        console.log(`[VoiceoverWorker] Downloading improved script: ${improvedScriptPublicId}`);
        const scriptDataRaw = await downloadTextFromCloudinary(improvedScriptPublicId, 'raw');
        const improvedScript: ImprovedScript = JSON.parse(scriptDataRaw);

        // 3. Process each segment
        console.log(`[VoiceoverWorker] Processing ${improvedScript.segments.length} segments...`);

        for (let i = 0; i < improvedScript.segments.length; i++) {
            const segment = improvedScript.segments[i];
            const localWavPath = path.join(tempDir, `segment_${i}.wav`);
            localFiles.push(localWavPath);

            console.log(`[VoiceoverWorker] Generating audio for segment ${i}...`);
            await PiperService.generateVoice(segment.improvedText, localWavPath);

            // 4. Upload to Cloudinary
            const audioPublicId = `clueso/voiceovers/${userId}/${jobId}/segment_${i}`;
            console.log(`[VoiceoverWorker] Uploading segment ${i} to Cloudinary: ${audioPublicId}`);

            await uploadFileToCloudinary(localWavPath, audioPublicId, 'video');

            // Record metadata
            voiceoverSegments.push({
                startTime: segment.startTime,
                endTime: segment.endTime,
                text: segment.improvedText,
                audioPublicId: audioPublicId,
            });
        }

        // 5. Build VoiceoverAsset object
        const voiceoverAsset: VoiceoverAsset = {
            id: `va_${jobId}_${Date.now()}`,
            projectId: improvedScript.projectId,
            jobId: jobId,
            metadata: {
                provider: 'piper',
                model: 'en_US-lessac-medium',
                language: 'en-US',
            },
            segments: voiceoverSegments,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const voiceoverPrefixPublicId = `clueso/voiceovers/${userId}/${jobId}/`;

        console.log(`[VoiceoverWorker] Successfully generated voiceover asset for Job ${jobId}`);

        return {
            voiceoverAsset,
            voiceoverPrefixPublicId,
        };

    } catch (error) {
        console.error(`[VoiceoverWorker] Failed to generate voiceover:`, error);
        throw error;
    } finally {
        // 6. Cleanup Local Files
        console.log(`[VoiceoverWorker] Cleaning up local temporary files...`);
        for (const file of localFiles) {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (e) {
                    console.warn(`[VoiceoverWorker] Failed to delete temp file ${file}:`, e);
                }
            }
        }
        // Also try to remove the job-specific temp dir if empty
        if (fs.existsSync(tempDir)) {
            try {
                fs.rmdirSync(tempDir);
            } catch (e) {
                // Ignore if not empty or other issues
            }
        }
    }
};
