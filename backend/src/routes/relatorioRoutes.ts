import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  horasPorProfissional,
  relatorioColaborador,
  relatorioHorariosConsolidados,
  relatorioFechamentoReembolso,
  relatorioPrevia,
  relatorioProjeto,
} from '../controllers/relatorioController';

const router = Router();
router.use(authMiddleware);
router.get('/horas-profissional', horasPorProfissional);
router.get('/colaborador', relatorioColaborador);
router.get('/horarios-consolidados', relatorioHorariosConsolidados);
router.get('/fechamento-reembolso', relatorioFechamentoReembolso);
router.get('/previa', relatorioPrevia);
router.get('/projeto', relatorioProjeto);
router.get('/projeto-centro-custo', relatorioProjeto);
export default router;
