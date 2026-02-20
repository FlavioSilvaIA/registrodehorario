/**
 * Model ProjetoEtapa - Origem: gxmetadata/projetoetapa.json
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Status } from '../types/enums';

export interface ProjetoEtapaAttributes {
  projetoEtapaId: number;
  projetoEtapaProjetoId: number;
  projetoEtapaNome: string;
  projetoEtapaStatus: Status;
}

export interface ProjetoEtapaCreationAttributes extends Optional<ProjetoEtapaAttributes, 'projetoEtapaId'> {}

export class ProjetoEtapa extends Model<ProjetoEtapaAttributes, ProjetoEtapaCreationAttributes> implements ProjetoEtapaAttributes {
  declare projetoEtapaId: number;
  declare projetoEtapaProjetoId: number;
  declare projetoEtapaNome: string;
  declare projetoEtapaStatus: Status;
}

ProjetoEtapa.init(
  {
    projetoEtapaId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'projeto_etapa_id' },
    projetoEtapaProjetoId: { type: DataTypes.INTEGER, allowNull: false, field: 'projeto_etapa_projeto_id' },
    projetoEtapaNome: { type: DataTypes.STRING(80), allowNull: false, field: 'projeto_etapa_nome' },
    projetoEtapaStatus: { type: DataTypes.STRING(1), allowNull: false, field: 'projeto_etapa_status' },
  },
  { sequelize, tableName: 'projeto_etapa', timestamps: false }
);
