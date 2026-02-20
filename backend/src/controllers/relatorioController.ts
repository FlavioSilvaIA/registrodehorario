import { Request, Response } from 'express';
import { Apontamento, Usuario, Projeto, Reembolso, CentroCusto, Empresa, Equipe, Evento, UsuarioValorHora } from '../models';
import { Op } from 'sequelize';
import type { JwtPayload } from '../middleware/auth';
import { TipoApontamento } from '../types/enums';

/**
 * Relatório de horas por profissional
 * Equivalente a relatórios do sistema original GeneXus
 */
export async function horasPorProfissional(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { mes, ano, colaboradorId } = req.query;
    const m = mes ? Number(mes) : new Date().getMonth() + 1;
    const a = ano ? Number(ano) : new Date().getFullYear();
    const inicio = new Date(a, m - 1, 1);
    const fim = new Date(a, m, 0, 23, 59, 59);

    const where: Record<string, unknown> = {
      apontamentoSituacao: 1,
      apontamentoInicioDataHora: { [Op.between]: [inicio, fim] },
    };
    if (colaboradorId) where.usuarioId = Number(colaboradorId);

    const apontamentos = await Apontamento.findAll({
      where,
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioLogin'] }],
      order: [['usuarioId', 'ASC'], ['apontamentoInicioDataHora', 'ASC']],
    });

    const porUsuario = new Map<number, { usuario: { usuarioId: number; usuarioNome: string; usuarioLogin: string }; totalHoras: number; itens: typeof apontamentos }>();
    for (const ap of apontamentos) {
      const uid = ap.usuarioId;
      const horas = Number(ap.apontamentoHoras) || 0;
      const u = (ap as { Usuario?: { usuarioId: number; usuarioNome: string; usuarioLogin: string } }).Usuario;
      if (!u) continue;
      if (!porUsuario.has(uid)) {
        porUsuario.set(uid, { usuario: u, totalHoras: 0, itens: [] });
      }
      const ent = porUsuario.get(uid)!;
      ent.totalHoras += horas;
      ent.itens.push(ap);
    }

    const resultado = Array.from(porUsuario.values()).map((e) => ({
      usuarioId: e.usuario.usuarioId,
      usuarioNome: e.usuario.usuarioNome,
      usuarioLogin: e.usuario.usuarioLogin,
      totalHoras: e.totalHoras.toFixed(2),
      quantidade: e.itens.length,
    }));

    res.json({ mes: m, ano: a, profissionais: resultado });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

function countWeekdays(d1: Date, d2: Date): number {
  let count = 0;
  const cur = new Date(d1);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(d2);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

const TIPO_APONTAMENTO_LABEL: Record<number, string> = {
  1: 'Normal', 2: 'Férias', 3: 'Atestado', 4: 'Ausência', 5: 'Falta', 6: 'Abono',
  7: 'Hora Extra 50%', 8: 'Hora Extra 75%', 9: 'Hora Extra 100%', 10: 'Hora Extra',
};

/** Relatório Colaborador - previstas, realizadas, extras, abonadas, saldo, lançamentos diários */
export async function relatorioColaborador(req: Request, res: Response) {
  try {
    const { empresaId, equipeId, colaboradorId, dataInicial, dataFinal, aplicarRegra75 } = req.query;
    if (!empresaId || !dataInicial || !dataFinal) return res.status(400).json({ error: 'Empresa, Data Inicial e Data Final são obrigatórios' });
    const inicio = new Date(String(dataInicial) + 'T00:00:00');
    const fim = new Date(String(dataFinal) + 'T23:59:59');

    const empresa = await Empresa.findByPk(Number(empresaId), { attributes: ['empresaId', 'empresaDescricao'] });
    const whereUser: Record<string, unknown> = { usuarioEmpresaId: Number(empresaId) };
    if (equipeId) whereUser.equipeId = Number(equipeId);
    if (colaboradorId) whereUser.usuarioId = Number(colaboradorId);

    const usuarios = await Usuario.findAll({
      where: whereUser,
      attributes: ['usuarioId', 'usuarioNome', 'usuarioLogin', 'usuarioCargaHoraria', 'equipeId'],
      include: [{ model: Equipe, as: 'Equipe', attributes: ['equipeDescricao'], required: false }],
    });
    const userIds = usuarios.map((u) => u.usuarioId);

    const whereAp: Record<string, unknown> = {
      apontamentoSituacao: 1,
      usuarioId: userIds.length ? { [Op.in]: userIds } : 0,
      apontamentoInicioDataHora: { [Op.between]: [inicio, fim] },
    };

    const apontamentos = await Apontamento.findAll({
      where: whereAp,
      include: [
        { model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioLogin', 'usuarioCargaHoraria', 'equipeId'], include: [{ model: Equipe, as: 'Equipe', attributes: ['equipeDescricao'], required: false }] },
        { model: Evento, as: 'Evento', attributes: ['eventoDescricao'], required: false },
      ],
      order: [['usuarioId', 'ASC'], ['apontamentoInicioDataHora', 'ASC']],
    });

    const colaboradores: Array<{
      usuarioId: number;
      usuarioNome: string;
      equipeNome: string;
      previstas: number;
      realizadas: number;
      horasExtras: number;
      abonadas: number;
      saldo: number;
      lancamentos: Array<{ data: string; horaInicio: string; horaFim: string; observacao: string }>;
    }> = [];

    const diasUteis = countWeekdays(inicio, fim);
    for (const u of usuarios) {
      const cargaDiaria = Number(u.usuarioCargaHoraria) || 8;
      const previstas = diasUteis * cargaDiaria;
      let realizadas = 0;
      let horasExtras = 0;
      let abonadas = 0;
      const lancamentos: Array<{ data: string; horaInicio: string; horaFim: string; observacao: string }> = [];

      const aps = apontamentos.filter((a) => a.usuarioId === u.usuarioId);
      for (const ap of aps) {
        const horas = Number(ap.apontamentoHoras) || 0;
        const tipo = Number(ap.apontamentoTipo) || TipoApontamento.Normal;
        const eventoDesc = (ap as { Evento?: { eventoDescricao: string } }).Evento?.eventoDescricao;
        const obs = eventoDesc || ap.apontamentoComentario || TIPO_APONTAMENTO_LABEL[tipo] || '';

        if (tipo === TipoApontamento.Abono) abonadas += horas;
        else if ([TipoApontamento.HoraExtra50, TipoApontamento.HoraExtra75, TipoApontamento.HoraExtra100, TipoApontamento.HoraExtraNormal].includes(tipo)) horasExtras += horas;
        else realizadas += horas;

        const dataStr = String(ap.apontamentoData || '').slice(0, 10);
        const horaInicio = ap.apontamentoInicioDataHora ? new Date(ap.apontamentoInicioDataHora).toTimeString().slice(0, 5) : '';
        const horaFim = ap.apontamentoFinalDataHora ? new Date(ap.apontamentoFinalDataHora).toTimeString().slice(0, 5) : '';
        lancamentos.push({ data: dataStr, horaInicio, horaFim, observacao: obs || '' });
      }

      const saldo = realizadas + horasExtras + abonadas - previstas;
      colaboradores.push({
        usuarioId: u.usuarioId,
        usuarioNome: u.usuarioNome,
        equipeNome: (u as { Equipe?: { equipeDescricao: string } }).Equipe?.equipeDescricao || '',
        previstas,
        realizadas,
        horasExtras,
        abonadas,
        saldo,
        lancamentos,
      });
    }

    res.json({
      empresaNome: empresa?.empresaDescricao || '',
      dataInicial: String(dataInicial),
      dataFinal: String(dataFinal),
      colaboradores,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

/** Relatório Horários Consolidados - Chamado, Início, Fim, Total, Horas Normais, Hora Extra 50/75/100%, Valor Hora, V50/V75/V100 */
export async function relatorioHorariosConsolidados(req: Request, res: Response) {
  try {
    const { empresaId, equipeId, colaboradorId, dataInicial, dataFinal, aplicarRegra75 } = req.query;
    if (!empresaId || !dataInicial || !dataFinal) return res.status(400).json({ error: 'Empresa, Data Inicial e Data Final são obrigatórios' });
    const inicio = new Date(String(dataInicial) + 'T00:00:00');
    const fim = new Date(String(dataFinal) + 'T23:59:59');

    const whereUser: Record<string, unknown> = { usuarioEmpresaId: Number(empresaId) };
    if (equipeId) whereUser.equipeId = Number(equipeId);
    if (colaboradorId) whereUser.usuarioId = Number(colaboradorId);

    const usuarios = await Usuario.findAll({ where: whereUser, attributes: ['usuarioId'] });
    const userIds = usuarios.map((u) => u.usuarioId);

    const apontamentos = await Apontamento.findAll({
      where: {
        apontamentoSituacao: 1,
        usuarioId: userIds.length ? { [Op.in]: userIds } : 0,
        apontamentoInicioDataHora: { [Op.between]: [inicio, fim] },
      },
      include: [
        { model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome'] },
        { model: Projeto, as: 'Projeto', attributes: ['projetoDescricao'], required: false },
        { model: Evento, as: 'Evento', attributes: ['eventoDescricao'], required: false },
      ],
      order: [['apontamentoInicioDataHora', 'ASC']],
    });

    const valorHoraPorUsuario = new Map<number, number>();
    for (const uid of userIds) {
      const vh = await UsuarioValorHora.findOne({
        where: { usuarioId: uid, valorHoraData: { [Op.lte]: String(dataFinal) } },
        order: [['valorHoraData', 'DESC']],
        attributes: ['valorHoraValor'],
      });
      valorHoraPorUsuario.set(uid, Number(vh?.valorHoraValor) || 0);
    }

    const linhas: Array<{
      chamado: string;
      inicio: string;
      fim: string;
      total: number;
      horasNormais: number;
      horaExtra50: number;
      horaExtra75: number;
      horaExtra100: number;
      valorHora: number;
      v50: number;
      v75: number;
      v100: number;
    }> = [];

    for (const ap of apontamentos) {
      const horas = Number(ap.apontamentoHoras) || 0;
      const tipo = Number(ap.apontamentoTipo) || TipoApontamento.Normal;
      const proj = (ap as { Projeto?: { projetoDescricao: string } }).Projeto?.projetoDescricao;
      const evt = (ap as { Evento?: { eventoDescricao: string } }).Evento?.eventoDescricao;
      const chamado = proj || evt || ap.apontamentoComentario || '-';

      let horasNormais = 0;
      let horaExtra50 = 0;
      let horaExtra75 = 0;
      let horaExtra100 = 0;
      if (tipo === TipoApontamento.Normal) horasNormais = horas;
      else if (tipo === TipoApontamento.HoraExtra50) horaExtra50 = horas;
      else if (tipo === TipoApontamento.HoraExtra75) horaExtra75 = horas;
      else if (tipo === TipoApontamento.HoraExtra100) horaExtra100 = horas;
      else if (tipo === TipoApontamento.HoraExtraNormal) horasNormais = horas;

      const valorHora = valorHoraPorUsuario.get(ap.usuarioId) || 0;
      const regra75 = String(aplicarRegra75).toLowerCase() === 'true';
      const v50 = horaExtra50 * valorHora * (regra75 ? 1.75 : 1.5);
      const v75 = horaExtra75 * valorHora * (regra75 ? 1.75 : 1.75);
      const v100 = horaExtra100 * valorHora * 2;

      const dataStr = String(ap.apontamentoData || '').slice(0, 10);
      const horaInicio = ap.apontamentoInicioDataHora ? new Date(ap.apontamentoInicioDataHora).toTimeString().slice(0, 5) : '';
      const horaFim = ap.apontamentoFinalDataHora ? new Date(ap.apontamentoFinalDataHora).toTimeString().slice(0, 5) : '';
      const inicioStr = `${dataStr} ${horaInicio}`.trim();
      const fimStr = `${dataStr} ${horaFim}`.trim();

      linhas.push({
        chamado,
        inicio: inicioStr,
        fim: fimStr,
        total: horas,
        horasNormais,
        horaExtra50,
        horaExtra75,
        horaExtra100,
        valorHora,
        v50,
        v75,
        v100,
      });
    }

    res.json({
      dataInicial: String(dataInicial),
      dataFinal: String(dataFinal),
      linhas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

/** Relatório Fechamento de Reembolso - filtros: empresaId, dataInicial, dataFinal */
export async function relatorioFechamentoReembolso(req: Request, res: Response) {
  try {
    const { empresaId, dataInicial, dataFinal } = req.query;
    if (!empresaId || !dataInicial || !dataFinal) return res.status(400).json({ error: 'Empresa, Data Inicial e Data Final são obrigatórios' });
    const inicio = new Date(String(dataInicial) + 'T00:00:00');
    const fim = new Date(String(dataFinal) + 'T23:59:59');

    const userIds = (await Usuario.findAll({ where: { usuarioEmpresaId: Number(empresaId) }, attributes: ['usuarioId'] })).map((u) => u.usuarioId);
    const reembolsos = await Reembolso.findAll({
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioLogin'] }],
      where: {
        reembolsoUsuarioId: userIds.length ? { [Op.in]: userIds } : 0,
        reembolsoData: { [Op.between]: [inicio, fim] },
      },
      order: [['reembolsoData', 'DESC'] as [string, string]],
    });

    const dados = reembolsos.map((r) => ({
      reembolsoId: r.reembolsoId,
      usuarioNome: (r as { Usuario?: { usuarioNome: string } }).Usuario?.usuarioNome,
      reembolsoData: r.reembolsoData,
      reembolsoValor: r.reembolsoValor,
      reembolsoSituacao: r.reembolsoSituacao,
    }));

    res.json({ dados, dataInicial: String(dataInicial), dataFinal: String(dataFinal) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

/** Relatório Prévia - filtros: tipoPeriodo, empresaId, dataInicial, dataFinal, tipo */
export async function relatorioPrevia(req: Request, res: Response) {
  try {
    const { tipoPeriodo, empresaId, dataInicial, dataFinal, tipo } = req.query;
    const inicio = dataInicial ? new Date(String(dataInicial) + 'T00:00:00') : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fim = dataFinal ? new Date(String(dataFinal) + 'T23:59:59') : new Date();

    const where: Record<string, unknown> = { apontamentoSituacao: 1, apontamentoInicioDataHora: { [Op.between]: [inicio, fim] } };
    if (empresaId) {
      const userIds = (await Usuario.findAll({ where: { usuarioEmpresaId: Number(empresaId) }, attributes: ['usuarioId'] })).map((u) => u.usuarioId);
      where.usuarioId = userIds.length ? { [Op.in]: userIds } : 0;
    }

    const apontamentos = await Apontamento.findAll({
      where,
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome', 'usuarioLogin'] }, { model: Projeto, as: 'Projeto', attributes: ['projetoId', 'projetoDescricao'] }],
      order: [['apontamentoInicioDataHora', 'DESC'] as [string, string]],
      limit: 500,
    });

    const dados = apontamentos.map((a) => ({
      apontamentoId: a.apontamentoId,
      usuarioNome: (a as { Usuario?: { usuarioNome: string } }).Usuario?.usuarioNome,
      projetoDescricao: (a as { Projeto?: { projetoDescricao: string } }).Projeto?.projetoDescricao,
      apontamentoData: a.apontamentoData,
      apontamentoHoras: a.apontamentoHoras,
    }));

    res.json({ dados, dataInicial: inicio.toISOString().slice(0, 10), dataFinal: fim.toISOString().slice(0, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}

/** Relatório Projeto / Projeto Centro de Custo - filtros: empresaId, projetoId, equipeId, colaboradorId, dataInicial, dataFinal */
export async function relatorioProjeto(req: Request, res: Response) {
  try {
    const { empresaId, projetoId, equipeId, colaboradorId, dataInicial, dataFinal, porCentroCusto } = req.query;
    if (!empresaId || !dataInicial || !dataFinal) return res.status(400).json({ error: 'Empresa, Data Inicial e Data Final são obrigatórios' });
    const inicio = new Date(String(dataInicial) + 'T00:00:00');
    const fim = new Date(String(dataFinal) + 'T23:59:59');

    const whereUser: Record<string, unknown> = { usuarioEmpresaId: Number(empresaId) };
    if (equipeId) whereUser.equipeId = Number(equipeId);
    if (colaboradorId) whereUser.usuarioId = Number(colaboradorId);
    const usuarios = await Usuario.findAll({ where: whereUser, attributes: ['usuarioId'] });
    const userIds = usuarios.map((u) => u.usuarioId);

    const whereAp: Record<string, unknown> = {
      apontamentoSituacao: 1,
      usuarioId: userIds.length ? { [Op.in]: userIds } : 0,
      apontamentoInicioDataHora: { [Op.between]: [inicio, fim] },
    };
    if (projetoId) whereAp.projetoId = Number(projetoId);

    const apontamentos = await Apontamento.findAll({
      where: whereAp,
      include: [
        { model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome'] },
        { model: Projeto, as: 'Projeto', attributes: ['projetoId', 'projetoDescricao'], include: [{ model: CentroCusto, as: 'CentroCusto', attributes: ['centroCustoId', 'centroCustoDescricao'], required: false }] },
      ],
      order: [['projetoId', 'ASC'], ['usuarioId', 'ASC']],
    });

    const dados = apontamentos.map((a) => ({
      projetoDescricao: (a as { Projeto?: { projetoDescricao: string; CentroCusto?: { centroCustoDescricao: string } } }).Projeto?.projetoDescricao,
      centroCustoDescricao: (a as { Projeto?: { CentroCusto?: { centroCustoDescricao: string } } }).Projeto?.CentroCusto?.centroCustoDescricao,
      usuarioNome: (a as { Usuario?: { usuarioNome: string } }).Usuario?.usuarioNome,
      apontamentoData: a.apontamentoData,
      apontamentoHoras: a.apontamentoHoras,
    }));

    res.json({ dados, dataInicial: String(dataInicial), dataFinal: String(dataFinal) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
}
