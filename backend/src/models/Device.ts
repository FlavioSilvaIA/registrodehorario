/**
 * Model Device - Dispositivos para push notification (origem: gxmetadata/device.json)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface DeviceAttributes {
  deviceCod: number;
  deviceId: string;
  deviceName: string;
  deviceToken: string;
  deviceType: number; // 0=iOS, 1=Android, 2=BB, 3=Win
}

export interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'deviceCod'> {}

export class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  declare deviceCod: number;
  declare deviceId: string;
  declare deviceName: string;
  declare deviceToken: string;
  declare deviceType: number;
}

Device.init(
  {
    deviceCod: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'device_cod' },
    deviceId: { type: DataTypes.STRING(128), allowNull: false, field: 'device_id' },
    deviceName: { type: DataTypes.STRING(128), allowNull: false, field: 'device_name' },
    deviceToken: { type: DataTypes.STRING(255), allowNull: false, field: 'device_token' },
    deviceType: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'device_type' },
  },
  { sequelize, tableName: 'device', timestamps: false }
);
