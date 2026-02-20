/**
 * Model Mensagem - Origem: gxmetadata/mensagem.json
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface MensagemAttributes {
  mensagemId: number;
  remetenteUsuarioId: number;
  mensagemCadastroDataHora: Date;
  mensagemTitulo: string;
  mensagemTexto: string;
  mensagemEnviaEmail: boolean;
  mensagemSituacao: string; // E=Enviada, P=Pendente
}

export interface MensagemCreationAttributes extends Optional<MensagemAttributes, 'mensagemId'> {}

export class Mensagem extends Model<MensagemAttributes, MensagemCreationAttributes> implements MensagemAttributes {
  declare mensagemId: number;
  declare remetenteUsuarioId: number;
  declare mensagemCadastroDataHora: Date;
  declare mensagemTitulo: string;
  declare mensagemTexto: string;
  declare mensagemEnviaEmail: boolean;
  declare mensagemSituacao: string;
}

Mensagem.init(
  {
    mensagemId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'mensagem_id' },
    remetenteUsuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'remetente_usuario_id' },
    mensagemCadastroDataHora: { type: DataTypes.DATE, allowNull: false, field: 'mensagem_cadastro_data_hora' },
    mensagemTitulo: { type: DataTypes.STRING(80), allowNull: false, field: 'mensagem_titulo' },
    mensagemTexto: { type: DataTypes.STRING(8000), allowNull: false, field: 'mensagem_texto' },
    mensagemEnviaEmail: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'mensagem_envia_email' },
    mensagemSituacao: { type: DataTypes.STRING(1), allowNull: false, defaultValue: 'P', field: 'mensagem_situacao' },
  },
  { sequelize, tableName: 'mensagem', timestamps: false }
);
