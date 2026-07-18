import { Router } from 'express';
import { requireAuthMiddleware } from '../../middleware/auth';
import { handleRewrite } from '../controllers/rewrite.controller';

const router = Router();

/**
 * @route POST /api/clueso/rewrite
 * @desc Rewrite the transcript into a professional script
 * @access Private
 */
router.post('/rewrite', requireAuthMiddleware, handleRewrite);

export default router;
