import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Equipe, Empresa } from '../models';

export async function listar(req: Request, res: Response) {
  try {
    const { descricao, empresa } = req.query;
    const where: Record<string, unknown> = {};
    if (descricao && String(descricao).trim()) {
      where.equipeDescricao = { [Op.like]: `%${String(descricao).trim()}%` };
    }
    if (empresa && Number(empresa) > 0) {
      where.equipeEmpresaId = Number(empresa);
    }
    const itens = await Equipe.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [{ model: Empresa, as: 'Empresa', attributes: ['empresaDescricao'], required: false }],
      order: [['equipeDescricao', 'ASC']],
    });
    const data = itens.map((e) => {
      const row = e.toJSON() as unknown as Record<string, unknown>;
      row.empresaDescricao = (e as unknown as { Empresa?: { empresaDescricao: string } })?.Empresa?.empresaDescricao ?? null;
      return row;
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar equipes' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const descricao = req.body?.equipeDescricao != null ? String(req.body.equipeDescricao).trim() : '';
    if (!descricao) return res.status(400).json({ error: 'Equipe é obrigatória' });
    const empresaId = req.body?.equipeEmpresaId != null && req.body.equipeEmpresaId !== '' ? Number(req.body.equipeEmpresaId) : null;
    const item = await Equipe.create({ equipeDescricao: descricao, equipeEmpresaId: empresaId });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Erro ao criar equipe';
    res.status(500).json({ error: msg });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await Equipe.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Equipe não encontrada' });
    const b = req.body;
    const upd: Record<string, unknown> = {};
    if (b?.equipeDescricao != null) upd.equipeDescricao = String(b.equipeDescricao).trim();
    if (b?.equipeEmpresaId !== undefined) upd.equipeEmpresaId = b.equipeEmpresaId != null && b.equipeEmpresaId !== '' ? Number(b.equipeEmpresaId) : null;
    await item.update(Object.keys(upd).length ? upd : req.body);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar equipe' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await Equipe.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Equipe não encontrada' });
    await item.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir equipe' });
  }
}
