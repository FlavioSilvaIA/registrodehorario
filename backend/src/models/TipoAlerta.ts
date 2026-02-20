/**
 * Model TipoAlerta - Tipos de alerta configuráveis para notificações
 * Campos: empresa, notificação, descrição, tempo de/até, notificar administradores, imagem
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TipoAlertaAttributes {
  tipoAlertaId: number;
  empresaId?: number | null;
  notificacaoId?: number | null;
  tipoAlertaDescricao: string;
  tipoAlertaTempoDe?: number | null;
  tipoAlertaTempoAte?: number | null;
  tipoAlertaNotificarAdministradores: boolean;
  tipoAlertaAtivo: boolean;
  tipoAlertaImagemBase64?: string | null;
  tipoAlertaImagemNome?: string | null;
  tipoAlertaImagemExtensao?: string | null;
}

export interface TipoAlertaCreationAttributes extends Optional<TipoAlertaAttributes, 'tipoAlertaId'> {}

export class TipoAlerta extends Model<TipoAlertaAttributes, TipoAlertaCreationAttributes> implements TipoAlertaAttributes {
  declare tipoAlertaId: number;
  declare empresaId?: number | null;
  declare notificacaoId?: number | null;
  declare tipoAlertaDescricao: string;
  declare tipoAlertaTempoDe?: number | null;
  declare tipoAlertaTempoAte?: number | null;
  declare tipoAlertaNotificarAdministradores: boolean;
  declare tipoAlertaAtivo: boolean;
  declare tipoAlertaImagemBase64?: string | null;
  declare tipoAlertaImagemNome?: string | null;
  declare tipoAlertaImagemExtensao?: string | null;
}

TipoAlerta.init(
  {
    tipoAlertaId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'tipo_alerta_id' },
    empresaId: { type: DataTypes.INTEGER, allowNull: true, field: 'empresa_id' },
    notificacaoId: { type: DataTypes.INTEGER, allowNull: true, field: 'notificacao_id' },
    tipoAlertaDescricao: { type: DataTypes.STRING(4000), allowNull: false, field: 'tipo_alerta_descricao' },
    tipoAlertaTempoDe: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'tipo_alerta_tempo_de' },
    tipoAlertaTempoAte: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'tipo_alerta_tempo_ate' },
    tipoAlertaNotificarAdministradores: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'tipo_alerta_notificar_administradores' },
    tipoAlertaAtivo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'tipo_alerta_ativo' },
    tipoAlertaImagemBase64: { type: DataTypes.TEXT, allowNull: true, field: 'tipo_alerta_imagem_base64' },
    tipoAlertaImagemNome: { type: DataTypes.STRING(120), allowNull: true, field: 'tipo_alerta_imagem_nome' },
    tipoAlertaImagemExtensao: { type: DataTypes.STRING(10), allowNull: true, field: 'tipo_alerta_imagem_extensao' },
  },
  { sequelize, tableName: 'tipo_alerta', timestamps: false }
);
