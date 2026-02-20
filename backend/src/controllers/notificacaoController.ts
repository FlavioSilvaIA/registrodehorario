/**
 * Notificacao Controller - Cadastro, Alertas, Vincular usuário, Administradores, Consulta envios
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Device, UsuarioDevice, TipoAlerta, NotificacaoConfig, NotificacaoAdministrador, Usuario, Mensagem, Notificacao, Empresa, NotificacaoUsuario } from '../models';

// --- Cadastro (Notificações por empresa) ---
export async function listarNotificacoes(req: Request, res: Response) {
  try {
    const { empresa, notificacao, email, site, celular } = req.query;
    const where: Record<string, unknown> = {};
    if (empresa && String(empresa).trim()) where.empresaId = Number(empresa);
    if (notificacao && String(notificacao).trim()) where.notificacaoTexto = { [Op.like]: `%${String(notificacao).trim()}%` };
    if (email === '1' || email === 'true') where.notificacaoEnviaEmail = true;
    if (site === '1' || site === 'true') where.notificacaoEnviaSite = true;
    if (celular === '1' || celular === 'true') where.notificacaoEnviaCelular = true;
    const lista = await Notificacao.findAll({
      where,
      include: [{ model: Empresa, as: 'Empresa', attributes: ['empresaId', 'empresaDescricao'] }],
      order: [['notificacaoId', 'ASC']],
    });
    res.json(lista);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar notificações' });
  }
}

export async function criarNotificacao(req: Request, res: Response) {
  try {
    const b = req.body;
    const n = await Notificacao.create({
      empresaId: Number(b.empresaId),
      notificacaoTexto: b.notificacaoTexto || '',
      notificacaoEnviaEmail: b.notificacaoEnviaEmail === true || b.notificacaoEnviaEmail === '1',
      notificacaoEnviaSite: b.notificacaoEnviaSite === true || b.notificacaoEnviaSite === '1',
      notificacaoEnviaCelular: b.notificacaoEnviaCelular === true || b.notificacaoEnviaCelular === '1',
    });
    res.status(201).json(n);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar notificação' });
  }
}

export async function atualizarNotificacao(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const n = await Notificacao.findByPk(id);
    if (!n) return res.status(404).json({ error: 'Notificação não encontrada' });
    const b = req.body;
    await n.update({
      empresaId: b.empresaId !== undefined ? Number(b.empresaId) : n.empresaId,
      notificacaoTexto: b.notificacaoTexto !== undefined ? b.notificacaoTexto : n.notificacaoTexto,
      notificacaoEnviaEmail: b.notificacaoEnviaEmail !== undefined ? (b.notificacaoEnviaEmail === true || b.notificacaoEnviaEmail === '1') : n.notificacaoEnviaEmail,
      notificacaoEnviaSite: b.notificacaoEnviaSite !== undefined ? (b.notificacaoEnviaSite === true || b.notificacaoEnviaSite === '1') : n.notificacaoEnviaSite,
      notificacaoEnviaCelular: b.notificacaoEnviaCelular !== undefined ? (b.notificacaoEnviaCelular === true || b.notificacaoEnviaCelular === '1') : n.notificacaoEnviaCelular,
    });
    res.json(n);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar notificação' });
  }
}

export async function excluirNotificacao(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const n = await Notificacao.findByPk(id);
    if (!n) return res.status(404).json({ error: 'Notificação não encontrada' });
    await n.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir notificação' });
  }
}

// --- Config (legado, mantido para compatibilidade) ---
export async function listarConfig(req: Request, res: Response) {
  try {
    const configs = await NotificacaoConfig.findAll({ order: [['notificacaoConfigChave', 'ASC']] });
    res.json(configs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar configurações' });
  }
}

export async function salvarConfig(req: Request, res: Response) {
  try {
    const { chave, valor, descricao } = req.body;
    if (!chave || valor === undefined) return res.status(400).json({ error: 'Chave e valor são obrigatórios' });
    let config = await NotificacaoConfig.findOne({ where: { notificacaoConfigChave: chave } });
    if (config) {
      await config.update({ notificacaoConfigValor: String(valor), notificacaoConfigDescricao: descricao || null });
    } else {
      config = await NotificacaoConfig.create({ notificacaoConfigChave: chave, notificacaoConfigValor: String(valor), notificacaoConfigDescricao: descricao || null });
    }
    res.json(config);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar configuração' });
  }
}

// --- Alertas (TipoAlerta) ---
export async function listarTiposAlerta(req: Request, res: Response) {
  try {
    const tipos = await TipoAlerta.findAll({
      include: [{ model: Empresa, as: 'Empresa', attributes: ['empresaId', 'empresaDescricao'] }],
      order: [['tipoAlertaId', 'ASC']],
    });
    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar tipos de alerta' });
  }
}

export async function criarTipoAlerta(req: Request, res: Response) {
  try {
    const b = req.body;
    const tipo = await TipoAlerta.create({
      empresaId: b.empresaId ? Number(b.empresaId) : null,
      notificacaoId: b.notificacaoId ? Number(b.notificacaoId) : null,
      tipoAlertaDescricao: b.tipoAlertaDescricao || '',
      tipoAlertaTempoDe: b.tipoAlertaTempoDe != null ? Number(b.tipoAlertaTempoDe) : null,
      tipoAlertaTempoAte: b.tipoAlertaTempoAte != null ? Number(b.tipoAlertaTempoAte) : null,
      tipoAlertaNotificarAdministradores: b.tipoAlertaNotificarAdministradores === true || b.tipoAlertaNotificarAdministradores === '1',
      tipoAlertaAtivo: b.tipoAlertaAtivo !== false,
      tipoAlertaImagemBase64: b.tipoAlertaImagemBase64 || null,
      tipoAlertaImagemNome: b.tipoAlertaImagemNome || null,
      tipoAlertaImagemExtensao: b.tipoAlertaImagemExtensao || null,
    });
    res.status(201).json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tipo de alerta' });
  }
}

export async function atualizarTipoAlerta(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tipo = await TipoAlerta.findByPk(id);
    if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });
    const b = req.body;
    await tipo.update({
      empresaId: b.empresaId !== undefined ? (b.empresaId ? Number(b.empresaId) : null) : tipo.empresaId,
      notificacaoId: b.notificacaoId !== undefined ? (b.notificacaoId ? Number(b.notificacaoId) : null) : tipo.notificacaoId,
      tipoAlertaDescricao: b.tipoAlertaDescricao !== undefined ? b.tipoAlertaDescricao : tipo.tipoAlertaDescricao,
      tipoAlertaTempoDe: b.tipoAlertaTempoDe !== undefined ? (b.tipoAlertaTempoDe != null ? Number(b.tipoAlertaTempoDe) : null) : tipo.tipoAlertaTempoDe,
      tipoAlertaTempoAte: b.tipoAlertaTempoAte !== undefined ? (b.tipoAlertaTempoAte != null ? Number(b.tipoAlertaTempoAte) : null) : tipo.tipoAlertaTempoAte,
      tipoAlertaNotificarAdministradores: b.tipoAlertaNotificarAdministradores !== undefined ? (b.tipoAlertaNotificarAdministradores === true || b.tipoAlertaNotificarAdministradores === '1') : tipo.tipoAlertaNotificarAdministradores,
      tipoAlertaAtivo: b.tipoAlertaAtivo !== undefined ? b.tipoAlertaAtivo !== false : tipo.tipoAlertaAtivo,
      tipoAlertaImagemBase64: b.tipoAlertaImagemBase64 !== undefined ? b.tipoAlertaImagemBase64 : tipo.tipoAlertaImagemBase64,
      tipoAlertaImagemNome: b.tipoAlertaImagemNome !== undefined ? b.tipoAlertaImagemNome : tipo.tipoAlertaImagemNome,
      tipoAlertaImagemExtensao: b.tipoAlertaImagemExtensao !== undefined ? b.tipoAlertaImagemExtensao : tipo.tipoAlertaImagemExtensao,
    });
    res.json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tipo de alerta' });
  }
}

export async function excluirTipoAlerta(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tipo = await TipoAlerta.findByPk(id);
    if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });
    await tipo.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir tipo de alerta' });
  }
}

// --- Vincular usuário (NotificacaoUsuario: TipoAlerta ↔ Usuario) ---
export async function listarVinculosUsuario(req: Request, res: Response) {
  try {
    const vinculos = await NotificacaoUsuario.findAll({
      include: [
        { model: TipoAlerta, as: 'TipoAlerta', attributes: ['tipoAlertaId', 'tipoAlertaDescricao'] },
        { model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioEmail'] },
      ],
      order: [['notificacaoUsuarioId', 'ASC']],
    });
    res.json(vinculos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar vínculos' });
  }
}

export async function criarVinculoUsuario(req: Request, res: Response) {
  try {
    const { tipoAlertaId, usuarioId } = req.body;
    if (!tipoAlertaId || !usuarioId) return res.status(400).json({ error: 'Notificação e Colaborador são obrigatórios' });
    const existente = await NotificacaoUsuario.findOne({ where: { tipoAlertaId: Number(tipoAlertaId), usuarioId: Number(usuarioId) } });
    if (existente) return res.status(400).json({ error: 'Vínculo já existe' });
    const vinculo = await NotificacaoUsuario.create({ tipoAlertaId: Number(tipoAlertaId), usuarioId: Number(usuarioId) });
    const vinculoCompleto = await NotificacaoUsuario.findByPk(vinculo.notificacaoUsuarioId, {
      include: [
        { model: TipoAlerta, as: 'TipoAlerta', attributes: ['tipoAlertaId', 'tipoAlertaDescricao'] },
        { model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioEmail'] },
      ],
    });
    res.status(201).json(vinculoCompleto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao vincular usuário' });
  }
}

export async function excluirVinculoUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const vinculo = await NotificacaoUsuario.findByPk(id);
    if (!vinculo) return res.status(404).json({ error: 'Vínculo não encontrado' });
    await vinculo.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir vínculo' });
  }
}

// --- Vincular usuário (UsuarioDevice - legado) ---
export async function listarVinculos(req: Request, res: Response) {
  try {
    const vinculos = await UsuarioDevice.findAll({
      include: [
        { model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioEmail'] },
        { model: Device, as: 'Device', attributes: ['deviceCod', 'deviceName', 'deviceId', 'deviceType'] },
      ],
      order: [['usuarioDeviceId', 'ASC']],
    });
    res.json(vinculos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar vínculos' });
  }
}

export async function listarDevices(req: Request, res: Response) {
  try {
    const devices = await Device.findAll({ order: [['deviceName', 'ASC']] });
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar dispositivos' });
  }
}

export async function criarDevice(req: Request, res: Response) {
  try {
    const device = await Device.create(req.body);
    res.status(201).json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar dispositivo' });
  }
}

export async function vincularUsuario(req: Request, res: Response) {
  try {
    const { usuarioId, deviceCod } = req.body;
    if (!usuarioId || !deviceCod) return res.status(400).json({ error: 'usuarioId e deviceCod são obrigatórios' });
    const existente = await UsuarioDevice.findOne({ where: { usuarioId, deviceCod } });
    if (existente) return res.status(400).json({ error: 'Vínculo já existe' });
    const vinculo = await UsuarioDevice.create({ usuarioId: Number(usuarioId), deviceCod: Number(deviceCod) });
    res.status(201).json(vinculo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao vincular usuário' });
  }
}

export async function desvincularUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const vinculo = await UsuarioDevice.findByPk(id);
    if (!vinculo) return res.status(404).json({ error: 'Vínculo não encontrado' });
    await vinculo.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao desvincular' });
  }
}

// --- Administradores ---
export async function listarAdministradores(req: Request, res: Response) {
  try {
    const admins = await NotificacaoAdministrador.findAll({
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioEmail', 'usuarioLogin'] }],
      order: [['notificacaoAdministradorId', 'ASC']],
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar administradores' });
  }
}

export async function adicionarAdministrador(req: Request, res: Response) {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(400).json({ error: 'usuarioId é obrigatório' });
    const existente = await NotificacaoAdministrador.findOne({ where: { usuarioId } });
    if (existente) return res.status(400).json({ error: 'Usuário já é administrador' });
    const admin = await NotificacaoAdministrador.create({ usuarioId: Number(usuarioId) });
    res.status(201).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar administrador' });
  }
}

export async function removerAdministrador(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const admin = await NotificacaoAdministrador.findByPk(id);
    if (!admin) return res.status(404).json({ error: 'Administrador não encontrado' });
    await admin.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao remover administrador' });
  }
}

// --- Consulta envios (Mensagens) ---
export async function consultarEnvios(req: Request, res: Response) {
  try {
    const { situacao, dataDe, dataAte, titulo } = req.query;
    const where: Record<string, unknown> = {};
    if (situacao) where.mensagemSituacao = String(situacao);
    if (titulo && String(titulo).trim()) where.mensagemTitulo = { [Op.like]: `%${String(titulo).trim()}%` };
    if (dataDe && String(dataDe).trim()) where.mensagemCadastroDataHora = { ...(where.mensagemCadastroDataHora as object || {}), [Op.gte]: `${String(dataDe)}T00:00:00` };
    if (dataAte && String(dataAte).trim()) where.mensagemCadastroDataHora = { ...(where.mensagemCadastroDataHora as object || {}), [Op.lte]: `${String(dataAte)}T23:59:59` };
    const mensagens = await Mensagem.findAll({
      where,
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioEmail'] }],
      order: [['mensagemCadastroDataHora', 'DESC']],
    });
    res.json(mensagens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao consultar envios' });
  }
}
