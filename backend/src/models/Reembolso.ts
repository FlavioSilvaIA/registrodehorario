/**
 * Model Reembolso - Origem: Metadata/TableAccess/Reembolso.xml
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ReembolsoAttributes {
  reembolsoId: number;
  reembolsoUsuarioId: number;
  reembolsoTipoReembolsoId: number;
  reembolsoValor: number;
  reembolsoData: Date;
  reembolsoDescricao?: string;
  reembolsoSituacao: number; // 1=Pendente, 2=Aprovado, 3=Negado
  reembolsoDataAprovacao?: Date;
  reembolsoAprovadorUsuarioId?: number;
  reembolsoDataNota?: Date;
  reembolsoValorNota?: number;
  reembolsoValorReembolsado?: number;
  reembolsoObservacao?: string;
  reembolsoNotaFiscalBase64?: string;
  reembolsoNotaFiscalNome?: string;
  reembolsoConfirmar?: boolean;
}

export interface ReembolsoCreationAttributes extends Optional<ReembolsoAttributes, 'reembolsoId'> {}

export class Reembolso extends Model<ReembolsoAttributes, ReembolsoCreationAttributes> implements ReembolsoAttributes {
  declare reembolsoId: number;
  declare reembolsoUsuarioId: number;
  declare reembolsoTipoReembolsoId: number;
  declare reembolsoValor: number;
  declare reembolsoData: Date;
  declare reembolsoDescricao?: string;
  declare reembolsoSituacao: number;
  declare reembolsoDataAprovacao?: Date;
  declare reembolsoAprovadorUsuarioId?: number;
  declare reembolsoDataNota?: Date;
  declare reembolsoValorNota?: number;
  declare reembolsoValorReembolsado?: number;
  declare reembolsoObservacao?: string;
  declare reembolsoNotaFiscalBase64?: string;
  declare reembolsoNotaFiscalNome?: string;
  declare reembolsoConfirmar?: boolean;
}

Reembolso.init(
  {
    reembolsoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'reembolso_id' },
    reembolsoUsuarioId: { type: DataTypes.INTEGER, allowNull: false, field: 'reembolso_usuario_id' },
    reembolsoTipoReembolsoId: { type: DataTypes.INTEGER, allowNull: false, field: 'reembolso_tipo_reembolso_id' },
    reembolsoValor: { type: DataTypes.DECIMAL(13, 2), allowNull: false, field: 'reembolso_valor' },
    reembolsoData: { type: DataTypes.DATEONLY, allowNull: false, field: 'reembolso_data' },
    reembolsoDescricao: { type: DataTypes.STRING(4000), allowNull: true, field: 'reembolso_descricao' },
    reembolsoSituacao: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'reembolso_situacao' },
    reembolsoDataAprovacao: { type: DataTypes.DATE, allowNull: true, field: 'reembolso_data_aprovacao' },
    reembolsoAprovadorUsuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'reembolso_aprovador_usuario_id' },
    reembolsoDataNota: { type: DataTypes.DATEONLY, allowNull: true, field: 'reembolso_data_nota' },
    reembolsoValorNota: { type: DataTypes.DECIMAL(13, 2), allowNull: true, field: 'reembolso_valor_nota' },
    reembolsoValorReembolsado: { type: DataTypes.DECIMAL(13, 2), allowNull: true, field: 'reembolso_valor_reembolsado' },
    reembolsoObservacao: { type: DataTypes.STRING(4000), allowNull: true, field: 'reembolso_observacao' },
    reembolsoNotaFiscalBase64: { type: DataTypes.TEXT, allowNull: true, field: 'reembolso_nota_fiscal_base64' },
    reembolsoNotaFiscalNome: { type: DataTypes.STRING(120), allowNull: true, field: 'reembolso_nota_fiscal_nome' },
    reembolsoConfirmar: { type: DataTypes.BOOLEAN, allowNull: true, field: 'reembolso_confirmar' },
  },
  { sequelize, tableName: 'reembolso', timestamps: false }
);
