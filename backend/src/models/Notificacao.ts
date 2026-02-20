/**
 * Model Notificacao - Cadastro de notificações por empresa
 * Campos: empresa, texto, enviar por email, site, celular
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificacaoAttributes {
  notificacaoId: number;
  empresaId: number;
  notificacaoTexto: string;
  notificacaoEnviaEmail: boolean;
  notificacaoEnviaSite: boolean;
  notificacaoEnviaCelular: boolean;
}

export interface NotificacaoCreationAttributes extends Optional<NotificacaoAttributes, 'notificacaoId'> {}

export class Notificacao extends Model<NotificacaoAttributes, NotificacaoCreationAttributes> implements NotificacaoAttributes {
  declare notificacaoId: number;
  declare empresaId: number;
  declare notificacaoTexto: string;
  declare notificacaoEnviaEmail: boolean;
  declare notificacaoEnviaSite: boolean;
  declare notificacaoEnviaCelular: boolean;
}

Notificacao.init(
  {
    notificacaoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'notificacao_id' },
    empresaId: { type: DataTypes.INTEGER, allowNull: false, field: 'empresa_id' },
    notificacaoTexto: { type: DataTypes.STRING(4000), allowNull: false, field: 'notificacao_texto' },
    notificacaoEnviaEmail: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'notificacao_envia_email' },
    notificacaoEnviaSite: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'notificacao_envia_site' },
    notificacaoEnviaCelular: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'notificacao_envia_celular' },
  },
  { sequelize, tableName: 'notificacao', timestamps: false }
);
