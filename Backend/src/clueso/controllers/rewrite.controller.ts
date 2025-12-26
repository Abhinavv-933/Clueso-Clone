import { Request, Response } from 'express';
import { OllamaService } from '../services/ollama.service';

/**
 * Handles the request to rewrite a transcript into a professional script.
 */
export const handleRewrite = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Valid transcript text is required in the request body.' });
        }

        console.log('[RewriteController] Received request to rewrite transcript...');

        const rewrittenText = await OllamaService.rewriteTranscript(text);

        console.log('[RewriteController] Successfully rewritten transcript.');

        return res.json({ rewrittenText });
    } catch (error: any) {
        console.error('[RewriteController] Error during rewrite:', error);
        return res.status(500).json({
            error: 'Failed to rewrite transcript.',
            message: error.message
        });
    }
};
