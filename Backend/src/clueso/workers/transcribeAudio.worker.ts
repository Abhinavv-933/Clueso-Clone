import fs from 'fs';
import path from 'path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { spawn } from 'child_process';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';

interface TranscribeAudioInput {
    jobId: string;
    userId: string;
    audioS3Key: string;
}

interface TranscribeAudioOutput {
    transcriptS3Key: string;
}

/**
 * Downloads audio from S3, transcribes it using local Whisper, uploads JSON to S3, and cleans up.
 */
export const transcribeAudioFromS3 = async ({
    jobId,
    userId,
    audioS3Key,
}: TranscribeAudioInput): Promise<TranscribeAudioOutput> => {
    const tempDir = path.join(process.cwd(), 'temp');

    // Ensure temp dir exists
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const localAudioPath = path.join(tempDir, `${jobId}.wav`);
    const localJsonPath = path.join(tempDir, `${jobId}.json`);
    const transcriptS3Key = `clueso/transcripts/${userId}/${jobId}.json`;

    console.log(`[Worker] Starting full transcription lifecycle for Job ${jobId}`);

    try {
        // 1. Download Audio from S3
        console.log(`[Worker] Downloading audio from S3: ${audioS3Key}`);
        const getCommand = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: audioS3Key,
        });

        const getResponse = await s3Client.send(getCommand);
        if (!getResponse.Body) throw new Error('S3 response body is empty');

        const writeStream = fs.createWriteStream(localAudioPath);
        // @ts-ignore
        await pipeline(getResponse.Body as Readable, writeStream);
        console.log(`[Worker] Download complete: ${localAudioPath}`);

        // 2. Transcribe using Local Whisper Script
        console.log(`[Worker] Spawning local Whisper script via py -3.11...`);
        const scriptPath = path.join(process.cwd(), 'scripts', 'whisper_transcribe.py');

        let stderrOutput = '';
        const stdoutData = await new Promise<string>((resolve, reject) => {
            const whisper = spawn('py', ['-3.11', scriptPath, localAudioPath, 'base']);

            let stdout = '';
            let stderr = '';

            whisper.stdout.on('data', (data) => stdout += data.toString('utf8'));
            whisper.stderr.on('data', (data) => stderr += data.toString('utf8'));

            whisper.on('close', (code) => {
                if (code !== 0) {
                    console.error(`[Worker] Local Whisper script failed with code ${code}`);
                    console.error(`[Worker] stderr: ${stderr}`);
                    return reject(new Error(`Local transcription failed: ${stderr || 'Unknown error'}`));
                }
                // Store stderr for logging outside the Promise
                stderrOutput = stderr;
                resolve(stdout);
            });

            whisper.on('error', (err) => {
                console.error(`[Worker] Failed to spawn Python process:`, err);
                reject(new Error(`Failed to spawn Python process: ${err.message}`));
            });
        });

        // Log detected language from stderr
        if (stderrOutput) {
            console.log(`[Worker] Whisper info: ${stderrOutput.trim()}`);
        }

        // 3. Validate and prepare transcript
        const transcript = stdoutData.trim();

        // Validation: Check minimum length
        const MIN_TRANSCRIPT_LENGTH = 10; // Minimum 10 characters for valid transcript
        if (transcript.length < MIN_TRANSCRIPT_LENGTH) {
            console.error(`[Worker] Transcript too short: ${transcript.length} chars`);
            throw new Error(`Transcript validation failed: output too short (${transcript.length} chars). Audio may be silent or invalid.`);
        }

        // Validation: Check for error indicators
        if (transcript.startsWith('ERROR:')) {
            console.error(`[Worker] Whisper returned error: ${transcript}`);
            throw new Error(`Transcription failed: ${transcript}`);
        }

        // Validation: Check for excessive repetition (common in failed transcriptions)
        const words = transcript.split(/\s+/).filter(w => w.length > 0);
        const uniqueWords = new Set(words);
        const repetitionRatio = words.length > 0 ? 1 - (uniqueWords.size / words.length) : 0;
        const MAX_ERROR_RATIO = 0.5; // Max 50% repetition

        if (repetitionRatio > MAX_ERROR_RATIO) {
            console.warn(`[Worker] High repetition detected (${(repetitionRatio * 100).toFixed(1)}%). Transcript may be low quality.`);
        }

        console.log(`[Worker] Transcription complete. Length: ${transcript.length} chars, Words: ${words.length}, Unique: ${uniqueWords.size}`);
        console.log(`[Worker] Transcript validation passed.`);

        // Extract detected language from stderr
        const languageMatch = stderrOutput.match(/Detected language: (\w+)/);
        const detectedLanguage = languageMatch ? languageMatch[1] : 'unknown';

        // 4. Save JSON Locally
        console.log(`[Worker] Saving transcript JSON locally: ${localJsonPath}`);

        // Construct JSON structure with metadata
        const transcriptJson = {
            text: transcript,
            language: detectedLanguage,
            length: transcript.length,
            wordCount: words.length,
            uniqueWordCount: uniqueWords.size,
            repetitionRatio: parseFloat(repetitionRatio.toFixed(3)),
            generatedAt: new Date().toISOString(),
            segments: [] // Segments not available in plain text mode
        };

        const jsonContent = JSON.stringify(transcriptJson, null, 2);

        fs.writeFileSync(localJsonPath, jsonContent, 'utf8');

        // 5. Upload Transcript JSON to S3
        console.log(`[Worker] Uploading transcript to S3: ${transcriptS3Key}`);
        try {
            const putCommand = new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_NAME,
                Key: transcriptS3Key,
                Body: jsonContent,
                ContentType: 'application/json; charset=utf-8',
                ContentEncoding: 'utf-8',
            });
            await s3Client.send(putCommand);
            console.log(`[Worker] Upload successful.`);
        } catch (uploadError) {
            console.error(`[Worker] S3 Upload failed:`, uploadError);
            throw new Error(`Failed to upload transcript to S3: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }

        // 5. Cleanup local files
        console.log(`[Worker] Cleaning up local temporary files...`);
        [localAudioPath, localJsonPath].forEach(p => {
            if (fs.existsSync(p)) {
                try {
                    fs.unlinkSync(p);
                    console.log(`[Worker] Deleted: ${p}`);
                } catch (e) {
                    console.error(`[Worker] Cleanup failed for ${p}:`, e);
                }
            }
        });

        return { transcriptS3Key };

    } catch (error) {
        console.error(`[Worker] Full transcription process failed:`, error);

        // Final attempt at cleanup on error
        [localAudioPath, localJsonPath].forEach(p => {
            if (fs.existsSync(p)) {
                try { fs.unlinkSync(p); } catch (e) { }
            }
        });

        throw error;
    }
};
