/**
 * Model Apontamento - Origem: gxmetadata/apontamento.json (Business Component Apontamento)
 * Equivalente a RegistrarApontamento, VerificaApontamentoEmAberto
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Situacao, TipoApontamento, OrigemApontamento } from '../types/enums';

export interface ApontamentoAttributes {
  apontamentoId: number;
  apontamentoCadastroDataHora: Date;
  apontamentoInicioDataHora: Date;
  apontamentoData: Date;
  apontamentoFinalDataHora?: Date;
  apontamentoSituacao: Situacao;
  usuarioId: number;
  projetoId?: number;
  projetoEtapaAtividadeId?: number;
  apontamentoComentario?: string;
  apontamentoTipo: TipoApontamento;
  apontamentoHoras?: number;
  apontamentoEventoId?: number;
  apontamentoInicioOrigem: OrigemApontamento;
  apontamentoFimOrigem?: OrigemApontamento;
  apontamentoInicioGeolocation?: string;
  apontamentoFimGeolocation?: string;
}

export interface ApontamentoCreationAttributes extends Optional<ApontamentoAttributes, 'apontamentoId' | 'apontamentoHoras'> {}

export class Apontamento extends Model<ApontamentoAttributes, ApontamentoCreationAttributes> implements ApontamentoAttributes {
  declare apontamentoId: number;
  declare apontamentoCadastroDataHora: Date;
  declare apontamentoInicioDataHora: Date;
  declare apontamentoData: Date;
  declare apontamentoFinalDataHora?: Date;
  declare apontamentoSituacao: Situacao;
  declare usuarioId: number;
  declare projetoId?: number;
  declare projetoEtapaAtividadeId?: number;
  declare apontamentoComentario?: string;
  declare apontamentoTipo: TipoApontamento;
  declare apontamentoHoras?: number;
  declare apontamentoEventoId?: number;
  declare apontamentoInicioOrigem: OrigemApontamento;
  declare apontamentoFimOrigem?: OrigemApontamento;
  declare apontamentoInicioGeolocation?: string;
  declare apontamentoFimGeolocation?: string;
}

Apontamento.init(
  {
    apontamentoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'apontamento_id' },
    apontamentoCadastroDataHora: { type: DataTypes.DATE, allowNull: false, field: 'apontamento_cadastro_data_hora' },
    apontamentoInicioDataHora: { type: DataTypes.DATE, allowNull: false, field: 'apontamento_inicio_data_hora' },
    apontamentoData: { type: DataTypes.DATEONLY, allowNull: false, field: 'apontamento_data' },
    apontamentoFinalDataHora: { type: DataTypes.DATE, allowNull: true, field: 'apontamento_final_data_hora' },
    apontamentoSituacao: { type: DataTypes.INTEGER, allowNull: false, defaultValue: Situacao.Cadastrado, field: 'apontamento_situacao' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
    projetoId: { type: DataTypes.INTEGER, allowNull: true, field: 'projeto_id' },
    projetoEtapaAtividadeId: { type: DataTypes.INTEGER, allowNull: true, field: 'projeto_etapa_atividade_id' },
    apontamentoComentario: { type: DataTypes.STRING(4000), allowNull: true, field: 'apontamento_comentario' },
    apontamentoTipo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: TipoApontamento.Normal, field: 'apontamento_tipo' },
    apontamentoHoras: { type: DataTypes.DECIMAL(9, 2), allowNull: true, field: 'apontamento_horas' },
    apontamentoEventoId: { type: DataTypes.INTEGER, allowNull: true, field: 'apontamento_evento_id' },
    apontamentoInicioOrigem: { type: DataTypes.STRING(1), allowNull: false, field: 'apontamento_inicio_origem' },
    apontamentoFimOrigem: { type: DataTypes.STRING(1), allowNull: true, field: 'apontamento_fim_origem' },
    apontamentoInicioGeolocation: { type: DataTypes.STRING(50), allowNull: true, field: 'apontamento_inicio_geolocation' },
    apontamentoFimGeolocation: { type: DataTypes.STRING(50), allowNull: true, field: 'apontamento_fim_geolocation' },
  },
  { sequelize, tableName: 'apontamento', timestamps: false }
);
