/**
 * Projeto Controller - Equivalente a SdDashBoard_Level_Detail_GridProjeto
 * Origem: sddashboard.properties.json
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Projeto, ProjetoEtapa, ProjetoEtapaAtividade, Empresa, CentroCusto, Equipe } from '../models';
import type { JwtPayload } from '../middleware/auth';

export async function listarProjetos(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { todos, descricao, empresa, situacao } = req.query;
    const where: Record<string, unknown> = {};
    if (todos !== '1') where.projetoAtivo = true;
    if (descricao && String(descricao).trim()) {
      where.projetoDescricao = { [Op.like]: `%${String(descricao).trim()}%` };
    }
    if (empresa && Number(empresa) > 0) where.projetoEmpresaId = Number(empresa);
    if (situacao && String(situacao).trim()) where.projetoStatus = String(situacao).trim();

    const projetos = await Projeto.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [
        { model: Empresa, as: 'Empresa', attributes: ['empresaId', 'empresaDescricao'], required: false },
        { model: CentroCusto, as: 'CentroCusto', attributes: ['centroCustoId', 'centroCustoDescricao'], required: false },
        { model: Equipe, as: 'Equipe', attributes: ['equipeId', 'equipeDescricao'], required: false },
      ],
      order: [['projetoDescricao', 'ASC']],
    });
    res.json(projetos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar projetos' });
  }
}

export async function listarEtapas(req: Request, res: Response) {
  try {
    const { projetoId } = req.params;
    const etapas = await ProjetoEtapa.findAll({
      where: { projetoEtapaProjetoId: projetoId, projetoEtapaStatus: 'A' },
      order: [['projetoEtapaNome', 'ASC']],
    });
    res.json(etapas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar etapas' });
  }
}

export async function listarAtividades(req: Request, res: Response) {
  try {
    const { etapaId } = req.params;
    const atividades = await ProjetoEtapaAtividade.findAll({
      where: { projetoEtapaAtividadeEtapaId: etapaId, projetoEtapaAtividadeStatus: 'A' },
      order: [['projetoEtapaAtividadeNome', 'ASC']],
    });
    res.json(atividades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar atividades' });
  }
}

export async function criarProjeto(req: Request, res: Response) {
  try {
    const b = req.body;
    const descricao = b?.projetoDescricao != null ? String(b.projetoDescricao).trim() : '';
    if (!descricao) return res.status(400).json({ error: 'Descrição é obrigatória' });
    const empresaId = b?.projetoEmpresaId != null && b.projetoEmpresaId !== '' ? Number(b.projetoEmpresaId) : null;
    if (!empresaId) return res.status(400).json({ error: 'Empresa é obrigatória' });
    const projeto = await Projeto.create({
      projetoDescricao: descricao,
      projetoEmpresaId: empresaId,
      centroCustoId: b?.centroCustoId != null && b.centroCustoId !== '' ? Number(b.centroCustoId) : null,
      projetoValorHora: Number(b?.projetoValorHora) || 0,
      projetoAtivo: b?.projetoAtivo !== false,
      projetoStatus: (b?.projetoStatus || 'A').toString().charAt(0),
      projetoDataInicio: (b?.projetoDataInicio ? String(b.projetoDataInicio).slice(0, 10) : null) as unknown as Date | undefined,
      projetoDataFim: (b?.projetoDataFim ? String(b.projetoDataFim).slice(0, 10) : null) as unknown as Date | undefined,
      projetoTipo: (b?.projetoTipo ? String(b.projetoTipo).charAt(0) : null) as unknown as import('../types/enums').DMTipo | undefined,
      projetoComentarioObrigatorio: b?.projetoComentarioObrigatorio === true,
      projetoAtividadeObrigatoria: b?.projetoAtividadeObrigatoria === true,
      projetoDefault: b?.projetoDefault === true,
      projetoEquipeId: b?.projetoEquipeId != null && b.projetoEquipeId !== '' ? Number(b.projetoEquipeId) : null,
    });
    res.status(201).json(projeto);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Erro ao criar projeto';
    res.status(500).json({ error: msg });
  }
}

export async function atualizarProjeto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const projeto = await Projeto.findByPk(id);
    if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' });
    const b = req.body;
    const upd: Record<string, unknown> = {};
    if (b?.projetoDescricao != null) upd.projetoDescricao = String(b.projetoDescricao).trim();
    if (b?.projetoEmpresaId != null && b.projetoEmpresaId !== '') upd.projetoEmpresaId = Number(b.projetoEmpresaId);
    if (b?.centroCustoId !== undefined) upd.centroCustoId = b.centroCustoId != null && b.centroCustoId !== '' ? Number(b.centroCustoId) : null;
    if (b?.projetoValorHora != null) upd.projetoValorHora = Number(b.projetoValorHora);
    if (b?.projetoAtivo !== undefined) upd.projetoAtivo = b.projetoAtivo;
    if (b?.projetoStatus != null) upd.projetoStatus = String(b.projetoStatus).charAt(0);
    if (b?.projetoDataInicio !== undefined) upd.projetoDataInicio = b.projetoDataInicio ? String(b.projetoDataInicio).slice(0, 10) : null;
    if (b?.projetoDataFim !== undefined) upd.projetoDataFim = b.projetoDataFim ? String(b.projetoDataFim).slice(0, 10) : null;
    if (b?.projetoTipo !== undefined) upd.projetoTipo = b.projetoTipo ? String(b.projetoTipo).charAt(0) : null;
    if (b?.projetoComentarioObrigatorio !== undefined) upd.projetoComentarioObrigatorio = b.projetoComentarioObrigatorio === true;
    if (b?.projetoAtividadeObrigatoria !== undefined) upd.projetoAtividadeObrigatoria = b.projetoAtividadeObrigatoria === true;
    if (b?.projetoDefault !== undefined) upd.projetoDefault = b.projetoDefault === true;
    if (b?.projetoEquipeId !== undefined) upd.projetoEquipeId = b.projetoEquipeId != null && b.projetoEquipeId !== '' ? Number(b.projetoEquipeId) : null;
    await projeto.update(upd);
    res.json(projeto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
}

export async function excluirProjeto(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const projeto = await Projeto.findByPk(id);
    if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' });
    await projeto.update({ projetoAtivo: false });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir projeto' });
  }
}
