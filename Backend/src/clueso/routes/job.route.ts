import { Router } from 'express';
import { requireAuthMiddleware } from '../../middleware/auth';
import { createJob, getJobStatus } from '../controllers/job.controller';

const router = Router();

router.post('/create-job', requireAuthMiddleware, createJob);
router.get('/:jobId', requireAuthMiddleware, getJobStatus);

export default router;
