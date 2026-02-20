import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Empresa } from '../models';

export async function listar(req: Request, res: Response) {
  try {
    const { descricao, tipoFaturamento, situacao } = req.query;
    const where: Record<string, unknown> = {};
    if (descricao && String(descricao).trim()) {
      where.empresaDescricao = { [Op.like]: `%${String(descricao).trim()}%` };
    }
    if (tipoFaturamento && String(tipoFaturamento).trim()) {
      where.empresaTipoFaturamento = String(tipoFaturamento).trim();
    }
    if (situacao && String(situacao).trim()) {
      where.empresaSituacao = String(situacao).trim();
    }
    const empresas = await Empresa.findAll({
      where: Object.keys(where).length ? where : undefined,
      order: [['empresaDescricao', 'ASC']],
    });
    res.json(empresas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
}

export async function criar(req: Request, res: Response) {
  try {
    const b = req.body;
    const descricao = b?.empresaDescricao != null ? String(b.empresaDescricao).trim() : '';
    if (!descricao) return res.status(400).json({ error: 'Descrição é obrigatória' });
    const empresa = await Empresa.create({
      empresaDescricao: descricao,
      empresaTipoFaturamento: b?.empresaTipoFaturamento ? String(b.empresaTipoFaturamento).trim() : undefined,
      empresaSituacao: b?.empresaSituacao ? String(b.empresaSituacao).trim() : undefined,
    });
    res.status(201).json(empresa);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Erro ao criar empresa';
    res.status(500).json({ error: msg });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });
    const b = req.body;
    const upd: Record<string, unknown> = {};
    if (b?.empresaDescricao != null) upd.empresaDescricao = String(b.empresaDescricao).trim();
    if (b?.empresaTipoFaturamento !== undefined) upd.empresaTipoFaturamento = b?.empresaTipoFaturamento ? String(b.empresaTipoFaturamento).trim() : null;
    if (b?.empresaSituacao !== undefined) upd.empresaSituacao = b?.empresaSituacao ? String(b.empresaSituacao).trim() : null;
    await empresa.update(upd);
    res.json(empresa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });
    await empresa.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
}
