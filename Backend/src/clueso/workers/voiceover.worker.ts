import fs from 'fs';
import path from 'path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';
import { PiperService } from '../services/piper.service';
import { ImprovedScript, VoiceoverAsset, VoiceoverSegment } from '../../../shared';

interface VoiceoverWorkerInput {
    jobId: string;
    userId: string;
    improvedScriptS3Key: string;
}

interface VoiceoverWorkerOutput {
    voiceoverAsset: VoiceoverAsset;
    voiceoverPrefixS3Key: string;
}

/**
 * Downloads the improved script from S3, generates individual audio segments using Piper TTS,
 * and uploads them back to S3.
 */
export const generateVoiceoverFromS3 = async ({
    jobId,
    userId,
    improvedScriptS3Key,
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

        // 2. Download Improved Script from S3
        console.log(`[VoiceoverWorker] Downloading improved script: ${improvedScriptS3Key}`);
        const getCommand = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: improvedScriptS3Key,
        });

        const getResponse = await s3Client.send(getCommand);
        if (!getResponse.Body) throw new Error('S3 response body is empty');

        const streamToString = (stream: Readable): Promise<string> =>
            new Promise((resolve, reject) => {
                const chunks: any[] = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('error', reject);
                stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            });

        const scriptDataRaw = await streamToString(getResponse.Body as Readable);
        const improvedScript: ImprovedScript = JSON.parse(scriptDataRaw);

        // 3. Process each segment
        console.log(`[VoiceoverWorker] Processing ${improvedScript.segments.length} segments...`);

        for (let i = 0; i < improvedScript.segments.length; i++) {
            const segment = improvedScript.segments[i];
            const localWavPath = path.join(tempDir, `segment_${i}.wav`);
            localFiles.push(localWavPath);

            console.log(`[VoiceoverWorker] Generating audio for segment ${i}...`);
            await PiperService.generateVoice(segment.improvedText, localWavPath);

            // 4. Upload to S3
            const audioS3Key = `clueso/voiceovers/${userId}/${jobId}/segment_${i}.wav`;
            console.log(`[VoiceoverWorker] Uploading segment ${i} to S3: ${audioS3Key}`);

            const audioStream = fs.createReadStream(localWavPath);
            const putCommand = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
                Key: audioS3Key,
                Body: audioStream,
                ContentType: 'audio/wav',
            });

            await s3Client.send(putCommand);

            // Record metadata
            voiceoverSegments.push({
                startTime: segment.startTime,
                endTime: segment.endTime,
                text: segment.improvedText,
                audioS3Key: audioS3Key,
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

        const voiceoverPrefixS3Key = `clueso/voiceovers/${userId}/${jobId}/`;

        console.log(`[VoiceoverWorker] Successfully generated voiceover asset for Job ${jobId}`);

        return {
            voiceoverAsset,
            voiceoverPrefixS3Key,
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
