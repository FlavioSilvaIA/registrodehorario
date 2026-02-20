import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as admin from '../controllers/adminController';

const router = Router();
router.use(authMiddleware);
router.get('/stats', admin.getStats);
export default router;
