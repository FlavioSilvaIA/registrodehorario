/**
 * Model RegistroAvisoLog - Origem: gxmetadata/registroavisolog.json
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface RegistroAvisoLogAttributes {
  registroAvisoLogId: number;
  registroAvisoLogDataHora: Date;
  registroAvisoLogData: Date;
  registroAvisoLogUsuarioId: number;
  registroAvisoLogObservacao: string;
}

export interface RegistroAvisoLogCreationAttributes extends Optional<RegistroAvisoLogAttributes, 'registroAvisoLogId'> {}

export class RegistroAvisoLog extends Model<RegistroAvisoLogAttributes, RegistroAvisoLogCreationAttributes> implements RegistroAvisoLogAttributes {
  declare registroAvisoLogId: number;
  declare registroAvisoLogDataHora: Date;
  declare registroAvisoLogData: Date;
  declare registroAvisoLogUsuarioId: number;
  declare registroAvisoLogObservacao: string;
}

RegistroAvisoLog.init(
  {
    registroAvisoLogId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'registro_aviso_log_id' },
    registroAvisoLogDataHora: { type: DataTypes.DATE, allowNull: false, field: 'registro_aviso_log_data_hora' },
    registroAvisoLogData: { type: DataTypes.DATEONLY, allowNull: false, field: 'registro_aviso_log_data' },
    registroAvisoLogUsuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'registro_aviso_log_usuario_id' },
    registroAvisoLogObservacao: { type: DataTypes.STRING(4000), allowNull: false, field: 'registro_aviso_log_observacao' },
  },
  { sequelize, tableName: 'registro_aviso_log', timestamps: false }
);
