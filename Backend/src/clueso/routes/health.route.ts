import { Router, Request, Response } from 'express';
import { requireAuthMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/health', requireAuthMiddleware, (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        module: "clueso",
        auth: "clerk",
        storage: "cloudinary",
        uploadFlow: "signed-upload",
        timestamp: new Date().toISOString()
    });
});

export default router;
