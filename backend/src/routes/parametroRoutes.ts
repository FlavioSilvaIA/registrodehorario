import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listar, salvar, excluir } from '../controllers/parametroController';

const router = Router();
router.use(authMiddleware);
router.get('/', listar);
router.post('/', salvar);
router.delete('/:id', excluir);
export default router;
