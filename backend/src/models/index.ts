import { Empresa } from './Empresa';
import { CentroCusto } from './CentroCusto';
import { Equipe } from './Equipe';
import { Usuario } from './Usuario';
import { Projeto } from './Projeto';
import { RegistroAvisoLog } from './RegistroAvisoLog';
import { Apontamento } from './Apontamento';
import { ProjetoEtapa } from './ProjetoEtapa';
import { ProjetoEtapaAtividade } from './ProjetoEtapaAtividade';
import { Evento } from './Evento';
import { Mensagem } from './Mensagem';
import { Reembolso } from './Reembolso';
import { TipoReembolso } from './TipoReembolso';
import { Parametro } from './Parametro';
import { UsuarioValorHora } from './UsuarioValorHora';
import { UsuarioProjeto } from './UsuarioProjeto';
import { Device } from './Device';
import { UsuarioDevice } from './UsuarioDevice';
import { TipoAlerta } from './TipoAlerta';
import { NotificacaoConfig } from './NotificacaoConfig';
import { NotificacaoAdministrador } from './NotificacaoAdministrador';
import { Notificacao } from './Notificacao';
import { NotificacaoUsuario } from './NotificacaoUsuario';

// Associations
Apontamento.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(Apontamento, { foreignKey: 'usuarioId' });

Apontamento.belongsTo(Projeto, { foreignKey: 'projetoId' });
Projeto.hasMany(Apontamento, { foreignKey: 'projetoId' });

Apontamento.belongsTo(ProjetoEtapaAtividade, { foreignKey: 'projetoEtapaAtividadeId' });
ProjetoEtapaAtividade.hasMany(Apontamento, { foreignKey: 'projetoEtapaAtividadeId' });
Apontamento.belongsTo(Evento, { foreignKey: 'apontamentoEventoId', as: 'Evento' });
Evento.hasMany(Apontamento, { foreignKey: 'apontamentoEventoId' });

ProjetoEtapa.belongsTo(Projeto, { foreignKey: 'projetoEtapaProjetoId' });
Projeto.hasMany(ProjetoEtapa, { foreignKey: 'projetoEtapaProjetoId' });

ProjetoEtapaAtividade.belongsTo(ProjetoEtapa, { foreignKey: 'projetoEtapaAtividadeEtapaId' });
ProjetoEtapa.hasMany(ProjetoEtapaAtividade, { foreignKey: 'projetoEtapaAtividadeEtapaId' });

Reembolso.belongsTo(Usuario, { foreignKey: 'reembolsoUsuarioId' });
Usuario.hasMany(Reembolso, { foreignKey: 'reembolsoUsuarioId' });
Reembolso.belongsTo(TipoReembolso, { foreignKey: 'reembolsoTipoReembolsoId' });
TipoReembolso.hasMany(Reembolso, { foreignKey: 'reembolsoTipoReembolsoId' });
Mensagem.belongsTo(Usuario, { foreignKey: 'remetenteUsuarioId', as: 'Usuario' });
Usuario.hasMany(Mensagem, { foreignKey: 'remetenteUsuarioId' });

Projeto.belongsTo(CentroCusto, { foreignKey: 'centroCustoId', as: 'CentroCusto' });
Projeto.belongsTo(Empresa, { foreignKey: 'projetoEmpresaId', as: 'Empresa' });
Projeto.belongsTo(Equipe, { foreignKey: 'projetoEquipeId', as: 'Equipe' });
Equipe.hasMany(Projeto, { foreignKey: 'projetoEquipeId' });
CentroCusto.belongsTo(Empresa, { foreignKey: 'centroCustoEmpresaId', as: 'Empresa' });
Empresa.hasMany(CentroCusto, { foreignKey: 'centroCustoEmpresaId' });
CentroCusto.hasMany(Projeto, { foreignKey: 'centroCustoId', as: 'Projetos' });
Empresa.hasMany(Projeto, { foreignKey: 'projetoEmpresaId' });
Usuario.belongsTo(Equipe, { foreignKey: 'equipeId', as: 'Equipe' });
Usuario.belongsTo(Empresa, { foreignKey: 'usuarioEmpresaId', as: 'Empresa' });
Equipe.hasMany(Usuario, { foreignKey: 'equipeId' });
Equipe.belongsTo(Empresa, { foreignKey: 'equipeEmpresaId', as: 'Empresa' });
Empresa.hasMany(Equipe, { foreignKey: 'equipeEmpresaId' });
Empresa.hasMany(Usuario, { foreignKey: 'usuarioEmpresaId' });
RegistroAvisoLog.belongsTo(Usuario, { foreignKey: 'registroAvisoLogUsuarioId', as: 'Usuario' });
Usuario.hasMany(RegistroAvisoLog, { foreignKey: 'registroAvisoLogUsuarioId' });
UsuarioValorHora.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });
Usuario.hasMany(UsuarioValorHora, { foreignKey: 'usuarioId' });

UsuarioProjeto.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasMany(UsuarioProjeto, { foreignKey: 'usuarioId' });
UsuarioProjeto.belongsTo(Projeto, { foreignKey: 'projetoId', as: 'Projeto' });
Projeto.hasMany(UsuarioProjeto, { foreignKey: 'projetoId' });

UsuarioDevice.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });
Usuario.hasMany(UsuarioDevice, { foreignKey: 'usuarioId' });
UsuarioDevice.belongsTo(Device, { foreignKey: 'deviceCod', as: 'Device' });
Device.hasMany(UsuarioDevice, { foreignKey: 'deviceCod' });

NotificacaoAdministrador.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });
Usuario.hasMany(NotificacaoAdministrador, { foreignKey: 'usuarioId' });

Notificacao.belongsTo(Empresa, { foreignKey: 'empresaId', as: 'Empresa' });
Empresa.hasMany(Notificacao, { foreignKey: 'empresaId' });

TipoAlerta.belongsTo(Empresa, { foreignKey: 'empresaId', as: 'Empresa' });
Empresa.hasMany(TipoAlerta, { foreignKey: 'empresaId' });
TipoAlerta.belongsTo(Notificacao, { foreignKey: 'notificacaoId', as: 'Notificacao' });
Notificacao.hasMany(TipoAlerta, { foreignKey: 'notificacaoId' });

NotificacaoUsuario.belongsTo(TipoAlerta, { foreignKey: 'tipoAlertaId', as: 'TipoAlerta' });
TipoAlerta.hasMany(NotificacaoUsuario, { foreignKey: 'tipoAlertaId' });
NotificacaoUsuario.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });
Usuario.hasMany(NotificacaoUsuario, { foreignKey: 'usuarioId' });

export { Empresa, CentroCusto, Equipe, Usuario, Projeto, Apontamento, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Reembolso, TipoReembolso, Parametro, RegistroAvisoLog, UsuarioValorHora, UsuarioProjeto, Device, UsuarioDevice, TipoAlerta, NotificacaoConfig, NotificacaoAdministrador, Notificacao, NotificacaoUsuario };
