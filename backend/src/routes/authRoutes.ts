import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { login, me } from '../controllers/authController';

const router = Router();
router.post('/login', login);
router.get('/me', authMiddleware, me);
export default router;
