# Projeto Completo - Registro de Horas GX2
**Data: 18/02/2026**

Sistema de Registro de Horas - Refatoração GeneXus (React + Node.js)

---

## Estrutura do Projeto

```
projeto completo _18022026/
├── backend/          # API Node.js + Express + Sequelize + SQLite
├── frontend/         # Aplicação React + Vite
├── Agentes/          # Agentes de engenharia reversa e refatoração
└── README.md
```

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** 9+

---

## Instalação e Execução

### 1. Backend (API)

```bash
cd backend
npm install
npm start
```

A API estará disponível em **http://localhost:3001**

> **Nota:** O comando `npm start` usa `tsx` para executar diretamente o TypeScript. Para produção com build: `npm run build` e `npm run start:prod` (requer correção de erros TS).

### 2. Frontend

**Desenvolvimento:**
```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173**

**Produção (build estático):**
```bash
cd frontend
npm install
npm run build
```

Os arquivos estarão em `frontend/dist/` — sirva com qualquer servidor estático (nginx, Apache, etc.).

---

## Deploy na Web

### Opção A: Hospedagem com Node.js (ex: Railway, Render, Heroku)

1. **Backend:** Configure a variável `PORT` (padrão 3001)
2. **Frontend:** Ajuste `vite.config.ts` ou `api` baseURL para apontar à URL da API em produção
3. Faça build do frontend: `npm run build`
4. Sirva a pasta `dist/` como estático e aponte a API para o backend

### Opção B: Frontend estático + API separada

1. **Backend:** Deploy em servidor Node.js (VPS, cloud, etc.)
2. **Frontend:** Build → `dist/` → hospedar em CDN ou servidor estático
3. Configure CORS no backend para a origem do frontend
4. Ajuste `baseURL` no frontend (`src/services/api.ts`) para a URL da API em produção

### Variáveis de ambiente (Backend)

- `PORT` — Porta do servidor (padrão: 3001)
- Banco SQLite: arquivo em `backend/data/` (criado automaticamente)

---

## Banco de Dados

- **SQLite** — arquivo em `backend/data/`
- Inicializar banco vazio: `cd backend && npm run db:init`
- Usuário de teste: `colab01` / Senha: `123456`

---

## Pastas

- **backend/** — API REST, modelos Sequelize, controllers
- **frontend/** — React, Vite, páginas e componentes
- **Agentes/** — Scripts e agentes de engenharia reversa GeneXus

---

## Licença

Uso interno - Refatoração GeneXus v2_14
