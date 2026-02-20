import { Request, Response } from 'express';
import { Mensagem, Usuario } from '../models';
import type { JwtPayload } from '../middleware/auth';

export async function listar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { situacao } = req.query;
    const where: Record<string, unknown> = {};
    if (situacao) where.mensagemSituacao = situacao;
    const mensagens = await Mensagem.findAll({
      where,
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioNome', 'usuarioLogin'], required: false }],
      order: [['mensagemCadastroDataHora', 'DESC']],
    });
    res.json(mensagens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar mensagens' });
  }
}

export async function criar(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const mensagem = await Mensagem.create({ ...req.body, remetenteUsuarioId: req.user!.usuarioId });
    res.status(201).json(mensagem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
}

export async function atualizar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const upd: Record<string, unknown> = {};
    if (req.body.mensagemTitulo !== undefined) upd.mensagemTitulo = req.body.mensagemTitulo;
    if (req.body.mensagemTexto !== undefined) upd.mensagemTexto = req.body.mensagemTexto;
    if (req.body.mensagemEnviaEmail !== undefined) upd.mensagemEnviaEmail = req.body.mensagemEnviaEmail;
    if (req.body.mensagemSituacao !== undefined) upd.mensagemSituacao = req.body.mensagemSituacao;
    const mensagem = await Mensagem.findByPk(id);
    if (!mensagem) return res.status(404).json({ error: 'Mensagem não encontrada' });
    await mensagem.update(upd);
    res.json(mensagem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar mensagem' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const mensagem = await Mensagem.findByPk(id);
    if (!mensagem) return res.status(404).json({ error: 'Mensagem não encontrada' });
    await mensagem.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir mensagem' });
  }
}
