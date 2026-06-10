import fs from 'fs';
import path from 'path';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { s3Client } from '../../config/s3';
import { env } from '../../config/env';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface TranscribeAudioInput {
    jobId: string;
    userId: string;
    audioS3Key: string;
}

interface TranscribeAudioOutput {
    transcriptS3Key: string;
    transcript: string;
}

export const transcribeAudioFromS3 = async ({
    jobId,
    userId,
    audioS3Key,
}: TranscribeAudioInput): Promise<TranscribeAudioOutput> => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const localAudioPath = path.join(tempDir, `${jobId}.wav`);
    const transcriptS3Key = `clueso/transcripts/${userId}/${jobId}.json`;

    console.log(`[Worker] Starting Groq transcription for Job ${jobId}`);

    try {
        // 1. Download audio from S3 to temp file
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

        // 2. Send to Groq Whisper API
        console.log(`[Worker] Sending audio to Groq Whisper API...`);
        const transcriptionResponse = await groq.audio.transcriptions.create({
            file: fs.createReadStream(localAudioPath),
            model: 'whisper-large-v3',
            response_format: 'text',
        });

        const transcript = (transcriptionResponse as unknown as string).trim();
        console.log(`[Worker] Groq transcription complete. Length: ${transcript.length} chars`);

        // 3. Validate transcript
        if (!transcript || transcript.length < 10) {
            throw new Error(`Transcript too short (${transcript.length} chars). Audio may be silent or invalid.`);
        }

        // 4. Build JSON and upload to S3
        const words = transcript.split(/\s+/).filter(w => w.length > 0);
        const uniqueWords = new Set(words);

        const transcriptJson = {
            text: transcript,
            language: 'auto',
            length: transcript.length,
            wordCount: words.length,
            uniqueWordCount: uniqueWords.size,
            generatedAt: new Date().toISOString(),
            segments: [],
        };

        const jsonContent = JSON.stringify(transcriptJson, null, 2);

        console.log(`[Worker] Uploading transcript to S3: ${transcriptS3Key}`);
        await s3Client.send(new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: transcriptS3Key,
            Body: jsonContent,
            ContentType: 'application/json; charset=utf-8',
        }));
        console.log(`[Worker] Upload successful.`);

        return { transcriptS3Key, transcript };

    } finally {
        // Always cleanup temp file
        if (fs.existsSync(localAudioPath)) {
            try { fs.unlinkSync(localAudioPath); } catch (e) { }
        }
    }
};