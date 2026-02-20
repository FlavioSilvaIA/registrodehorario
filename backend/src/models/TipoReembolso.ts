/**
 * Model TipoReembolso - Origem: Metadata/TableAccess/TipoReembolso.xml
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TipoReembolsoAttributes {
  tipoReembolsoId: number;
  tipoReembolsoDescricao: string;
}

export interface TipoReembolsoCreationAttributes extends Optional<TipoReembolsoAttributes, 'tipoReembolsoId'> {}

export class TipoReembolso extends Model<TipoReembolsoAttributes, TipoReembolsoCreationAttributes> implements TipoReembolsoAttributes {
  declare tipoReembolsoId: number;
  declare tipoReembolsoDescricao: string;
}

TipoReembolso.init(
  {
    tipoReembolsoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'tipo_reembolso_id' },
    tipoReembolsoDescricao: { type: DataTypes.STRING(80), allowNull: false, field: 'tipo_reembolso_descricao' },
  },
  { sequelize, tableName: 'tipo_reembolso', timestamps: false }
);
