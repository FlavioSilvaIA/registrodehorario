/**
 * Model Empresa - Inferido de Usuario, Projeto, Evento (EmpresaId)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface EmpresaAttributes {
  empresaId: number;
  empresaDescricao: string;
  empresaTipoFaturamento?: string;
  empresaSituacao?: string;
}

export interface EmpresaCreationAttributes extends Optional<EmpresaAttributes, 'empresaId' | 'empresaTipoFaturamento' | 'empresaSituacao'> {}

export class Empresa extends Model<EmpresaAttributes, EmpresaCreationAttributes> implements EmpresaAttributes {
  declare empresaId: number;
  declare empresaDescricao: string;
  declare empresaTipoFaturamento?: string;
  declare empresaSituacao?: string;
}

Empresa.init(
  {
    empresaId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'empresa_id' },
    empresaDescricao: { type: DataTypes.STRING(80), allowNull: false, field: 'empresa_descricao' },
    empresaTipoFaturamento: { type: DataTypes.STRING(40), allowNull: true, field: 'empresa_tipo_faturamento' },
    empresaSituacao: { type: DataTypes.STRING(1), allowNull: true, field: 'empresa_situacao' },
  },
  { sequelize, tableName: 'empresa', timestamps: false }
);
