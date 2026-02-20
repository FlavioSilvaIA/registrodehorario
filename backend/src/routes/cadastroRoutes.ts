import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as cadastro from '../controllers/cadastroController';

const router = Router();
router.use(authMiddleware);
router.post('/data-referencia', cadastro.alterarDataReferencia);
router.get('/exportar-usuarios', cadastro.exportarUsuarios);
router.post('/importar-usuarios', cadastro.importarUsuarios);
router.get('/valor-hora', cadastro.listarValorHora);
router.post('/valor-hora', cadastro.criarValorHora);
router.put('/valor-hora/:id', cadastro.atualizarValorHora);
router.delete('/valor-hora/:id', cadastro.excluirValorHora);
router.get('/valor-hora-usuario/:usuarioId', cadastro.getValorHoraUsuario);
router.put('/valor-hora-usuario/:usuarioId', cadastro.setValorHoraUsuario);
router.get('/periodo-fechamento', cadastro.getPeriodoFechamento);
router.post('/fechamento/executar', cadastro.executarFechamento);
router.post('/periodo-fechamento', cadastro.setPeriodoFechamento);
export default router;
