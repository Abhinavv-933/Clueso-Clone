import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { createJob, getJobStatus } from '../controllers/job.controller';

const router = Router();

router.post('/create-job', requireAuth(), createJob);
router.get('/:jobId', requireAuth(), getJobStatus);

export default router;
