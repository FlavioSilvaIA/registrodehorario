import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listar } from '../controllers/logController';

const router = Router();
router.use(authMiddleware);
router.get('/', listar);
export default router;
