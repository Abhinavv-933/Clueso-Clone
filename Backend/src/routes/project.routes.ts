import { Router } from 'express';
import { requireAuthMiddleware } from '../middleware/auth';
import { createProject, getProjects, deleteProject, getProject, updateProject } from '../controllers/project.controller';

const router = Router();

router.post('/', requireAuthMiddleware, createProject);
router.get('/', requireAuthMiddleware, getProjects);
router.get('/:id', requireAuthMiddleware, getProject);
router.patch('/:id', requireAuthMiddleware, updateProject);
router.delete('/:id', requireAuthMiddleware, deleteProject);

export default router;
