interface GenerateVoiceInput {
    jobId: string;
    text: string;
}

/**
 * Stub for AI voiceover generation. No TTS engine is wired up yet, so this
 * intentionally produces no artifact — returning `null` signals callers to
 * skip the Cloudinary upload rather than uploading an empty file (which
 * Cloudinary rejects with an "Empty file" error).
 */
export const generateVoice = async ({ jobId }: GenerateVoiceInput): Promise<string | null> => {
    console.log(`[Worker] Generating AI voiceover (STUBBED) for Job ${jobId} — no artifact produced, skipping.`);
    return null;
};
