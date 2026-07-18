import { Router } from 'express';
import { requireAuthMiddleware } from '../../middleware/auth';
import { handleVoiceoverGeneration } from '../controllers/voiceover.controller';

const router = Router();

/**
 * POST /api/clueso/voiceover
 * Triggers the Piper TTS process for an improved script.
 */
router.post('/voiceover', requireAuthMiddleware, handleVoiceoverGeneration);

export default router;
