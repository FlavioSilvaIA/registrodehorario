/**
 * Model ProjetoEtapaAtividade - Origem: gxmetadata/projetoetapaatividade.json
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Status } from '../types/enums';

export interface ProjetoEtapaAtividadeAttributes {
  projetoEtapaAtividadeId: number;
  projetoEtapaAtividadeEtapaId: number;
  projetoEtapaAtividadeNome: string;
  projetoEtapaAtividadeDescricao: string;
  projetoEtapaAtividadeStatus: Status;
}

export interface ProjetoEtapaAtividadeCreationAttributes extends Optional<ProjetoEtapaAtividadeAttributes, 'projetoEtapaAtividadeId'> {}

export class ProjetoEtapaAtividade extends Model<ProjetoEtapaAtividadeAttributes, ProjetoEtapaAtividadeCreationAttributes> implements ProjetoEtapaAtividadeAttributes {
  declare projetoEtapaAtividadeId: number;
  declare projetoEtapaAtividadeEtapaId: number;
  declare projetoEtapaAtividadeNome: string;
  declare projetoEtapaAtividadeDescricao: string;
  declare projetoEtapaAtividadeStatus: Status;
}

ProjetoEtapaAtividade.init(
  {
    projetoEtapaAtividadeId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'projeto_etapa_atividade_id' },
    projetoEtapaAtividadeEtapaId: { type: DataTypes.INTEGER, allowNull: false, field: 'projeto_etapa_atividade_etapa_id' },
    projetoEtapaAtividadeNome: { type: DataTypes.STRING(80), allowNull: false, field: 'projeto_etapa_atividade_nome' },
    projetoEtapaAtividadeDescricao: { type: DataTypes.TEXT, allowNull: false, defaultValue: '', field: 'projeto_etapa_atividade_descricao' },
    projetoEtapaAtividadeStatus: { type: DataTypes.STRING(1), allowNull: false, field: 'projeto_etapa_atividade_status' },
  },
  { sequelize, tableName: 'projeto_etapa_atividade', timestamps: false }
);
