import { Router, Request, Response } from 'express';
import { requireAuth } from '@clerk/express';

const router = Router();

router.get('/health', requireAuth(), (req: Request, res: Response) => {
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
