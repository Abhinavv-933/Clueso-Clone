import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { handleRewrite } from '../controllers/rewrite.controller';

const router = Router();

/**
 * @route POST /api/clueso/rewrite
 * @desc Rewrite the transcript into a professional script
 * @access Private
 */
router.post('/rewrite', requireAuth(), handleRewrite);

export default router;
