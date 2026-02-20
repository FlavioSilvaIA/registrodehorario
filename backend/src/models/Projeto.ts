/**
 * Model Projeto - Origem: gxmetadata/projeto.json (Business Component Projeto)
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { DMStatusProjeto, DMTipo } from '../types/enums';

export interface ProjetoAttributes {
  projetoId: number;
  projetoDescricao: string;
  projetoEmpresaId: number;
  centroCustoId?: number | null;
  projetoValorHora: number;
  projetoAtivo: boolean;
  projetoDataInicio?: Date;
  projetoDataFim?: Date;
  projetoStatus: DMStatusProjeto;
  projetoTipo?: DMTipo;
  projetoComentarioObrigatorio?: boolean;
  projetoAtividadeObrigatoria?: boolean;
  projetoDefault?: boolean;
  projetoEquipeId?: number | null;
}

export interface ProjetoCreationAttributes extends Optional<ProjetoAttributes, 'projetoId'> {}

export class Projeto extends Model<ProjetoAttributes, ProjetoCreationAttributes> implements ProjetoAttributes {
  declare projetoId: number;
  declare projetoDescricao: string;
  declare projetoEmpresaId: number;
  declare centroCustoId?: number;
  declare projetoEquipeId?: number | null;
  declare projetoValorHora: number;
  declare projetoAtivo: boolean;
  declare projetoDataInicio?: Date;
  declare projetoDataFim?: Date;
  declare projetoStatus: DMStatusProjeto;
  declare projetoTipo?: DMTipo;
  declare projetoComentarioObrigatorio?: boolean;
  declare projetoAtividadeObrigatoria?: boolean;
  declare projetoDefault?: boolean;
}

Projeto.init(
  {
    projetoId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'projeto_id' },
    projetoDescricao: { type: DataTypes.STRING(80), allowNull: false, field: 'projeto_descricao' },
    projetoEmpresaId: { type: DataTypes.INTEGER, allowNull: false, field: 'projeto_empresa_id' },
    centroCustoId: { type: DataTypes.INTEGER, allowNull: true, field: 'centro_custo_id' },
    projetoValorHora: { type: DataTypes.DECIMAL(13, 2), allowNull: false, defaultValue: 0, field: 'projeto_valor_hora' },
    projetoAtivo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'projeto_ativo' },
    projetoDataInicio: { type: DataTypes.DATEONLY, allowNull: true, field: 'projeto_data_inicio' },
    projetoDataFim: { type: DataTypes.DATEONLY, allowNull: true, field: 'projeto_data_fim' },
    projetoStatus: { type: DataTypes.STRING(1), allowNull: false, field: 'projeto_status' },
    projetoTipo: { type: DataTypes.STRING(1), allowNull: true, field: 'projeto_tipo' },
    projetoComentarioObrigatorio: { type: DataTypes.BOOLEAN, allowNull: true, field: 'projeto_comentario_obrigatorio' },
    projetoAtividadeObrigatoria: { type: DataTypes.BOOLEAN, allowNull: true, field: 'projeto_atividade_obrigatoria' },
    projetoDefault: { type: DataTypes.BOOLEAN, allowNull: true, field: 'projeto_default' },
    projetoEquipeId: { type: DataTypes.INTEGER, allowNull: true, field: 'projeto_equipe_id' },
  },
  { sequelize, tableName: 'projeto', timestamps: false }
);
