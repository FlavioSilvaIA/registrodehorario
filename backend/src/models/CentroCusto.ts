/**
 * Model CentroCusto - Inferido de Projeto (CentroCustoId)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface CentroCustoAttributes {
  centroCustoId: number;
  centroCustoDescricao: string;
  centroCustoEmpresaId?: number;
}

export interface CentroCustoCreationAttributes extends Optional<CentroCustoAttributes, 'centroCustoId' | 'centroCustoEmpresaId'> {}

export class CentroCusto extends Model<CentroCustoAttributes, CentroCustoCreationAttributes> implements CentroCustoAttributes {
  declare centroCustoId: number;
  declare centroCustoDescricao: string;
  declare centroCustoEmpresaId?: number;
}

CentroCusto.init(
  {
    centroCustoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'centro_custo_id' },
    centroCustoDescricao: { type: DataTypes.STRING(80), allowNull: false, field: 'centro_custo_descricao' },
    centroCustoEmpresaId: { type: DataTypes.INTEGER, allowNull: true, field: 'centro_custo_empresa_id' },
  },
  { sequelize, tableName: 'centro_custo', timestamps: false }
);
