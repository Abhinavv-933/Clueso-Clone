import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { handleVoiceoverGeneration } from '../controllers/voiceover.controller';

const router = Router();

/**
 * POST /api/clueso/voiceover
 * Triggers the Piper TTS process for an improved script.
 */
router.post('/voiceover', requireAuth(), handleVoiceoverGeneration);

export default router;
