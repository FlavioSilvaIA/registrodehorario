/**
 * Model UsuarioValorHora - Lista de preço por usuário com data de vigência
 * Origem: UsuarioListaPrecoData, UsuarioListaPrecoValor (registrohorario.gxapp.json)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UsuarioValorHoraAttributes {
  usuarioValorHoraId: number;
  usuarioId: number;
  valorHoraData: Date;
  valorHoraValor: number;
}

export interface UsuarioValorHoraCreationAttributes extends Optional<UsuarioValorHoraAttributes, 'usuarioValorHoraId'> {}

export class UsuarioValorHora extends Model<UsuarioValorHoraAttributes, UsuarioValorHoraCreationAttributes> implements UsuarioValorHoraAttributes {
  declare usuarioValorHoraId: number;
  declare usuarioId: number;
  declare valorHoraData: Date;
  declare valorHoraValor: number;
}

UsuarioValorHora.init(
  {
    usuarioValorHoraId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'usuario_valor_hora_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
    valorHoraData: { type: DataTypes.DATEONLY, allowNull: false, field: 'valor_hora_data' },
    valorHoraValor: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0, field: 'valor_hora_valor' },
  },
  { sequelize, tableName: 'usuario_valor_hora', timestamps: false }
);
