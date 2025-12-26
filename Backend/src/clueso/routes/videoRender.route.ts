import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { handleVideoRendering } from '../controllers/videoRender.controller';

const router = Router();

/**
 * @route POST /api/clueso/render-video
 * @desc Triggers the final video rendering process (merging video + voiceover)
 * @access Private (Clerk Auth)
 */
router.post('/render-video', requireAuth(), handleVideoRendering);

export default router;
