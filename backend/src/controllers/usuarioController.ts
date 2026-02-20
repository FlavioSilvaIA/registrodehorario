/**
 * Usuario Controller - Equivalente a SdLogin, Context
 * Origem: sdlogin.properties.json, registrohorario.gxapp.json
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { Usuario, Empresa, Equipe } from '../models';
import type { JwtPayload } from '../middleware/auth';

export async function listar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { todos, nome, email, perfil, empresa, equipe, situacao } = req.query;
    const where: Record<string, unknown> = {};
    if (todos !== '1') where.usuarioAtivo = true;
    if (situacao === 'A' || situacao === '1') where.usuarioAtivo = true;
    if (situacao === 'I' || situacao === '0') where.usuarioAtivo = false;
    if (nome && String(nome).trim()) where.usuarioNome = { [Op.like]: `%${String(nome).trim()}%` };
    if (email && String(email).trim()) where.usuarioEmail = { [Op.like]: `%${String(email).trim()}%` };
    if (perfil && Number(perfil) > 0) where.usuarioPerfil = Number(perfil);
    if (empresa && Number(empresa) > 0) where.usuarioEmpresaId = Number(empresa);
    if (equipe && Number(equipe) > 0) where.equipeId = Number(equipe);

    const usuarios = await Usuario.findAll({
      where,
      attributes: todos === '1' ? { exclude: ['usuarioSenha'] } : ['usuarioId', 'usuarioNome', 'usuarioLogin'],
      include: todos === '1' ? [
        { model: Empresa, as: 'Empresa', attributes: ['empresaDescricao'], required: false },
        { model: Equipe, as: 'Equipe', attributes: ['equipeDescricao'], required: false },
      ] : [],
      order: [['usuarioNome', 'ASC']],
    });
    res.json(usuarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const b = req.body;
    const login = b?.usuarioLogin != null ? String(b.usuarioLogin).trim() : '';
    const nome = b?.usuarioNome != null ? String(b.usuarioNome).trim() : '';
    const email = b?.usuarioEmail != null ? String(b.usuarioEmail).trim() : '';
    if (!login) return res.status(400).json({ error: 'Login é obrigatório' });
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });
    const existente = await Usuario.findOne({ where: { usuarioLogin: login } });
    if (existente) return res.status(400).json({ error: 'Login já está em uso. Escolha outro.' });
    const hash = b?.usuarioSenha ? await bcrypt.hash(String(b.usuarioSenha), 10) : await bcrypt.hash('123456', 10);
    const hoje = new Date().toISOString().split('T')[0];
    const dataEntrada = b?.usuarioDataEntrada ? String(b.usuarioDataEntrada).slice(0, 10) : hoje;
    const dataSaida = b?.usuarioDataSaida ? String(b.usuarioDataSaida).slice(0, 10) : null;
    let ativo = b?.usuarioAtivo !== false;
    if (dataSaida && dataSaida < hoje) ativo = false;
    const usuario = await Usuario.create({
      usuarioLogin: login,
      usuarioNome: nome,
      usuarioEmail: email,
      usuarioSenha: hash,
      usuarioPerfil: Number(b?.usuarioPerfil) ?? 4,
      usuarioEmpresaId: b?.usuarioEmpresaId != null && b.usuarioEmpresaId !== '' ? Number(b.usuarioEmpresaId) : null,
      equipeId: b?.equipeId != null && b.equipeId !== '' ? Number(b.equipeId) : null,
      usuarioEmailGestor: b?.usuarioEmailGestor ? String(b.usuarioEmailGestor).trim() : null,
      usuarioReferenciaData: (b?.usuarioReferenciaData ? String(b.usuarioReferenciaData).slice(0, 10) : hoje) as unknown as Date,
      usuarioDataEntrada: dataEntrada as unknown as Date,
      usuarioDataSaida: dataSaida as unknown as Date | undefined,
      usuarioCargaHoraria: Number(b?.usuarioCargaHoraria) ?? 44,
      usuarioTotalHorasMensais: Number(b?.usuarioTotalHorasMensais) ?? 176,
      usuarioAtivo: ativo,
      usuarioObrigatorioComentario: b?.usuarioObrigatorioComentario ?? false,
      usuarioObrigatorioProjeto: b?.usuarioObrigatorioProjeto ?? false,
      usuarioAvisosAtivo: b?.usuarioAvisosAtivo ?? false,
      usuarioHoraPrevistaChegada: b?.usuarioHoraPrevistaChegada ? String(b.usuarioHoraPrevistaChegada).slice(0, 5) : null,
      usuarioHoraPrevistaSaida: b?.usuarioHoraPrevistaSaida ? String(b.usuarioHoraPrevistaSaida).slice(0, 5) : null,
      usuarioHoraPrevistaAlmocoSaida: b?.usuarioHoraPrevistaAlmocoSaida ? String(b.usuarioHoraPrevistaAlmocoSaida).slice(0, 5) : null,
      usuarioHoraPrevistaAlmocoChegada: b?.usuarioHoraPrevistaAlmocoChegada ? String(b.usuarioHoraPrevistaAlmocoChegada).slice(0, 5) : null,
      usuarioTravaApontamento: b?.usuarioTravaApontamento ?? false,
      usuarioFotoBase64: b?.usuarioFotoBase64 || null,
      usuarioFotoNome: b?.usuarioFotoNome || null,
      usuarioFotoExtensao: b?.usuarioFotoExtensao || null,
    });
    res.status(201).json(usuario);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Erro ao criar usuário';
    res.status(500).json({ error: msg });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    const b = req.body;
    const upd: Record<string, unknown> = {};
    if (b?.usuarioLogin != null) {
      const novoLogin = String(b.usuarioLogin).trim();
      if (!novoLogin) return res.status(400).json({ error: 'Login é obrigatório' });
      const outro = await Usuario.findOne({ where: { usuarioLogin: novoLogin } });
      if (outro && outro.usuarioId !== usuario.usuarioId) return res.status(400).json({ error: 'Login já está em uso. Escolha outro.' });
      upd.usuarioLogin = novoLogin;
    }
    if (b?.usuarioNome != null) {
      const nome = String(b.usuarioNome).trim();
      if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
      upd.usuarioNome = nome;
    }
    if (b?.usuarioEmail != null) {
      const email = String(b.usuarioEmail).trim();
      if (!email) return res.status(400).json({ error: 'E-mail é obrigatório' });
      upd.usuarioEmail = email;
    }
    if (b?.usuarioSenha && String(b.usuarioSenha).trim()) upd.usuarioSenha = await bcrypt.hash(String(b.usuarioSenha), 10);
    if (b?.usuarioPerfil != null) upd.usuarioPerfil = Number(b.usuarioPerfil);
    if (b?.usuarioEmpresaId !== undefined) upd.usuarioEmpresaId = b.usuarioEmpresaId != null && b.usuarioEmpresaId !== '' ? Number(b.usuarioEmpresaId) : null;
    if (b?.equipeId !== undefined) upd.equipeId = b.equipeId != null && b.equipeId !== '' ? Number(b.equipeId) : null;
    if (b?.usuarioCargaHoraria != null) upd.usuarioCargaHoraria = Number(b.usuarioCargaHoraria);
    if (b?.usuarioAtivo !== undefined) upd.usuarioAtivo = b.usuarioAtivo;
    if (b?.usuarioEmailGestor !== undefined) upd.usuarioEmailGestor = b.usuarioEmailGestor ? String(b.usuarioEmailGestor).trim() : null;
    if (b?.usuarioDataEntrada !== undefined) upd.usuarioDataEntrada = b.usuarioDataEntrada ? String(b.usuarioDataEntrada).slice(0, 10) : null;
    if (b?.usuarioDataSaida !== undefined) upd.usuarioDataSaida = b.usuarioDataSaida ? String(b.usuarioDataSaida).slice(0, 10) : null;
    if (b?.usuarioReferenciaData !== undefined) upd.usuarioReferenciaData = b.usuarioReferenciaData ? String(b.usuarioReferenciaData).slice(0, 10) : null;
    if (b?.usuarioAvisosAtivo !== undefined) upd.usuarioAvisosAtivo = b.usuarioAvisosAtivo === true;
    if (b?.usuarioObrigatorioComentario !== undefined) upd.usuarioObrigatorioComentario = b.usuarioObrigatorioComentario === true;
    if (b?.usuarioObrigatorioProjeto !== undefined) upd.usuarioObrigatorioProjeto = b.usuarioObrigatorioProjeto === true;
    if (b?.usuarioTotalHorasMensais != null) upd.usuarioTotalHorasMensais = Number(b.usuarioTotalHorasMensais);
    if (b?.usuarioHoraPrevistaChegada !== undefined) upd.usuarioHoraPrevistaChegada = b.usuarioHoraPrevistaChegada ? String(b.usuarioHoraPrevistaChegada).slice(0, 5) : null;
    if (b?.usuarioHoraPrevistaSaida !== undefined) upd.usuarioHoraPrevistaSaida = b.usuarioHoraPrevistaSaida ? String(b.usuarioHoraPrevistaSaida).slice(0, 5) : null;
    if (b?.usuarioHoraPrevistaAlmocoSaida !== undefined) upd.usuarioHoraPrevistaAlmocoSaida = b.usuarioHoraPrevistaAlmocoSaida ? String(b.usuarioHoraPrevistaAlmocoSaida).slice(0, 5) : null;
    if (b?.usuarioHoraPrevistaAlmocoChegada !== undefined) upd.usuarioHoraPrevistaAlmocoChegada = b.usuarioHoraPrevistaAlmocoChegada ? String(b.usuarioHoraPrevistaAlmocoChegada).slice(0, 5) : null;
    if (b?.usuarioTravaApontamento !== undefined) upd.usuarioTravaApontamento = b.usuarioTravaApontamento === true;
    if (b?.usuarioFotoBase64 !== undefined) upd.usuarioFotoBase64 = b.usuarioFotoBase64 || null;
    if (b?.usuarioFotoNome !== undefined) upd.usuarioFotoNome = b.usuarioFotoNome || null;
    if (b?.usuarioFotoExtensao !== undefined) upd.usuarioFotoExtensao = b.usuarioFotoExtensao || null;
    if (b?.usuarioDataSaida && String(b.usuarioDataSaida).slice(0, 10) < new Date().toISOString().split('T')[0]) upd.usuarioAtivo = false;
    await usuario.update(upd);
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    await usuario.update({ usuarioAtivo: false });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
}

export async function getMe(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuario = await Usuario.findByPk(req.user!.usuarioId, {
      attributes: ['usuarioId', 'usuarioLogin', 'usuarioNome', 'usuarioPerfil', 'usuarioEmpresaId', 'equipeId', 'usuarioEmail', 'usuarioCargaHoraria', 'usuarioObrigatorioComentario', 'usuarioObrigatorioProjeto'],
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
}
