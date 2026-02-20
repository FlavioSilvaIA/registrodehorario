/**
 * Model Evento - Origem: gxmetadata/evento.json
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { EvTipo, Abrangencia } from '../types/enums';

export interface EventoAttributes {
  eventoId: number;
  eventoData: Date;
  eventoDataFinal: Date;
  eventoCadastroDataHora: Date;
  eventoTipo: EvTipo;
  eventoDescricao: string;
  eventoAbrangencia: Abrangencia;
  eventoDiaInteiro: boolean;
  eventoInicioDataHora: Date;
  eventoFinalDataHora: Date;
  eventoEmpresaId?: number;
  eventoUsuarioId?: number;
}

export interface EventoCreationAttributes extends Optional<EventoAttributes, 'eventoId'> {}

export class Evento extends Model<EventoAttributes, EventoCreationAttributes> implements EventoAttributes {
  declare eventoId: number;
  declare eventoData: Date;
  declare eventoDataFinal: Date;
  declare eventoCadastroDataHora: Date;
  declare eventoTipo: EvTipo;
  declare eventoDescricao: string;
  declare eventoAbrangencia: Abrangencia;
  declare eventoDiaInteiro: boolean;
  declare eventoInicioDataHora: Date;
  declare eventoFinalDataHora: Date;
  declare eventoEmpresaId?: number;
  declare eventoUsuarioId?: number;
}

Evento.init(
  {
    eventoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'evento_id' },
    eventoData: { type: DataTypes.DATEONLY, allowNull: false, field: 'evento_data' },
    eventoDataFinal: { type: DataTypes.DATEONLY, allowNull: false, field: 'evento_data_final' },
    eventoCadastroDataHora: { type: DataTypes.DATE, allowNull: false, field: 'evento_cadastro_data_hora' },
    eventoTipo: { type: DataTypes.INTEGER, allowNull: false, field: 'evento_tipo' },
    eventoDescricao: { type: DataTypes.STRING(80), allowNull: false, field: 'evento_descricao' },
    eventoAbrangencia: { type: DataTypes.INTEGER, allowNull: false, field: 'evento_abrangencia' },
    eventoDiaInteiro: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'evento_dia_inteiro' },
    eventoInicioDataHora: { type: DataTypes.DATE, allowNull: false, field: 'evento_inicio_data_hora' },
    eventoFinalDataHora: { type: DataTypes.DATE, allowNull: false, field: 'evento_final_data_hora' },
    eventoEmpresaId: { type: DataTypes.INTEGER, allowNull: true, field: 'evento_empresa_id' },
    eventoUsuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'evento_usuario_id' },
  },
  { sequelize, tableName: 'evento', timestamps: false }
);
