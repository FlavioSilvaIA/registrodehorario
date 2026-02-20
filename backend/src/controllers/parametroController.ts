import { Request, Response } from 'express';
import { Parametro } from '../models';

export async function listar(req: Request, res: Response) {
  try {
    const parametros = await Parametro.findAll({ order: [['parametroChave', 'ASC']] });
    res.json(parametros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar parâmetros' });
  }
}

export async function salvar(req: Request, res: Response) {
  try {
    const { parametroChave, parametroValor } = req.body;
    if (!parametroChave?.trim()) return res.status(400).json({ error: 'Chave obrigatória' });
    let parametro = await Parametro.findOne({ where: { parametroChave: parametroChave.trim() } });
    if (parametro) {
      await parametro.update({ parametroValor: parametroValor ?? '' });
    } else {
      parametro = await Parametro.create({ parametroChave: parametroChave.trim(), parametroValor: parametroValor ?? '' });
    }
    res.json(parametro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar parâmetro' });
  }
}

export async function excluir(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parametro = await Parametro.findByPk(id);
    if (!parametro) return res.status(404).json({ error: 'Parâmetro não encontrado' });
    await parametro.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir parâmetro' });
  }
}
