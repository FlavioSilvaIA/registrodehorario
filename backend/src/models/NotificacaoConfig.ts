/**
 * Model NotificacaoConfig - Configurações gerais do módulo de notificação
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificacaoConfigAttributes {
  notificacaoConfigId: number;
  notificacaoConfigChave: string;
  notificacaoConfigValor: string;
  notificacaoConfigDescricao?: string;
}

export interface NotificacaoConfigCreationAttributes extends Optional<NotificacaoConfigAttributes, 'notificacaoConfigId'> {}

export class NotificacaoConfig extends Model<NotificacaoConfigAttributes, NotificacaoConfigCreationAttributes> implements NotificacaoConfigAttributes {
  declare notificacaoConfigId: number;
  declare notificacaoConfigChave: string;
  declare notificacaoConfigValor: string;
  declare notificacaoConfigDescricao?: string;
}

NotificacaoConfig.init(
  {
    notificacaoConfigId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'notificacao_config_id' },
    notificacaoConfigChave: { type: DataTypes.STRING(80), allowNull: false, field: 'notificacao_config_chave' },
    notificacaoConfigValor: { type: DataTypes.STRING(4000), allowNull: false, field: 'notificacao_config_valor' },
    notificacaoConfigDescricao: { type: DataTypes.STRING(200), allowNull: true, field: 'notificacao_config_descricao' },
  },
  { sequelize, tableName: 'notificacao_config', timestamps: false }
);
