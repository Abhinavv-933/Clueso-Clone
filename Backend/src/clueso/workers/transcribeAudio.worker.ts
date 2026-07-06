import fs from 'fs';
import path from 'path';
import { downloadFileFromCloudinary, uploadContentToCloudinary } from '../../config/cloudinary';
import { env } from '../../config/env';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

interface TranscribeAudioInput {
    jobId: string;
    userId: string;
    audioPublicId: string;
}

interface TranscribeAudioOutput {
    transcriptPublicId: string;
    transcript: string;
}

export const transcribeAudioFromCloudinary = async ({
    jobId,
    userId,
    audioPublicId,
}: TranscribeAudioInput): Promise<TranscribeAudioOutput> => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const localAudioPath = path.join(tempDir, `${jobId}.wav`);
    const transcriptPublicId = `clueso/transcripts/${userId}/${jobId}`;

    console.log(`[Worker] Starting Groq transcription for Job ${jobId}`);

    try {
        // 1. Download audio from Cloudinary to temp file
        console.log(`[Worker] Downloading audio from Cloudinary: ${audioPublicId}`);
        await downloadFileFromCloudinary(audioPublicId, 'video', localAudioPath);
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

        // 4. Build JSON and upload to Cloudinary
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

        console.log(`[Worker] Uploading transcript to Cloudinary: ${transcriptPublicId}`);
        await uploadContentToCloudinary(jsonContent, transcriptPublicId);
        console.log(`[Worker] Upload successful.`);

        return { transcriptPublicId, transcript };

    } finally {
        // Always cleanup temp file
        if (fs.existsSync(localAudioPath)) {
            try { fs.unlinkSync(localAudioPath); } catch (e) { }
        }
    }
};