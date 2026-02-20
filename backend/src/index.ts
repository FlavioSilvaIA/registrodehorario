/**
 * API Registro Horário - Refatoração GeneXus v2_14
 * Stack: Node.js + Express + Sequelize + SQLite
 */
import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import apontamentoRoutes from './routes/apontamentoRoutes';
import projetoRoutes from './routes/projetoRoutes';
import eventoRoutes from './routes/eventoRoutes';
import empresaRoutes from './routes/empresaRoutes';
import reembolsoRoutes from './routes/reembolsoRoutes';
import mensagemRoutes from './routes/mensagemRoutes';
import parametroRoutes from './routes/parametroRoutes';
import relatorioRoutes from './routes/relatorioRoutes';
import centroCustoRoutes from './routes/centroCustoRoutes';
import equipeRoutes from './routes/equipeRoutes';
import logRoutes from './routes/logRoutes';
import cadastroRoutes from './routes/cadastroRoutes';
import adminRoutes from './routes/adminRoutes';
import notificacaoRoutes from './routes/notificacaoRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/apontamentos', apontamentoRoutes);
app.use('/api/projetos', projetoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/reembolsos', reembolsoRoutes);
app.use('/api/mensagens', mensagemRoutes);
app.use('/api/parametros', parametroRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/centros-custo', centroCustoRoutes);
app.use('/api/equipes', equipeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/cadastro', cadastroRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notificacao', notificacaoRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    try { await sequelize.query('ALTER TABLE centro_custo ADD COLUMN centro_custo_empresa_id INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE empresa ADD COLUMN empresa_tipo_faturamento VARCHAR(40)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE empresa ADD COLUMN empresa_situacao VARCHAR(1)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE equipe ADD COLUMN equipe_empresa_id INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('UPDATE equipe SET equipe_empresa_id = 1 WHERE equipe_empresa_id IS NULL'); } catch (_) { /* migração opcional */ }
    try { await sequelize.query('UPDATE usuario SET usuario_empresa_id = 1 WHERE usuario_empresa_id IS NULL'); } catch (_) { /* migração opcional */ }
    try { await sequelize.query('ALTER TABLE projeto ADD COLUMN centro_custo_id INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE projeto ADD COLUMN projeto_equipe_id INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_hora_prevista_chegada VARCHAR(5)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_hora_prevista_saida VARCHAR(5)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_hora_prevista_almoco_saida VARCHAR(5)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_hora_prevista_almoco_chegada VARCHAR(5)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_trava_apontamento INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_foto_base64 TEXT'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_foto_nome VARCHAR(80)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE usuario ADD COLUMN usuario_foto_extensao VARCHAR(6)'); } catch (_) { /* coluna já existe */ }
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS usuario_projeto (
          usuario_projeto_id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,
          projeto_id INTEGER NOT NULL,
          usuario_projeto_tipo VARCHAR(1) DEFAULT 'P',
          usuario_projeto_valor DECIMAL(9,2) DEFAULT 100,
          UNIQUE(usuario_id, projeto_id)
        )
      `);
    } catch (_) { /* tabela já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_data_nota DATE'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_valor_nota DECIMAL(13,2)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_valor_reembolsado DECIMAL(13,2)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_observacao VARCHAR(4000)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_nota_fiscal_base64 TEXT'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_nota_fiscal_nome VARCHAR(120)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE reembolso ADD COLUMN reembolso_confirmar INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN empresa_id INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN notificacao_id INTEGER'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN tipo_alerta_tempo_de DECIMAL(10,2)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN tipo_alerta_tempo_ate DECIMAL(10,2)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN tipo_alerta_notificar_administradores INTEGER DEFAULT 0'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN tipo_alerta_imagem_base64 TEXT'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN tipo_alerta_imagem_nome VARCHAR(120)'); } catch (_) { /* coluna já existe */ }
    try { await sequelize.query('ALTER TABLE tipo_alerta ADD COLUMN tipo_alerta_imagem_extensao VARCHAR(10)'); } catch (_) { /* coluna já existe */ }
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS notificacao (
          notificacao_id INTEGER PRIMARY KEY AUTOINCREMENT,
          empresa_id INTEGER NOT NULL,
          notificacao_texto VARCHAR(4000) NOT NULL,
          notificacao_envia_email INTEGER DEFAULT 0,
          notificacao_envia_site INTEGER DEFAULT 0,
          notificacao_envia_celular INTEGER DEFAULT 0
        )
      `);
    } catch (_) { /* tabela já existe */ }
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS notificacao_usuario (
          notificacao_usuario_id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo_alerta_id INTEGER NOT NULL,
          usuario_id INTEGER NOT NULL,
          UNIQUE(tipo_alerta_id, usuario_id)
        )
      `);
    } catch (_) { /* tabela já existe */ }
    app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
  } catch (err) {
    console.error('Erro ao iniciar:', err);
    process.exit(1);
  }
}

start();
