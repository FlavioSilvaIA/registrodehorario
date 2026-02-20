import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { CentroCusto, Empresa } from '../models';

export async function listar(req: Request, res: Response) {
  try {
    const { descricao, codigo, empresa } = req.query;
    const where: Record<string, unknown> = {};
    if (descricao && String(descricao).trim()) {
      where.centroCustoDescricao = { [Op.like]: `%${String(descricao).trim()}%` };
    }
    if (codigo != null && codigo !== '') {
      const id = Number(codigo);
      if (!isNaN(id)) where.centroCustoId = id;
    }
    if (empresa && Number(empresa) > 0) {
      where.centroCustoEmpresaId = Number(empresa);
    }
    const itens = await CentroCusto.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [{ model: Empresa, as: 'Empresa', attributes: ['empresaId', 'empresaDescricao'], required: false }],
      order: [['centroCustoDescricao', 'ASC']],
    });
    const rows = itens.map((c: any) => ({
      centroCustoId: c.centroCustoId,
      centroCustoDescricao: c.centroCustoDescricao,
      centroCustoEmpresaId: c.centroCustoEmpresaId ?? undefined,
      empresaDescricao: c.Empresa?.empresaDescricao || '-',
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar centros de custo' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const b = req.body;
    const descricao = b?.centroCustoDescricao != null ? String(b.centroCustoDescricao).trim() : '';
    if (!descricao) return res.status(400).json({ error: 'Descrição é obrigatória' });
    const empresaId = b?.centroCustoEmpresaId != null && b.centroCustoEmpresaId !== '' ? Number(b.centroCustoEmpresaId) : undefined;
    const item = await CentroCusto.create({
      centroCustoDescricao: descricao,
      centroCustoEmpresaId: empresaId,
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Erro ao criar centro de custo';
    res.status(500).json({ error: msg });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await CentroCusto.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Centro de custo não encontrado' });
    const b = req.body;
    const upd: Record<string, unknown> = {};
    if (b?.centroCustoDescricao != null) upd.centroCustoDescricao = String(b.centroCustoDescricao).trim();
    if (b?.centroCustoEmpresaId !== undefined) upd.centroCustoEmpresaId = b.centroCustoEmpresaId != null && b.centroCustoEmpresaId !== '' ? Number(b.centroCustoEmpresaId) : null;
    await item.update(upd);
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar centro de custo' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const item = await CentroCusto.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Centro de custo não encontrado' });
    await item.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir centro de custo' });
  }
}
