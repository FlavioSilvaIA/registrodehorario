import { Sequelize } from 'sequelize';
import path from 'path';
import fs from 'fs';

// Usa diretório data/ na raiz do backend (process.cwd = backend ao rodar npm run dev)
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const storage = path.join(dbDir, 'registro_horario.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: process.env.DEBUG_SQL === '1' ? console.log : false,
});
