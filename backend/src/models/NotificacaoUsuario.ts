/**
 * Model NotificacaoUsuario - Vínculo Notificação (TipoAlerta) ↔ Colaborador (Usuario)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificacaoUsuarioAttributes {
  notificacaoUsuarioId: number;
  tipoAlertaId: number;
  usuarioId: number;
}

export interface NotificacaoUsuarioCreationAttributes extends Optional<NotificacaoUsuarioAttributes, 'notificacaoUsuarioId'> {}

export class NotificacaoUsuario extends Model<NotificacaoUsuarioAttributes, NotificacaoUsuarioCreationAttributes> implements NotificacaoUsuarioAttributes {
  declare notificacaoUsuarioId: number;
  declare tipoAlertaId: number;
  declare usuarioId: number;
}

NotificacaoUsuario.init(
  {
    notificacaoUsuarioId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'notificacao_usuario_id' },
    tipoAlertaId: { type: DataTypes.INTEGER, allowNull: false, field: 'tipo_alerta_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'usuario_id' },
  },
  { sequelize, tableName: 'notificacao_usuario', timestamps: false }
);
