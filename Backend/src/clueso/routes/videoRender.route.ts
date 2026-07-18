import { Router } from 'express';
import { requireAuthMiddleware } from '../../middleware/auth';
import { handleVideoRendering } from '../controllers/videoRender.controller';

const router = Router();

/**
 * @route POST /api/clueso/render-video
 * @desc Triggers the final video rendering process (merging video + voiceover)
 * @access Private (Clerk Auth)
 */
router.post('/render-video', requireAuthMiddleware, handleVideoRendering);

export default router;
