import fs from 'fs';
import path from 'path';

interface GenerateVoiceInput {
    jobId: string;
    text: string;
}

export const generateVoice = async ({ jobId }: GenerateVoiceInput): Promise<string> => {
    console.log(`[Worker] Generating AI voiceover (STUBBED)...`);

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const localVoicePath = path.join(tempDir, `${jobId}.voice.mp3`);

    // Create an empty file as a stub for now
    await fs.promises.writeFile(localVoicePath, Buffer.alloc(0));

    console.log(`[Worker] Stubbed voiceover artifact created: ${localVoicePath}`);
    return localVoicePath;
};
