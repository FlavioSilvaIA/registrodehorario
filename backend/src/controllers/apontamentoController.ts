/**
 * Apontamento Controller - Equivalente a RegistrarApontamento, VerificaApontamentoEmAberto
 * Origem: Metadata/TableAccess/RegistrarApontamento.xml, VerificaApontamentoEmAberto.xml
 */
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';
import { Apontamento, Usuario, Projeto, ProjetoEtapaAtividade } from '../models';
import { Situacao, TipoApontamento, OrigemApontamento } from '../types/enums';
import type { JwtPayload } from '../middleware/auth';

/** Retorna data e hora atuais do servidor (para botões "usar horário atual" na tela de registro) */
export async function getServidorAgora(_req: Request, res: Response) {
  try {
    const agora = new Date();
    const data = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    res.json({ data, hora });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter horário do servidor' });
  }
}

export async function getApontamentoAberto(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const hoje = new Date().toISOString().split('T')[0];
    const apontamento = await Apontamento.findOne({
      where: {
        usuarioId,
        apontamentoData: hoje as unknown as Date,
        apontamentoSituacao: Situacao.Cadastrado,
        apontamentoFinalDataHora: { [Op.eq]: null },
      },
      include: [{ model: Projeto, as: 'Projeto', attributes: ['projetoId', 'projetoDescricao'], required: false }],
    });
    res.json({ apontamento: apontamento || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar apontamento' });
  }
}

export async function registrarEntrada(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const { projetoId, projetoEtapaAtividadeId, apontamentoComentario, apontamentoTipo, apontamentoInicioGeolocation } = req.body;

    const hoje = new Date().toISOString().split('T')[0];
    const existe = await Apontamento.findOne({
      where: {
        usuarioId,
        apontamentoData: hoje as unknown as Date,
        apontamentoSituacao: Situacao.Cadastrado,
        apontamentoFinalDataHora: { [Op.eq]: null },
      },
    });
    if (existe) {
      return res.status(400).json({ error: 'Já existe apontamento em aberto para hoje' });
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (usuario.usuarioObrigatorioProjeto && !projetoId) {
      return res.status(400).json({ error: 'Projeto é obrigatório para este usuário' });
    }
    if (usuario.usuarioObrigatorioComentario && !apontamentoComentario?.trim()) {
      return res.status(400).json({ error: 'Comentário é obrigatório para este usuário' });
    }

    if (projetoId) {
      const projeto = await Projeto.findByPk(projetoId);
      if (projeto?.projetoComentarioObrigatorio && !apontamentoComentario?.trim()) {
        return res.status(400).json({ error: 'Comentário é obrigatório para este projeto' });
      }
      if (projeto?.projetoAtividadeObrigatoria && !projetoEtapaAtividadeId) {
        return res.status(400).json({ error: 'Atividade é obrigatória para este projeto' });
      }
    }

    const agora = new Date();
    const apontamento = await Apontamento.create({
      apontamentoCadastroDataHora: agora,
      apontamentoInicioDataHora: agora,
      apontamentoData: hoje as unknown as Date,
      apontamentoFinalDataHora: undefined,
      apontamentoSituacao: Situacao.Cadastrado,
      usuarioId,
      projetoId: projetoId || null,
      projetoEtapaAtividadeId: projetoEtapaAtividadeId || null,
      apontamentoComentario: apontamentoComentario || null,
      apontamentoTipo: apontamentoTipo ?? TipoApontamento.Normal,
      apontamentoInicioOrigem: OrigemApontamento.Web,
      apontamentoInicioGeolocation: apontamentoInicioGeolocation || undefined,
    });
    res.status(201).json(apontamento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar entrada' });
  }
}

export async function registrarSaida(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const { id } = req.params;
    const { apontamentoFimGeolocation } = req.body;

    const apontamento = await Apontamento.findOne({
      where: { apontamentoId: id, usuarioId, apontamentoFinalDataHora: { [Op.eq]: null } },
    });
    if (!apontamento) {
      return res.status(404).json({ error: 'Apontamento em aberto não encontrado' });
    }

    const agora = new Date();
    const inicio = new Date(apontamento.apontamentoInicioDataHora);
    const horas = (agora.getTime() - inicio.getTime()) / (1000 * 60 * 60);

    await apontamento.update({
      apontamentoFinalDataHora: agora,
      apontamentoFimOrigem: OrigemApontamento.Web,
      apontamentoHoras: Math.round(horas * 100) / 100,
      apontamentoFimGeolocation: apontamentoFimGeolocation || undefined,
    });
    res.json(apontamento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar saída' });
  }
}

export async function getHorasDia(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const hoje = new Date().toISOString().split('T')[0];
    const apontamentos = await Apontamento.findAll({
      where: { usuarioId, apontamentoData: hoje as unknown as Date, apontamentoSituacao: Situacao.Cadastrado },
      attributes: ['apontamentoHoras'],
    });
    const total = apontamentos.reduce((acc, a) => acc + (Number(a.apontamentoHoras) || 0), 0);
    res.json({ horasTotal: total.toFixed(2), itens: apontamentos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter horas do dia' });
  }
}

export async function listarApontamentos(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const { dataInicio, dataFim } = req.query;
    const where: Record<string, unknown> = { usuarioId };
    if (dataInicio) where.apontamentoData = { [Op.gte]: dataInicio };
    if (dataFim) where.apontamentoData = { ...(where.apontamentoData as object), [Op.lte]: dataFim };
    const apontamentos = await Apontamento.findAll({
      where,
      include: [
        { model: Projeto, as: 'Projeto', attributes: ['projetoDescricao'] },
        { model: ProjetoEtapaAtividade, as: 'ProjetoEtapaAtividade', attributes: ['projetoEtapaAtividadeNome'] },
      ],
      order: [['apontamentoData', 'DESC'], ['apontamentoInicioDataHora', 'DESC']],
    });
    res.json(apontamentos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar apontamentos' });
  }
}

/** Lista apontamentos com resumo (Previstas, Normal, Excedentes, Abonadas, Saldo) - Lista de Apontamento */
export async function listarComResumo(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { mes, ano, colaboradorId } = req.query;
    const usuarioId = colaboradorId ? Number(colaboradorId) : req.user!.usuarioId;
    const mesNum = mes ? Number(mes) : new Date().getMonth() + 1;
    const anoNum = ano ? Number(ano) : new Date().getFullYear();
    const dataInicio = `${anoNum}-${String(mesNum).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anoNum, mesNum, 0).getDate();
    const dataFim = `${anoNum}-${String(mesNum).padStart(2, '0')}-${ultimoDia}`;

    const apontamentos = await Apontamento.findAll({
      where: {
        usuarioId,
        apontamentoData: { [Op.between]: [dataInicio, dataFim] },
        apontamentoSituacao: Situacao.Cadastrado,
        [Op.and]: [sequelize.literal('apontamento_final_data_hora IS NOT NULL')],
      },
      include: [
        { model: Projeto, as: 'Projeto', attributes: ['projetoDescricao'], required: false },
        { model: ProjetoEtapaAtividade, as: 'ProjetoEtapaAtividade', attributes: ['projetoEtapaAtividadeNome'], required: false },
      ],
      order: [['apontamentoData', 'ASC'], ['apontamentoInicioDataHora', 'ASC']],
    });

    const usuario = await Usuario.findByPk(usuarioId);
    const cargaHoraria = Number(usuario?.usuarioCargaHoraria) || 44;
    const diasUteis = Math.ceil(ultimoDia * 5 / 7);
    const previstas = (diasUteis * cargaHoraria / 30).toFixed(2);

    let normal = 0, excedentes = 0, abonadas = 0;
    for (const a of apontamentos) {
      const h = Number(a.apontamentoHoras) || 0;
      const t = Number(a.apontamentoTipo) || 1;
      if (t === 1) normal += h;
      else if (t >= 7 && t <= 10) excedentes += h;
      else if (t === 6) abonadas += h;
    }
    const saldo = (Number(previstas) - normal + excedentes - abonadas).toFixed(2);

    res.json({
      apontamentos,
      resumo: {
        previstas,
        normal: normal.toFixed(2),
        excedentes: excedentes.toFixed(2),
        abonadas: abonadas.toFixed(2),
        saldo,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar apontamentos' });
  }
}

/** Registro manual de entrada e saída - sem controle automático do sistema */
export async function registrarManual(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const {
      data,
      inicio,
      fim,
      projetoId,
      projetoEtapaAtividadeId,
      apontamentoComentario,
      apontamentoTipo,
    } = req.body;

    if (!data || !inicio || !fim) {
      return res.status(400).json({ error: 'Data, hora de início e hora de saída são obrigatórios' });
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    if (usuario.usuarioObrigatorioProjeto && !projetoId) {
      return res.status(400).json({ error: 'Projeto é obrigatório para este usuário' });
    }
    if (usuario.usuarioObrigatorioComentario && !apontamentoComentario?.trim()) {
      return res.status(400).json({ error: 'Comentário é obrigatório para este usuário' });
    }

    if (projetoId) {
      const projeto = await Projeto.findByPk(projetoId);
      if (projeto?.projetoComentarioObrigatorio && !apontamentoComentario?.trim()) {
        return res.status(400).json({ error: 'Comentário é obrigatório para este projeto' });
      }
      if (projeto?.projetoAtividadeObrigatoria && !projetoEtapaAtividadeId) {
        return res.status(400).json({ error: 'Atividade é obrigatória para este projeto' });
      }
    }

    const dataStr = data.includes('/') ? data.split('/').reverse().join('-') : data;
    const inicioStr = inicio.length <= 5 ? `${inicio}:00` : inicio;
    const fimStr = fim.length <= 5 ? `${fim}:00` : fim;
    const inicioDt = new Date(`${dataStr}T${inicioStr}`);
    const fimDt = new Date(`${dataStr}T${fimStr}`);

    if (isNaN(inicioDt.getTime()) || isNaN(fimDt.getTime())) {
      return res.status(400).json({ error: 'Data ou horário inválido' });
    }
    if (fimDt.getTime() <= inicioDt.getTime()) {
      return res.status(400).json({ error: 'Hora de saída deve ser posterior à hora de entrada' });
    }

    const horas = (fimDt.getTime() - inicioDt.getTime()) / (1000 * 60 * 60);

    const apontamento = await Apontamento.create({
      apontamentoCadastroDataHora: new Date(),
      apontamentoInicioDataHora: inicioDt,
      apontamentoData: dataStr,
      apontamentoFinalDataHora: fimDt,
      apontamentoSituacao: Situacao.Cadastrado,
      apontamentoHoras: Math.round(horas * 100) / 100,
      usuarioId,
      projetoId: projetoId || null,
      projetoEtapaAtividadeId: projetoEtapaAtividadeId || null,
      apontamentoComentario: apontamentoComentario || null,
      apontamentoTipo: apontamentoTipo ?? TipoApontamento.Normal,
      apontamentoInicioOrigem: OrigemApontamento.Web,
      apontamentoFimOrigem: OrigemApontamento.Web,
    });
    res.status(201).json(apontamento);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar apontamento manual' });
  }
}

/** Importar apontamentos de Excel/CSV - formato: Data;Início;Fim;UsuarioLogin;ProjetoId;AtividadeId;Horas;Comentário */
export async function importarApontamentos(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { linhas } = req.body as { linhas: Array<{ data: string; inicio: string; fim: string; usuarioLogin: string; projetoId?: number; atividadeId?: number; horas?: number; comentario?: string; tipo?: number }> };
    if (!Array.isArray(linhas) || linhas.length === 0) return res.status(400).json({ error: 'Nenhuma linha para importar' });

    let criados = 0;
    const erros: string[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const row = linhas[i];
      const { data, inicio, fim, usuarioLogin, projetoId, atividadeId, horas, comentario, tipo } = row;
      if (!data || !inicio || !fim || !usuarioLogin) {
        erros.push(`Linha ${i + 2}: Data, Início, Fim e UsuarioLogin são obrigatórios`);
        continue;
      }

      const usuario = await Usuario.findOne({ where: { usuarioLogin } });
      if (!usuario) {
        erros.push(`Linha ${i + 2}: Usuário "${usuarioLogin}" não encontrado`);
        continue;
      }

      const dataStr = data.includes('/') ? data.split('/').reverse().join('-') : data;
      const inicioDt = new Date(`${dataStr}T${inicio.length <= 5 ? inicio + ':00' : inicio}`);
      const fimDt = new Date(`${dataStr}T${fim.length <= 5 ? fim + ':00' : fim}`);
      const horasCalc = horas ?? (fimDt.getTime() - inicioDt.getTime()) / (1000 * 60 * 60);

      if (isNaN(inicioDt.getTime()) || isNaN(fimDt.getTime())) {
        erros.push(`Linha ${i + 2}: Data/hora inválida`);
        continue;
      }

      await Apontamento.create({
        apontamentoCadastroDataHora: new Date(),
        apontamentoInicioDataHora: inicioDt,
        apontamentoData: dataStr as unknown as Date,
        apontamentoFinalDataHora: fimDt,
        apontamentoSituacao: Situacao.Cadastrado,
        apontamentoHoras: Math.round(horasCalc * 100) / 100,
        usuarioId: usuario.usuarioId,
        projetoId: projetoId ?? undefined,
        projetoEtapaAtividadeId: atividadeId ?? undefined,
        apontamentoComentario: comentario || undefined,
        apontamentoTipo: (tipo ?? TipoApontamento.Normal) as TipoApontamento,
        apontamentoInicioOrigem: OrigemApontamento.Web,
        apontamentoFimOrigem: OrigemApontamento.Web,
      });
      criados++;
    }

    res.json({ criados, total: linhas.length, erros: erros.slice(0, 20) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao importar apontamentos' });
  }
}
