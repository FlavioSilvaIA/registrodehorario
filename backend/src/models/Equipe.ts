/**
 * Model Equipe - Inferido de Usuario (EquipeId)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EquipeAttributes {
  equipeId: number;
  equipeDescricao: string;
  equipeEmpresaId?: number | null;
}

export interface EquipeCreationAttributes extends Optional<EquipeAttributes, 'equipeId'> {}

export class Equipe extends Model<EquipeAttributes, EquipeCreationAttributes> implements EquipeAttributes {
  declare equipeId: number;
  declare equipeDescricao: string;
  declare equipeEmpresaId?: number | null;
}

Equipe.init(
  {
    equipeId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'equipe_id' },
    equipeDescricao: { type: DataTypes.STRING(80), allowNull: false, field: 'equipe_descricao' },
    equipeEmpresaId: { type: DataTypes.INTEGER, allowNull: true, field: 'equipe_empresa_id' },
  },
  { sequelize, tableName: 'equipe', timestamps: false }
);
