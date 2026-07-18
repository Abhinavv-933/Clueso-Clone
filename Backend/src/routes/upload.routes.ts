import { Router } from 'express';
import { requireAuthMiddleware } from '../middleware/auth';
import { getUploadSignature, listUploads, saveUploadMetadata, getDownloadUrl, createShareLink, resolveShareToken } from '../controllers/upload.controller';

const router = Router();

router.post('/signed-upload', requireAuthMiddleware, getUploadSignature);
router.post('/metadata', requireAuthMiddleware, saveUploadMetadata);
router.post('/share', requireAuthMiddleware, createShareLink);
router.get('/share/:token', resolveShareToken); // PUBLIC
router.get('/download/:fileKey', requireAuthMiddleware, getDownloadUrl);
router.get('/', requireAuthMiddleware, listUploads);

export default router;
