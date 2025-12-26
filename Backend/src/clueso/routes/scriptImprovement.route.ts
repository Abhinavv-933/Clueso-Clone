import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { handleScriptImprovement } from '../controllers/scriptImprovement.controller';

const router = Router();

/**
 * POST /api/clueso/improve-script
 * Triggers the LLM-based transcript improvement step.
 */
router.post('/improve-script', requireAuth(), handleScriptImprovement);

export default router;
