/**
 * Model UsuarioProjeto - Relação usuário x projeto com horas ou percentual
 * tipo: H = horas por projeto, P = percentual (25, 50, 75, 100)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UsuarioProjetoAttributes {
  usuarioProjetoId: number;
  usuarioId: number;
  projetoId: number;
  tipo: 'H' | 'P'; // H=horas, P=percentual
  valor: number; // horas (ex: 20) ou percentual (25, 50, 75, 100)
}

export interface UsuarioProjetoCreationAttributes extends Optional<UsuarioProjetoAttributes, 'usuarioProjetoId'> {}

export class UsuarioProjeto extends Model<UsuarioProjetoAttributes, UsuarioProjetoCreationAttributes> implements UsuarioProjetoAttributes {
  declare usuarioProjetoId: number;
  declare usuarioId: number;
  declare projetoId: number;
  declare tipo: 'H' | 'P';
  declare valor: number;
}

UsuarioProjeto.init(
  {
    usuarioProjetoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'usuario_projeto_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
    projetoId: { type: DataTypes.INTEGER, allowNull: false, field: 'projeto_id' },
    tipo: { type: DataTypes.STRING(1), allowNull: false, defaultValue: 'P', field: 'usuario_projeto_tipo' },
    valor: { type: DataTypes.DECIMAL(9, 2), allowNull: false, defaultValue: 100, field: 'usuario_projeto_valor' },
  },
  { sequelize, tableName: 'usuario_projeto', timestamps: false }
);
