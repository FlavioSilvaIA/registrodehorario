import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as notif from '../controllers/notificacaoController';

const router = Router();
router.use(authMiddleware);

// Cadastro (notificações por empresa)
router.get('/cadastro', notif.listarNotificacoes);
router.post('/cadastro', notif.criarNotificacao);
router.put('/cadastro/:id', notif.atualizarNotificacao);
router.delete('/cadastro/:id', notif.excluirNotificacao);

// Config (legado)
router.get('/config', notif.listarConfig);
router.post('/config', notif.salvarConfig);

// Alertas (tipos)
router.get('/alertas', notif.listarTiposAlerta);
router.post('/alertas', notif.criarTipoAlerta);
router.put('/alertas/:id', notif.atualizarTipoAlerta);
router.delete('/alertas/:id', notif.excluirTipoAlerta);

// Vincular usuário (Notificação/TipoAlerta + Colaborador)
router.get('/vinculos-usuario', notif.listarVinculosUsuario);
router.post('/vinculos-usuario', notif.criarVinculoUsuario);
router.delete('/vinculos-usuario/:id', notif.excluirVinculoUsuario);

// Vincular usuário (devices + vinculos - legado)
router.get('/devices', notif.listarDevices);
router.post('/devices', notif.criarDevice);
router.get('/vinculos', notif.listarVinculos);
router.post('/vinculos', notif.vincularUsuario);
router.delete('/vinculos/:id', notif.desvincularUsuario);

// Administradores
router.get('/administradores', notif.listarAdministradores);
router.post('/administradores', notif.adicionarAdministrador);
router.delete('/administradores/:id', notif.removerAdministrador);

// Consulta envios
router.get('/envios', notif.consultarEnvios);

export default router;
