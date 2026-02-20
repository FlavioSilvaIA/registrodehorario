import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { RegistroAvisoLog, Usuario } from '../models';

export async function listar(req: Request, res: Response) {
  try {
    const { limite, descricao, colaborador, data } = req.query;
    const limit = limite ? Math.min(Number(limite), 500) : 100;

    const where: Record<string, unknown> = {};
    if (descricao && String(descricao).trim()) {
      where.registroAvisoLogObservacao = { [Op.like]: `%${String(descricao).trim()}%` };
    }
    if (colaborador && Number(colaborador) > 0) {
      where.registroAvisoLogUsuarioId = Number(colaborador);
    }
    if (data && String(data).trim()) {
      where.registroAvisoLogData = String(data).trim();
    }

    const logs = await RegistroAvisoLog.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioNome', 'usuarioLogin'], required: false }],
      order: [['registroAvisoLogDataHora', 'DESC']],
      limit,
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
}
