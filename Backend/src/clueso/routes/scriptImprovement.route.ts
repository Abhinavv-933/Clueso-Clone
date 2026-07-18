import { Router } from 'express';
import { requireAuthMiddleware } from '../../middleware/auth';
import { handleScriptImprovement } from '../controllers/scriptImprovement.controller';

const router = Router();

/**
 * POST /api/clueso/improve-script
 * Triggers the LLM-based transcript improvement step.
 */
router.post('/improve-script', requireAuthMiddleware, handleScriptImprovement);

export default router;
