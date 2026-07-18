import { Request, Response } from 'express';
import { APIError } from 'groq-sdk';
import { GroqService, MAX_REWRITE_CHARS } from '../services/groq.service';

/**
 * Handles the request to rewrite a transcript into a professional script.
 */
export const handleRewrite = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Valid transcript text is required in the request body.' });
        }

        if (text.length > MAX_REWRITE_CHARS) {
            return res.status(400).json({
                error: `Transcript is too long to rewrite (${text.length} characters, max ${MAX_REWRITE_CHARS}). Please shorten it or split it into smaller sections.`
            });
        }

        console.log('[RewriteController] Received request to rewrite transcript...');

        const rewrittenText = await GroqService.rewriteTranscript(text);

        console.log('[RewriteController] Successfully rewritten transcript.');

        return res.json({ rewrittenText });
    } catch (error) {
        console.error('[RewriteController] Error during rewrite:', error);

        if (error instanceof APIError && error.status === 429) {
            return res.status(429).json({
                error: 'Rewrite service is rate-limited right now. Please wait a moment and try again.'
            });
        }

        const message = error instanceof Error ? error.message : 'Unknown error while rewriting transcript.';
        return res.status(500).json({
            error: 'Failed to rewrite transcript.',
            message
        });
    }
};
