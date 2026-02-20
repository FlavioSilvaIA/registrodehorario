import { Request, Response } from 'express';
import { Evento } from '../models';
import type { JwtPayload } from '../middleware/auth';

export async function listar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const eventos = await Evento.findAll({ order: [['eventoData', 'DESC']] });
    res.json(eventos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
}

export async function criar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const b = req.body;
    const descricao = b?.eventoDescricao != null ? String(b.eventoDescricao).trim() : '';
    if (!descricao) return res.status(400).json({ error: 'Descrição é obrigatória' });
    let dataStr = (b?.eventoData || new Date().toISOString().split('T')[0]).toString().trim();
    let dataFinalStr = (b?.eventoDataFinal || dataStr).toString().trim();
    if (dataStr.includes('/')) dataStr = dataStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
    if (dataFinalStr.includes('/')) dataFinalStr = dataFinalStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1');
    dataStr = dataStr.slice(0, 10);
    dataFinalStr = dataFinalStr.slice(0, 10);
    const agora = new Date();
    const evento = await Evento.create({
      eventoDescricao: descricao,
      eventoTipo: Number(b?.eventoTipo) || 1,
      eventoData: dataStr,
      eventoDataFinal: dataFinalStr,
      eventoCadastroDataHora: agora,
      eventoAbrangencia: Number(b?.eventoAbrangencia) || 1,
      eventoDiaInteiro: b?.eventoDiaInteiro !== false,
      eventoInicioDataHora: new Date(`${dataStr}T00:00:00`),
      eventoFinalDataHora: new Date(`${dataFinalStr}T23:59:59`),
      eventoEmpresaId: b?.eventoEmpresaId || null,
      eventoUsuarioId: b?.eventoUsuarioId || null,
    });
    res.status(201).json(evento);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Erro ao criar evento';
    res.status(500).json({ error: msg });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const evento = await Evento.findByPk(id);
    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
    await evento.update(req.body);
    res.json(evento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const evento = await Evento.findByPk(id);
    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
    await evento.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir evento' });
  }
}
