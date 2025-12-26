import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { getPresignedUploadUrl, listUploads, saveUploadMetadata, getDownloadUrl, createShareLink, resolveShareToken } from '../controllers/upload.controller';

const router = Router();

router.post('/presigned-url', requireAuth(), getPresignedUploadUrl);
router.post('/metadata', requireAuth(), saveUploadMetadata);
router.post('/share', requireAuth(), createShareLink);
router.get('/share/:token', resolveShareToken); // PUBLIC
router.get('/download/:fileKey', requireAuth(), getDownloadUrl);
router.get('/', requireAuth(), listUploads);

export default router;
