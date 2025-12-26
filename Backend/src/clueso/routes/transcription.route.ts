import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { handleTranscription } from '../controllers/transcription.controller';

const router = Router();

/**
 * POST /api/clueso/transcribe
 * Triggers the transcription pipeline step for a given job.
 */
router.post('/transcribe', requireAuth(), handleTranscription);

export default router;
