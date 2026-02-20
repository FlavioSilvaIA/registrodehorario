import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Reembolso, TipoReembolso, Usuario } from '../models';
import type { JwtPayload } from '../middleware/auth';

export async function listar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { situacao, nome, dataDe, dataAte } = req.query;
    const where: Record<string, unknown> = {};
    if (situacao) where.reembolsoSituacao = Number(situacao);
    if (dataDe && String(dataDe).trim()) where.reembolsoData = { ...(where.reembolsoData as object || {}), [Op.gte]: String(dataDe).slice(0, 10) };
    if (dataAte && String(dataAte).trim()) where.reembolsoData = { ...(where.reembolsoData as object || {}), [Op.lte]: String(dataAte).slice(0, 10) };
    const whereUsuario: Record<string, unknown> = {};
    if (nome && String(nome).trim()) whereUsuario.usuarioNome = { [Op.like]: `%${String(nome).trim()}%` };
    const reembolsos = await Reembolso.findAll({
      where,
      include: [
        { model: Usuario, as: 'Usuario', attributes: ['usuarioNome', 'usuarioLogin'], where: Object.keys(whereUsuario).length ? whereUsuario : undefined, required: !!Object.keys(whereUsuario).length },
        { model: TipoReembolso, as: 'TipoReembolso', attributes: ['tipoReembolsoDescricao'] },
      ],
      order: [['reembolsoData', 'DESC']],
    });
    res.json(reembolsos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar reembolsos' });
  }
}

export async function criar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const b = req.body;
    const payload: Record<string, unknown> = {
      reembolsoUsuarioId: req.user!.usuarioId,
      reembolsoTipoReembolsoId: b?.reembolsoTipoReembolsoId ?? b?.tipoId,
      reembolsoValor: Number(b?.reembolsoValor ?? b?.valor ?? 0),
      reembolsoData: b?.reembolsoData ? String(b.reembolsoData).slice(0, 10) : new Date().toISOString().split('T')[0],
      reembolsoDescricao: b?.reembolsoDescricao ?? b?.descricao ?? b?.reembolsoObservacao ?? b?.observacao ?? null,
      reembolsoSituacao: 1,
      reembolsoDataNota: b?.reembolsoDataNota ? String(b.reembolsoDataNota).slice(0, 10) : null,
      reembolsoValorNota: b?.reembolsoValorNota != null ? Number(b.reembolsoValorNota) : (b?.reembolsoValor != null ? Number(b.reembolsoValor) : null),
      reembolsoValorReembolsado: b?.reembolsoValorReembolsado != null ? Number(b.reembolsoValorReembolsado) : null,
      reembolsoObservacao: b?.reembolsoObservacao ?? b?.observacao ?? null,
      reembolsoNotaFiscalBase64: b?.reembolsoNotaFiscalBase64 ?? null,
      reembolsoNotaFiscalNome: b?.reembolsoNotaFiscalNome ?? null,
      reembolsoConfirmar: b?.reembolsoConfirmar === true || b?.reembolsoConfirmar === '1',
    };
    const reembolso = await Reembolso.create(payload);
    res.status(201).json(reembolso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar reembolso' });
  }
}

export async function aprovar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { id } = req.params;
    const reembolso = await Reembolso.findByPk(id);
    if (!reembolso) return res.status(404).json({ error: 'Reembolso não encontrado' });
    const valorReembolsado = reembolso.reembolsoValorReembolsado ?? reembolso.reembolsoValor;
    await reembolso.update({ reembolsoSituacao: 2, reembolsoDataAprovacao: new Date(), reembolsoAprovadorUsuarioId: req.user!.usuarioId, reembolsoValorReembolsado: valorReembolsado });
    res.json(reembolso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao aprovar reembolso' });
  }
}

export async function negar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { id } = req.params;
    const reembolso = await Reembolso.findByPk(id);
    if (!reembolso) return res.status(404).json({ error: 'Reembolso não encontrado' });
    await reembolso.update({ reembolsoSituacao: 3, reembolsoDataAprovacao: new Date(), reembolsoAprovadorUsuarioId: req.user!.usuarioId });
    res.json(reembolso);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao negar reembolso' });
  }
}

export async function listarTipos(req: Request, res: Response) {
  try {
    const tipos = await TipoReembolso.findAll({ order: [['tipoReembolsoDescricao', 'ASC']] });
    res.json(tipos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar tipos' });
  }
}

export async function criarTipo(req: Request, res: Response) {
  try {
    const tipo = await TipoReembolso.create(req.body);
    res.status(201).json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tipo de reembolso' });
  }
}

export async function atualizarTipo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tipo = await TipoReembolso.findByPk(id);
    if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });
    await tipo.update(req.body);
    res.json(tipo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tipo' });
  }
}

export async function excluirTipo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tipo = await TipoReembolso.findByPk(id);
    if (!tipo) return res.status(404).json({ error: 'Tipo não encontrado' });
    await tipo.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir tipo' });
  }
}
