/**
 * Model Parametro - Origem: Metadata/TableAccess/Parametro.xml
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ParametroAttributes {
  parametroId: number;
  parametroChave: string;
  parametroValor: string;
}

export interface ParametroCreationAttributes extends Optional<ParametroAttributes, 'parametroId'> {}

export class Parametro extends Model<ParametroAttributes, ParametroCreationAttributes> implements ParametroAttributes {
  declare parametroId: number;
  declare parametroChave: string;
  declare parametroValor: string;
}

Parametro.init(
  {
    parametroId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'parametro_id' },
    parametroChave: { type: DataTypes.STRING(100), allowNull: false, field: 'parametro_chave' },
    parametroValor: { type: DataTypes.STRING(4000), allowNull: true, defaultValue: '', field: 'parametro_valor' },
  },
  { sequelize, tableName: 'parametro', timestamps: false }
);
