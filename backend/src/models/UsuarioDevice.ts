/**
 * Model UsuarioDevice - Vínculo usuário ↔ dispositivo para push
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UsuarioDeviceAttributes {
  usuarioDeviceId: number;
  usuarioId: number;
  deviceCod: number;
}

export interface UsuarioDeviceCreationAttributes extends Optional<UsuarioDeviceAttributes, 'usuarioDeviceId'> {}

export class UsuarioDevice extends Model<UsuarioDeviceAttributes, UsuarioDeviceCreationAttributes> implements UsuarioDeviceAttributes {
  declare usuarioDeviceId: number;
  declare usuarioId: number;
  declare deviceCod: number;
}

UsuarioDevice.init(
  {
    usuarioDeviceId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'usuario_device_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
    deviceCod: { type: DataTypes.INTEGER, allowNull: false, field: 'device_cod' },
  },
  { sequelize, tableName: 'usuario_device', timestamps: false }
);
