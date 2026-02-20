/**
 * Inicializa banco e cria usuário de teste
 * Origem: ENGENHARIA_REVERSA - Dados de teste (seed)
 */
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { Empresa, CentroCusto, Equipe, Usuario, Projeto, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Reembolso, TipoReembolso, Parametro } from '../models';
import { Perfil, DMStatusProjeto, Status } from '../types/enums';

async function init() {
  await sequelize.sync({ force: true });
  await Empresa.create({ empresaDescricao: 'Empresa Teste' });
  await CentroCusto.create({ centroCustoDescricao: 'Centro Custo Padrão', centroCustoEmpresaId: 1 });
  await Equipe.create({ equipeDescricao: 'Equipe Desenvolvimento', equipeEmpresaId: 1 });
  const hash = await bcrypt.hash('123456', 10);
  await Usuario.create({
    usuarioLogin: 'colab01',
    usuarioNome: 'Colaborador Teste',
    usuarioPerfil: Perfil.Colaborador,
    usuarioSenha: hash,
    usuarioEmail: 'colab@teste.com',
    usuarioEmpresaId: 1,
    equipeId: 1,
    usuarioCargaHoraria: 44,
    usuarioDataEntrada: new Date('2024-01-01'),
    usuarioAtivo: true,
    usuarioObrigatorioComentario: false,
    usuarioObrigatorioProjeto: false,
    usuarioTotalHorasMensais: 176,
    usuarioReferenciaData: new Date(),
  });
  const projeto = await Projeto.create({
    projetoDescricao: 'Projeto Teste',
    projetoEmpresaId: 1,
    projetoValorHora: 100,
    projetoAtivo: true,
    projetoStatus: DMStatusProjeto.EmAndamento,
  });
  const etapa = await ProjetoEtapa.create({
    projetoEtapaProjetoId: projeto.projetoId,
    projetoEtapaNome: 'Etapa 1',
    projetoEtapaStatus: Status.Aberta,
  });
  await ProjetoEtapaAtividade.create({
    projetoEtapaAtividadeEtapaId: etapa.projetoEtapaId,
    projetoEtapaAtividadeNome: 'Atividade 1',
    projetoEtapaAtividadeDescricao: '',
    projetoEtapaAtividadeStatus: Status.Aberta,
  });
  await TipoReembolso.create({ tipoReembolsoDescricao: 'Alimentação' });
  await TipoReembolso.create({ tipoReembolsoDescricao: 'Transporte' });
  await Parametro.create({ parametroChave: 'HORAS_MENSAL_PADRAO', parametroValor: '176' });
  await Parametro.create({ parametroChave: 'DIAS_UTEIS_MES', parametroValor: '22' });
  await Parametro.create({ parametroChave: 'APONTAMENTODINAMICOFILTROS', parametroValor: 'NÃO' });
  await Parametro.create({ parametroChave: 'Compensação de horas', parametroValor: '' });
  await Parametro.create({ parametroChave: 'DIASEMANAROTINAAFONTAMENTO', parametroValor: '1' });
  await Parametro.create({ parametroChave: 'EncryptKey', parametroValor: '9A03593FB7E746F4F7AE94C508A07D4B' });
  await Parametro.create({ parametroChave: 'HORAS_TOLERANCIA', parametroValor: '0.50' });
  await Parametro.create({ parametroChave: 'QtDiaUsuarioProjeto', parametroValor: '30' });
  await Parametro.create({ parametroChave: 'SENDGRID_BASEURL', parametroValor: 'v3/mail/' });
  await Mensagem.create({
    remetenteUsuarioId: 1,
    mensagemCadastroDataHora: new Date(),
    mensagemTitulo: 'Bem-vindo ao sistema',
    mensagemTexto: 'Sistema de Registro de Horas - Refatoração GeneXus.',
    mensagemEnviaEmail: false,
    mensagemSituacao: 'E',
  });
  console.log('Banco inicializado. Usuário: colab01 / Senha: 123456');
  process.exit(0);
}

init().catch(console.error);
