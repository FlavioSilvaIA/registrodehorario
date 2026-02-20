import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as projetoController from '../controllers/projetoController';

const router = Router();
router.use(authMiddleware);

router.get('/', projetoController.listarProjetos);
router.post('/', projetoController.criarProjeto);
router.put('/:id', projetoController.atualizarProjeto);
router.delete('/:id', projetoController.excluirProjeto);
router.get('/etapas/:etapaId/atividades', projetoController.listarAtividades);
router.get('/:projetoId/etapas', projetoController.listarEtapas);

export default router;
