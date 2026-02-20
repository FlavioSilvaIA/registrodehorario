/**
 * Model NotificacaoAdministrador - Usuários administradores do módulo de notificação
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificacaoAdministradorAttributes {
  notificacaoAdministradorId: number;
  usuarioId: number;
}

export interface NotificacaoAdministradorCreationAttributes extends Optional<NotificacaoAdministradorAttributes, 'notificacaoAdministradorId'> {}

export class NotificacaoAdministrador extends Model<NotificacaoAdministradorAttributes, NotificacaoAdministradorCreationAttributes> implements NotificacaoAdministradorAttributes {
  declare notificacaoAdministradorId: number;
  declare usuarioId: number;
}

NotificacaoAdministrador.init(
  {
    notificacaoAdministradorId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'notificacao_administrador_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
  },
  { sequelize, tableName: 'notificacao_administrador', timestamps: false }
);
