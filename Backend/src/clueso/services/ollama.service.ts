/**
 * Service for interacting with the local Ollama instance.
 * Used for transcript improvement and other LLM tasks.
 */
export class OllamaService {
    private static readonly OLLAMA_URL = 'http://localhost:11434/api/generate';
    private static readonly DEFAULT_MODEL = 'llama3';

    /**
     * Validates connection to Ollama by sending a simple prompt.
     * 
     * @returns The parsed JSON response containing the model's message.
     * @throws Error if connection fails or response is not OK.
     */
    static async testOllamaConnection() {
        const payload = {
            model: this.DEFAULT_MODEL,
            prompt: "Return a JSON object with a single key 'message' saying hello.",
            stream: false,
            format: 'json',
        };

        console.log(`[OllamaService] Testing connection to Ollama at ${this.OLLAMA_URL}...`);

        try {
            const response = await fetch(this.OLLAMA_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[OllamaService] Ollama returned error: ${response.status} ${response.statusText}`, errorText);
                throw new Error(`Ollama connection failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Ollama wrap the actual model output in a 'response' field when stream: false
            // Since we requested JSON format, the 'response' field should be a stringified JSON
            let parsedOutput;
            try {
                parsedOutput = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;
            } catch (e) {
                console.warn('[OllamaService] Failed to parse model output as JSON, returning raw response.');
                parsedOutput = data.response;
            }

            console.log('[OllamaService] Successfully connected to Ollama!');
            return {
                raw: data,
                message: parsedOutput?.message || 'No message found in output',
            };
        } catch (error) {
            console.error('[OllamaService] Critical error communicating with Ollama:', error);
            throw error;
        }
    }

    /**
     * Improves a chunk of transcript segments using Ollama.
     * 
     * @param segments - Array of transcript segments to improve
     * @returns Array of improved text strings matching the segment order
     */
    static async improveTranscriptChunk(segments: { text: string }[]) {
        const textToImprove = segments.map((s, i) => `[${i}] ${s.text}`).join('\n');

        const prompt = `
You are an expert script editor. Your task is to clean up a raw transcript.
Rules:
1. Remove filler words like "uh", "um", "you know", "like", "actually".
2. Fix minor grammatical errors.
3. Improve clarity and flow while preserving the original meaning.
4. DO NOT add any new information.
5. DO NOT change the technical terms or names.
6. The input is a numbered list of segments. Return the improved text as a JSON object with a single key 'improvements' which is an array of strings in the EXACT same order as the input.

Input Segments:
${textToImprove}

Return JSON format:
{ "improvements": ["improved text 0", "improved text 1", ...] }
        `.trim();

        const payload = {
            model: this.DEFAULT_MODEL,
            prompt: prompt,
            stream: false,
            format: 'json',
        };

        try {
            const response = await fetch(this.OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Ollama model '${this.DEFAULT_MODEL}' not found. Please run 'ollama pull ${this.DEFAULT_MODEL}'`);
                }
                throw new Error(`Ollama improvement failed: ${response.statusText}`);
            }

            const data = await response.json();
            const parsedOutput = typeof data.response === 'string' ? JSON.parse(data.response) : data.response;

            if (!parsedOutput.improvements || !Array.isArray(parsedOutput.improvements)) {
                console.error('[OllamaService] Invalid response format from LLM:', parsedOutput);
                throw new Error('LLM did not return an array of improvements');
            }

            return parsedOutput.improvements as string[];

        } catch (error) {
            console.error('[OllamaService] Error improving chunk:', error);
            throw error;
        }
    }

    /**
     * Rewrites the entire transcript into a professional script.
     * 
     * @param text - The full transcript text to rewrite.
     * @returns The rewritten script.
     */
    static async rewriteTranscript(text: string): Promise<string> {
        const prompt = `
You are an expert script editor for high-quality video content. 
Your task is to take the provided raw transcript and rewrite it into a professional, polished script.

Follow these strict rules:
1. REMOVE all filler words (e.g., "uh", "um", "you know", "like", "actually", "I mean").
2. FIX all grammatical errors and improve punctuation.
3. IMPROVE the flow and clarity of the sentences.
4. DO NOT change the technical terms, proper names, or core facts.
5. PRESERVE the original meaning and tone of the speaker.
6. The output should be the polished script ONLY. Do not include any intros or outros like "Here is your rewritten script:".

RAW TRANSCRIPT:
${text}
        `.trim();

        const payload = {
            model: this.DEFAULT_MODEL,
            prompt: prompt,
            stream: false,
        };

        try {
            console.log(`[OllamaService] Rewriting transcript using ${this.DEFAULT_MODEL}...`);
            const response = await fetch(this.OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Ollama model '${this.DEFAULT_MODEL}' not found. Please run 'ollama pull ${this.DEFAULT_MODEL}'`);
                }
                throw new Error(`Ollama rewrite failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response as string;

        } catch (error) {
            console.error('[OllamaService] Error rewriting transcript:', error);
            throw error;
        }
    }
}
