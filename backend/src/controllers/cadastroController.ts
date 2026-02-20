import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Usuario, Parametro, UsuarioValorHora } from '../models';
import type { JwtPayload } from '../middleware/auth';

/** Alterar data de referência de um ou todos os usuários */
export async function alterarDataReferencia(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { dataReferencia, usuarioId } = req.body;
    if (!dataReferencia) return res.status(400).json({ error: 'Data de referência obrigatória' });
    const where = usuarioId ? { usuarioId } : {};
    const [count] = await Usuario.update({ usuarioReferenciaData: dataReferencia }, { where });
    res.json({ atualizados: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar data de referência' });
  }
}

/** Exportar usuários em CSV (Nome, E-mail, E-mail Gestor) */
export async function exportarUsuarios(req: Request, res: Response) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['usuarioNome', 'usuarioEmail', 'usuarioEmailGestor'],
      order: [['usuarioNome', 'ASC']],
    });
    const cols = ['Nome', 'E-mail', 'E-mail Gestor'];
    const linhas = usuarios.map((u: any) => [
      String(u.usuarioNome ?? ''),
      String(u.usuarioEmail ?? ''),
      String(u.usuarioEmailGestor ?? ''),
    ]);
    const csv = [cols.join(';'), ...linhas.map((r) => r.join(';'))].join('\r\n');
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios_gestores_export.csv');
    res.send('\ufeff' + csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao exportar usuários' });
  }
}

/** Importar usuários/gestores de CSV/Excel (formato: Nome;E-mail;E-mail Gestor) - atualiza E-mail Gestor por e-mail */
export async function importarUsuarios(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const { linhas } = req.body as { linhas: Array<{ nome: string; email: string; emailGestor: string }> };
    if (!Array.isArray(linhas) || linhas.length === 0) return res.status(400).json({ error: 'Nenhuma linha para importar' });
    const hoje = new Date().toISOString().split('T')[0];
    let atualizados = 0;
    let criados = 0;
    const erros: string[] = [];
    for (let i = 0; i < linhas.length; i++) {
      const row = linhas[i];
      const nome = String(row?.nome ?? '').trim();
      const email = String(row?.email ?? '').trim();
      const emailGestor = String(row?.emailGestor ?? '').trim();
      if (!nome || !email) {
        erros.push(`Linha ${i + 2}: Nome e E-mail são obrigatórios`);
        continue;
      }
      const existente = await Usuario.findOne({ where: { usuarioEmail: email } });
      if (existente) {
        await existente.update({ usuarioNome: nome, usuarioEmailGestor: emailGestor || null });
        atualizados++;
      } else {
        const login = email.split('@')[0].replace(/[^a-z0-9]/gi, '').slice(0, 40) || `user${i}`;
        if (await Usuario.findOne({ where: { usuarioLogin: login } })) {
          erros.push(`Linha ${i + 2}: E-mail ${email} não existe e login ${login} já está em uso`);
          continue;
        }
        const hash = await bcrypt.hash('123456', 10);
        await Usuario.create({
          usuarioLogin: login,
          usuarioNome: nome,
          usuarioEmail: email,
          usuarioEmailGestor: emailGestor || null,
          usuarioSenha: hash,
          usuarioReferenciaData: hoje as unknown as Date,
          usuarioDataEntrada: hoje as unknown as Date,
          usuarioCargaHoraria: 44,
          usuarioTotalHorasMensais: 176,
          usuarioAtivo: true,
          usuarioObrigatorioComentario: false,
          usuarioObrigatorioProjeto: false,
        });
        criados++;
      }
    }
    res.json({ criados, atualizados, total: linhas.length, erros: erros.slice(0, 20) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao importar usuários' });
  }
}

/** Listar valor hora - tabela com Nome, Data, Valor e filtros */
export async function listarValorHora(req: Request, res: Response) {
  try {
    const { nome, valorMin, valorMax, data } = req.query;
    const whereUsuario: Record<string, unknown> = {};
    if (nome && String(nome).trim()) whereUsuario.usuarioNome = { [Op.like]: `%${String(nome).trim()}%` };
    const where: Record<string, unknown> = {};
    if (valorMin != null && valorMin !== '') where.valorHoraValor = { ...(where.valorHoraValor as object || {}), [Op.gte]: Number(valorMin) };
    if (valorMax != null && valorMax !== '') where.valorHoraValor = { ...(where.valorHoraValor as object || {}), [Op.lte]: Number(valorMax) };
    if (data && String(data).trim()) where.valorHoraData = String(data).trim();
    const lista = await UsuarioValorHora.findAll({
      where: Object.keys(where).length ? where : undefined,
      include: [{ model: Usuario, as: 'Usuario', attributes: ['usuarioId', 'usuarioNome'], where: Object.keys(whereUsuario).length ? whereUsuario : undefined, required: true }],
      order: [['valorHoraData', 'DESC'], [Usuario, 'usuarioNome']],
    });
    const rows = lista.map((v: any) => ({
      usuarioValorHoraId: v.usuarioValorHoraId,
      usuarioId: v.usuarioId,
      usuarioNome: v.Usuario?.usuarioNome,
      valorHoraData: v.valorHoraData,
      valorHoraValor: v.valorHoraValor,
    }));
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar valor hora' });
  }
}

/** Criar valor hora */
export async function criarValorHora(req: Request, res: Response) {
  try {
    const { usuarioId, data, valor } = req.body;
    if (!usuarioId || !data) return res.status(400).json({ error: 'Usuário e data obrigatórios' });
    const dataStr = String(data).includes('/') ? String(data).split('/').reverse().join('-') : String(data);
    const v = await UsuarioValorHora.create({
      usuarioId: Number(usuarioId),
      valorHoraData: dataStr as unknown as Date,
      valorHoraValor: Number(valor) || 0,
    });
    res.status(201).json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar valor hora' });
  }
}

/** Atualizar valor hora */
export async function atualizarValorHora(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data, valor } = req.body;
    const v = await UsuarioValorHora.findByPk(id);
    if (!v) return res.status(404).json({ error: 'Registro não encontrado' });
    if (data) (v as any).valorHoraData = String(data).includes('/') ? String(data).split('/').reverse().join('-') : String(data);
    if (valor != null) v.valorHoraValor = Number(valor);
    await v.save();
    res.json(v);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar valor hora' });
  }
}

/** Excluir valor hora */
export async function excluirValorHora(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const v = await UsuarioValorHora.findByPk(id);
    if (!v) return res.status(404).json({ error: 'Registro não encontrado' });
    await v.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir valor hora' });
  }
}

/** Valor hora do usuário - usa parâmetro USUARIO_VALOR_HORA_{usuarioId} ou padrão (legado) */
export async function getValorHoraUsuario(req: Request, res: Response) {
  try {
    const { usuarioId } = req.params;
    const param = await Parametro.findOne({ where: { parametroChave: `USUARIO_VALOR_HORA_${usuarioId}` } });
    const padrao = await Parametro.findOne({ where: { parametroChave: 'VALOR_HORA_PADRAO' } });
    res.json({ valor: param?.parametroValor || padrao?.parametroValor || '0' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter valor hora' });
  }
}

export async function setValorHoraUsuario(req: Request, res: Response) {
  try {
    const { usuarioId } = req.params;
    const { valor } = req.body;
    let param = await Parametro.findOne({ where: { parametroChave: `USUARIO_VALOR_HORA_${usuarioId}` } });
    if (param) await param.update({ parametroValor: String(valor) });
    else param = await Parametro.create({ parametroChave: `USUARIO_VALOR_HORA_${usuarioId}`, parametroValor: String(valor) });
    res.json(param);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar valor hora' });
  }
}

const PERIODO_FECHAMENTO_KEYS = [
  'PERIODO_FECHAMENTO_MES_INICIAL', 'PERIODO_FECHAMENTO_MES_FINAL', 'PERIODO_FECHAMENTO_ANO',
  'VERDE_GESTOR_EMAIL', 'VERDE_COLABORADOR_EMAIL', 'VERDE_OUTROS_EMAIL',
  'AMARELO_HORAS', 'AMARELO_GESTOR_EMAIL', 'AMARELO_COLABORADOR_EMAIL', 'AMARELO_OUTROS_EMAIL',
  'VERMELHO_HORAS', 'VERMELHO_GESTOR_EMAIL', 'VERMELHO_COLABORADOR_EMAIL', 'VERMELHO_OUTROS_EMAIL',
];

/** Período de fechamento de horas */
export async function getPeriodoFechamento(req: Request, res: Response) {
  try {
    const params = await Parametro.findAll({ where: { parametroChave: { [Op.in]: PERIODO_FECHAMENTO_KEYS } } });
    const obj: Record<string, string> = {};
    params.forEach((p: any) => { obj[p.parametroChave] = p.parametroValor ?? ''; });
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter período' });
  }
}

export async function setPeriodoFechamento(req: Request, res: Response) {
  try {
    const body = req.body as Record<string, unknown>;
    const mapping: Record<string, unknown> = {
      PERIODO_FECHAMENTO_MES_INICIAL: body.mesInicial,
      PERIODO_FECHAMENTO_MES_FINAL: body.mesFinal,
      PERIODO_FECHAMENTO_ANO: body.ano,
      VERDE_GESTOR_EMAIL: body.verdeGestorEmail,
      VERDE_COLABORADOR_EMAIL: body.verdeColaboradorEmail,
      VERDE_OUTROS_EMAIL: body.verdeOutrosEmail,
      AMARELO_HORAS: body.amareloHoras,
      AMARELO_GESTOR_EMAIL: body.amareloGestorEmail,
      AMARELO_COLABORADOR_EMAIL: body.amareloColaboradorEmail,
      AMARELO_OUTROS_EMAIL: body.amareloOutrosEmail,
      VERMELHO_HORAS: body.vermelhoHoras,
      VERMELHO_GESTOR_EMAIL: body.vermelhoGestorEmail,
      VERMELHO_COLABORADOR_EMAIL: body.vermelhoColaboradorEmail,
      VERMELHO_OUTROS_EMAIL: body.vermelhoOutrosEmail,
    };
    for (const [k, v] of Object.entries(mapping)) {
      if (v === undefined) continue;
      let p = await Parametro.findOne({ where: { parametroChave: k } });
      const val = typeof v === 'boolean' ? (v ? '1' : '0') : String(v ?? '');
      if (p) await p.update({ parametroValor: val });
      else await Parametro.create({ parametroChave: k, parametroValor: val });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar período' });
  }
}

/** Executar fechamento de horas do período */
export async function executarFechamento(req: Request & { user?: JwtPayload }, res: Response) {
  try {
    const params = await Parametro.findAll({
      where: { parametroChave: { [Op.in]: ['PERIODO_FECHAMENTO_MES_INICIAL', 'PERIODO_FECHAMENTO_MES_FINAL', 'PERIODO_FECHAMENTO_ANO'] } },
    });
    const obj: Record<string, string> = {};
    params.forEach((p: any) => { obj[p.parametroChave] = p.parametroValor; });
    const mesInicial = Number(obj.PERIODO_FECHAMENTO_MES_INICIAL || 1);
    const mesFinal = Number(obj.PERIODO_FECHAMENTO_MES_FINAL || 12);
    const ano = Number(obj.PERIODO_FECHAMENTO_ANO || new Date().getFullYear());
    const dataInicio = new Date(ano, mesInicial - 1, 1);
    const dataFim = new Date(ano, mesFinal, 0);
    res.json({
      ok: true,
      mensagem: `Fechamento executado para o período ${dataInicio.toISOString().split('T')[0]} a ${dataFim.toISOString().split('T')[0]}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao executar fechamento' });
  }
}
