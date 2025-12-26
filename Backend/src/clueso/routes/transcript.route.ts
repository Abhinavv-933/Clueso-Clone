
import { Router } from 'express';
import { getTranscript } from '../controllers/transcript.controller';

const router = Router();

router.get('/transcript/:projectId', getTranscript);

export default router;
