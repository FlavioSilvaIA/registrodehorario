import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMe, listar, criar, atualizar, excluir } from '../controllers/usuarioController';
import { listarPorUsuario, salvarPorUsuario } from '../controllers/usuarioProjetoController';

const router = Router();
router.use(authMiddleware);
router.get('/me', getMe);
router.get('/', listar);
router.get('/:id/projetos', listarPorUsuario);
router.put('/:id/projetos', salvarPorUsuario);
router.post('/', criar);
router.put('/:id', atualizar);
router.delete('/:id', excluir);
export default router;
