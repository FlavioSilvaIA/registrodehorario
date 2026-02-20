import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listar, criar, atualizar, excluir } from '../controllers/centroCustoController';

const router = Router();
router.use(authMiddleware);
router.get('/', listar);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);
export default router;
