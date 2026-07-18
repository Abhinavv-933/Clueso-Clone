import Groq from 'groq-sdk';
import { env } from '../../config/env';

/**
 * Service for LLM-based transcript text tasks (rewriting, cleanup), backed
 * by Groq's chat completions API.
 */
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const REWRITE_MODEL = 'llama-3.3-70b-versatile';

// Groq's free tier enforces per-minute token limits, so a single oversized
// request risks either a slow/expensive call or a 429. Truncating or
// chunking would silently change what gets rewritten, so instead we reject
// the request up front with a clear, actionable error (see
// rewrite.controller.ts, the sole caller of rewriteTranscript).
export const MAX_REWRITE_CHARS = 8000;

export class GroqService {
    /**
     * Improves a chunk of transcript segments.
     *
     * @param segments - Array of transcript segments to improve
     * @returns Array of improved text strings matching the segment order
     */
    static async improveTranscriptChunk(segments: { text: string }[]): Promise<string[]> {
        const textToImprove = segments.map((s, i) => `[${i}] ${s.text}`).join('\n');

        const systemPrompt = 'You are an expert script editor. You clean up raw speech transcripts without changing their meaning.';

        const userPrompt = `
Clean up the following numbered transcript segments.

Rules:
1. Remove filler words like "uh", "um", "you know", "like", "actually".
2. Fix minor grammatical errors.
3. Improve clarity and flow while preserving the original meaning.
4. DO NOT add any new information.
5. DO NOT change the technical terms or names.
6. Return the improved text as a JSON object with a single key 'improvements' which is an array of strings in the EXACT same order as the input.

Input Segments:
${textToImprove}

Return JSON format:
{ "improvements": ["improved text 0", "improved text 1", ...] }
        `.trim();

        console.log(`[GroqService] Improving ${segments.length} transcript segment(s) using ${REWRITE_MODEL}...`);

        const completion = await groq.chat.completions.create({
            model: REWRITE_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content || !content.trim()) {
            throw new Error('Groq returned an empty response while improving the transcript chunk.');
        }

        let parsed: { improvements?: unknown };
        try {
            parsed = JSON.parse(content);
        } catch {
            console.error('[GroqService] Failed to parse Groq JSON response:', content);
            throw new Error('Groq returned invalid JSON while improving the transcript chunk.');
        }

        if (!Array.isArray(parsed.improvements)) {
            console.error('[GroqService] Invalid response shape from Groq:', parsed);
            throw new Error('Groq did not return an array of improvements.');
        }

        return parsed.improvements as string[];
    }

    /**
     * Rewrites the entire transcript into a clean, well-punctuated, readable
     * script — without changing its meaning, adding facts, or summarizing it.
     *
     * @param text - The full transcript text to rewrite.
     * @returns The rewritten script as plain text.
     */
    static async rewriteTranscript(text: string): Promise<string> {
        const systemPrompt = 'You are an expert script editor for high-quality video content. You rewrite raw speech transcripts into clean, well-punctuated, readable scripts without changing their meaning, adding facts, or summarizing them.';

        const userPrompt = `
Rewrite the following raw transcript into a polished script.

Follow these strict rules:
1. REMOVE all filler words (e.g., "uh", "um", "you know", "like", "actually", "I mean").
2. FIX all grammatical errors and improve punctuation.
3. IMPROVE the flow and clarity of the sentences.
4. DO NOT change the technical terms, proper names, or core facts.
5. DO NOT add any new information, and do not summarize — preserve the original meaning and level of detail.
6. PRESERVE the original tone of the speaker.
7. Output the polished script ONLY, as plain text. Do not include any intros or outros like "Here is your rewritten script:".

RAW TRANSCRIPT:
${text}
        `.trim();

        console.log(`[GroqService] Rewriting transcript (${text.length} chars) using ${REWRITE_MODEL}...`);

        const completion = await groq.chat.completions.create({
            model: REWRITE_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.3,
        });

        const content = completion.choices?.[0]?.message?.content;
        if (!content || !content.trim()) {
            throw new Error('Groq returned an empty response while rewriting the transcript.');
        }

        return content.trim();
    }
}
