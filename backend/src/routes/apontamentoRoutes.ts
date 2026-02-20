import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as apontamentoController from '../controllers/apontamentoController';

const router = Router();
router.use(authMiddleware);

router.get('/servidor-agora', apontamentoController.getServidorAgora);
router.get('/aberto', apontamentoController.getApontamentoAberto);
router.get('/horas-dia', apontamentoController.getHorasDia);
router.get('/resumo', apontamentoController.listarComResumo);
router.get('/', apontamentoController.listarApontamentos);
router.post('/entrada', apontamentoController.registrarEntrada);
router.post('/manual', apontamentoController.registrarManual);
router.post('/importar', apontamentoController.importarApontamentos);
router.put('/:id/saida', apontamentoController.registrarSaida);

export default router;
