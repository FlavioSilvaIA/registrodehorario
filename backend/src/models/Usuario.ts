/**
 * Model Usuario - Origem: gxmetadata/usuario.json (Business Component Usuario)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Perfil } from '../types/enums';

export interface UsuarioAttributes {
  usuarioId: number;
  usuarioLogin: string;
  usuarioNome: string;
  usuarioPerfil: Perfil;
  usuarioSenha: string;
  usuarioEmpresaId?: number;
  equipeId?: number;
  usuarioEmail: string;
  usuarioEmailGestor?: string;
  usuarioCargaHoraria: number;
  usuarioDataEntrada: Date;
  usuarioDataSaida?: Date;
  usuarioAtivo: boolean;
  usuarioObrigatorioComentario: boolean;
  usuarioObrigatorioProjeto: boolean;
  usuarioAvisosAtivo: boolean;
  usuarioTotalHorasMensais: number;
  usuarioReferenciaData: Date;
  usuarioHoraPrevistaChegada?: string | null;
  usuarioHoraPrevistaSaida?: string | null;
  usuarioHoraPrevistaAlmocoSaida?: string | null;
  usuarioHoraPrevistaAlmocoChegada?: string | null;
  usuarioTravaApontamento?: boolean;
  usuarioFotoBase64?: string | null;
  usuarioFotoNome?: string | null;
  usuarioFotoExtensao?: string | null;
}

export interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'usuarioId'> {}

export class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  declare usuarioId: number;
  declare usuarioLogin: string;
  declare usuarioNome: string;
  declare usuarioPerfil: Perfil;
  declare usuarioSenha: string;
  declare usuarioEmpresaId?: number;
  declare equipeId?: number;
  declare usuarioEmail: string;
  declare usuarioEmailGestor?: string;
  declare usuarioCargaHoraria: number;
  declare usuarioDataEntrada: Date;
  declare usuarioDataSaida?: Date;
  declare usuarioAtivo: boolean;
  declare usuarioObrigatorioComentario: boolean;
  declare usuarioObrigatorioProjeto: boolean;
  declare usuarioAvisosAtivo: boolean;
  declare usuarioTotalHorasMensais: number;
  declare usuarioReferenciaData: Date;
  declare usuarioHoraPrevistaChegada?: string | null;
  declare usuarioHoraPrevistaSaida?: string | null;
  declare usuarioHoraPrevistaAlmocoSaida?: string | null;
  declare usuarioHoraPrevistaAlmocoChegada?: string | null;
  declare usuarioTravaApontamento?: boolean;
  declare usuarioFotoBase64?: string | null;
  declare usuarioFotoNome?: string | null;
  declare usuarioFotoExtensao?: string | null;
}

Usuario.init(
  {
    usuarioId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'usuario_id' },
    usuarioLogin: { type: DataTypes.STRING(40), allowNull: false, field: 'usuario_login' },
    usuarioNome: { type: DataTypes.STRING(80), allowNull: false, field: 'usuario_nome' },
    usuarioPerfil: { type: DataTypes.INTEGER, allowNull: false, defaultValue: Perfil.Colaborador, field: 'usuario_perfil' },
    usuarioSenha: { type: DataTypes.STRING(80), allowNull: false, field: 'usuario_senha' },
    usuarioEmpresaId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_empresa_id' },
    equipeId: { type: DataTypes.INTEGER, allowNull: true, field: 'equipe_id' },
    usuarioEmail: { type: DataTypes.STRING(100), allowNull: false, field: 'usuario_email' },
    usuarioEmailGestor: { type: DataTypes.STRING(100), allowNull: true, field: 'usuario_email_gestor' },
    usuarioCargaHoraria: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'usuario_carga_horaria' },
    usuarioDataEntrada: { type: DataTypes.DATEONLY, allowNull: false, field: 'usuario_data_entrada' },
    usuarioDataSaida: { type: DataTypes.DATEONLY, allowNull: true, field: 'usuario_data_saida' },
    usuarioAtivo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'usuario_ativo' },
    usuarioObrigatorioComentario: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'usuario_obrigatorio_comentario' },
    usuarioObrigatorioProjeto: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'usuario_obrigatorio_projeto' },
    usuarioAvisosAtivo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'usuario_avisos_ativo' },
    usuarioTotalHorasMensais: { type: DataTypes.DECIMAL(9, 2), allowNull: false, defaultValue: 0, field: 'usuario_total_horas_mensais' },
    usuarioReferenciaData: { type: DataTypes.DATEONLY, allowNull: false, field: 'usuario_referencia_data' },
    usuarioHoraPrevistaChegada: { type: DataTypes.STRING(5), allowNull: true, field: 'usuario_hora_prevista_chegada' },
    usuarioHoraPrevistaSaida: { type: DataTypes.STRING(5), allowNull: true, field: 'usuario_hora_prevista_saida' },
    usuarioHoraPrevistaAlmocoSaida: { type: DataTypes.STRING(5), allowNull: true, field: 'usuario_hora_prevista_almoco_saida' },
    usuarioHoraPrevistaAlmocoChegada: { type: DataTypes.STRING(5), allowNull: true, field: 'usuario_hora_prevista_almoco_chegada' },
    usuarioTravaApontamento: { type: DataTypes.BOOLEAN, allowNull: true, field: 'usuario_trava_apontamento' },
    usuarioFotoBase64: { type: DataTypes.TEXT, allowNull: true, field: 'usuario_foto_base64' },
    usuarioFotoNome: { type: DataTypes.STRING(80), allowNull: true, field: 'usuario_foto_nome' },
    usuarioFotoExtensao: { type: DataTypes.STRING(6), allowNull: true, field: 'usuario_foto_extensao' },
  },
  { sequelize, tableName: 'usuario', timestamps: false }
);
