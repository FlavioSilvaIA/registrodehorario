/**
 * UsuarioProjeto Controller - Projetos do usuário com horas ou percentual
 */
import { Request, Response } from 'express';
import { UsuarioProjeto, Usuario, Projeto } from '../models';

export async function listarPorUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const registros = await UsuarioProjeto.findAll({
      where: { usuarioId: id },
      include: [{ model: Projeto, as: 'Projeto', attributes: ['projetoId', 'projetoDescricao'] }],
      order: [['projetoId', 'ASC']],
    });
    res.json(registros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar projetos do usuário' });
  }
}

export async function salvarPorUsuario(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    const itens = Array.isArray(req.body) ? req.body : (req.body?.usuarioProjetos ?? req.body?.itens ?? []);
    await UsuarioProjeto.destroy({ where: { usuarioId: id } });

    for (const item of itens) {
      const projetoId = item.projetoId ?? item.projeto_id;
      if (!projetoId) continue;
      const tipo = (item.tipo ?? item.usuario_projeto_tipo ?? 'P') === 'H' ? 'H' : 'P';
      const valor = Number(item.valor ?? item.usuario_projeto_valor ?? (tipo === 'P' ? 100 : 0));
      await UsuarioProjeto.create({
        usuarioId: Number(id),
        projetoId: Number(projetoId),
        tipo,
        valor: tipo === 'P' ? Math.min(100, Math.max(0, [25, 50, 75, 100].includes(valor) ? valor : 100)) : Math.max(0, valor),
      });
    }

    const registros = await UsuarioProjeto.findAll({
      where: { usuarioId: id },
      include: [{ model: Projeto, as: 'Projeto', attributes: ['projetoId', 'projetoDescricao'] }],
    });
    res.json(registros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar projetos do usuário' });
  }
}
