import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { triggerAudioExtraction } from '../controllers/audioExtraction.controller';

const router = Router();

/**
 * POST /api/clueso/extract-audio
 * Triggers the audio extraction pipeline step for a given job.
 */
router.post('/extract-audio', requireAuth(), triggerAudioExtraction);

export default router;
