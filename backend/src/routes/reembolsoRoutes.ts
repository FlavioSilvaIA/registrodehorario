import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listar, criar, aprovar, negar, listarTipos, criarTipo, atualizarTipo, excluirTipo } from '../controllers/reembolsoController';

const router = Router();
router.use(authMiddleware);
router.get('/tipos', listarTipos);
router.post('/tipos', criarTipo);
router.put('/tipos/:id', atualizarTipo);
router.delete('/tipos/:id', excluirTipo);
router.get('/', listar);
router.post('/', criar);
router.post('/:id/aprovar', aprovar);
router.post('/:id/negar', negar);
export default router;
