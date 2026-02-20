# FASE 2 — PLANEJAMENTO DETALHADO DA REFATORAÇÃO
## GeneXus → React JS + Node.js

**Agente:** Agente_pro_GeneXus_REFACTOR  
**Data:** 18/02/2025  
**Base:** fase_1_inventario_escopo.md

---

## 1. ESTRATÉGIA EM FASES

### 1.1 Visão Geral

A migração será executada em **uma única fase de execução** (Fase 3), criando:

1. **Backend Node.js** — API REST com Express, modelos Sequelize/TypeORM, autenticação JWT
2. **Frontend React** — SPA com rotas: Login, Dashboard, Apontamento
3. **Banco de dados** — Schema SQL (PostgreSQL/SQLite) compatível com o dicionário de dados GeneXus

### 1.2 Ordem de Execução (Conforme Agente)

| Ordem | Camada | Artefatos |
|-------|--------|-----------|
| 1 | Domains/Attributes | Enums e tipos TypeScript (Perfil, Situacao, Tipo, etc.) |
| 2 | SDTs/BCs | Modelos Sequelize + schemas |
| 3 | Transactions | Não aplicável (BCs já mapeados) |
| 4 | Procedures/Web Panels | Controllers + Services Node.js; Componentes React |
| 5 | Data Providers | Endpoints REST |
| 6 | Integrações | Auth (JWT), opcional: push |
| 7 | Banco | Scripts de migração |

---

## 2. BACKLOG ESTRUTURADO

### 2.1 Backend (Node.js)

| ID | Item | Descrição | Prioridade |
|----|------|-----------|------------|
| BE-01 | Projeto Node.js | package.json, tsconfig, estrutura pastas | P0 |
| BE-02 | Schema BD | SQL com tabelas Usuario, Apontamento, Projeto, etc. | P0 |
| BE-03 | Modelos Sequelize | Usuario, Apontamento, Projeto, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Device, RegistroAvisoLog | P0 |
| BE-04 | Enums/Tipos | Perfil, Situacao, Tipo, OrigemApontamento, EvTipo, Abrangencia, DMStatusProjeto, DMTipo | P0 |
| BE-05 | Auth | POST /auth/login (PrcValidaLoginUsuario), JWT | P0 |
| BE-06 | Usuario | GET /usuarios/me, PUT /usuarios/me | P1 |
| BE-07 | Apontamento | POST /apontamentos (início), PUT /apontamentos/:id (fim), GET /apontamentos | P0 |
| BE-08 | Projeto | GET /projetos, GET /projetos/:id | P0 |
| BE-09 | ProjetoEtapa | GET /projetos/:id/etapas | P1 |
| BE-10 | ProjetoEtapaAtividade | GET /etapas/:id/atividades | P1 |
| BE-11 | Evento | GET /eventos (por período) | P1 |
| BE-12 | Horas do dia | GET /usuarios/:id/horas-dia (PrcGetSdtUsuarioHorasDia) | P0 |
| BE-13 | Verifica apontamento em aberto | GET /usuarios/:id/apontamento-aberto | P0 |
| BE-14 | Mensagens | GET /mensagens (PrcQntMensagem) | P2 |
| BE-15 | Device | POST /devices (NotificationsRegistrationHandler) | P2 |

### 2.2 Frontend (React)

| ID | Item | Descrição | Prioridade |
|----|------|-----------|------------|
| FE-01 | Projeto React | Vite + React + TypeScript, estrutura pastas | P0 |
| FE-02 | Roteamento | React Router: /login, /dashboard, /apontamento | P0 |
| FE-03 | Auth Context | Login, logout, token JWT | P0 |
| FE-04 | Tela Login | SdLogin equivalente — formulário login/senha | P0 |
| FE-05 | Tela Dashboard | SdDashBoard — projetos, horas do dia, apontamento em aberto | P0 |
| FE-06 | Tela Apontamento | SdApontamento — registrar entrada/saída, projeto, atividade, tipo, comentário | P0 |
| FE-07 | API Client | Axios/fetch com baseURL e interceptor de token | P0 |
| FE-08 | Componentes reutilizáveis | Input, Button, Card, Select | P1 |
| FE-09 | Validações | Projeto obrigatório, comentário obrigatório, atividade obrigatória | P1 |
| FE-10 | Geolocation | Opcional — captura lat/long no apontamento | P2 |

---

## 3. MAPEAMENTO OBJETO GENEXUS → ARTEFATO REACT/NODE

| Objeto GeneXus | Node.js | React |
|----------------|---------|-------|
| Usuario (BC) | model Usuario, controller usuarios | Context (user), /dashboard |
| Apontamento (BC) | model Apontamento, controller apontamentos | /apontamento, formulário |
| Projeto (BC) | model Projeto, controller projetos | lista projetos no dashboard |
| ProjetoEtapa (BC) | model ProjetoEtapa | select etapas |
| ProjetoEtapaAtividade (BC) | model ProjetoEtapaAtividade | select atividades |
| Evento (BC) | model Evento | (backend: validações) |
| Mensagem (BC) | model Mensagem | (fase 2) |
| Device (BC) | model Device | (fase 2) |
| SdLogin | — | LoginPage |
| SdDashBoard | GET /dashboard | DashboardPage |
| SdApontamento | POST/PUT /apontamentos | ApontamentoPage |
| PrcValidaLoginUsuario | POST /auth/login | LoginPage submit |
| PrcGeraApontamento | POST /apontamentos, PUT /apontamentos/:id | ApontamentoPage submit |
| PrcGetSdtUsuarioHorasDia | GET /usuarios/:id/horas-dia | DashboardPage |
| PrcVerificaApontamentoAntigo | GET /usuarios/:id/apontamento-aberto | DashboardPage, ApontamentoPage |
| Domain Perfil | enum Perfil (TypeScript) | select perfil |
| Domain Situacao | enum Situacao | — |
| Domain Tipo | enum TipoApontamento | select tipo apontamento |
| Domain OrigemApontamento | enum OrigemApontamento | 'W' fixo (web) |

---

## 4. CHECKLIST TÉCNICO

### 4.1 Backend

- [ ] `npm init`, dependências: express, sequelize, pg ou sqlite3, jsonwebtoken, bcrypt, cors
- [ ] Estrutura: `src/models`, `src/controllers`, `src/routes`, `src/middleware`, `src/config`
- [ ] Script SQL: CREATE TABLE para todas as entidades
- [ ] Modelos com associations (belongsTo, hasMany)
- [ ] Middleware auth (verificar JWT)
- [ ] Validações: UsuarioObrigatorioProjeto, ProjetoComentarioObrigatorio, ProjetoAtividadeObrigatoria
- [ ] Cálculo ApontamentoHoras (Final - Inicio)
- [ ] VerificaApontamentoEmAberto: último apontamento do dia sem FinalDataHora

### 4.2 Frontend

- [ ] `npm create vite@latest` — React + TypeScript
- [ ] Dependências: react-router-dom, axios
- [ ] Estrutura: `src/pages`, `src/components`, `src/contexts`, `src/services`, `src/types`
- [ ] AuthContext com persistência (localStorage)
- [ ] Rotas protegidas (redirect /login se não autenticado)
- [ ] Formulário Login com validação
- [ ] Dashboard com cards: apontamento em aberto, projetos, horas do dia
- [ ] Formulário Apontamento: início/fim, projeto, atividade, tipo, comentário
- [ ] Tratamento de erros (mensagens)

### 4.3 Banco de Dados

- [ ] Tabelas: Usuario, Apontamento, Projeto, ProjetoEquipe, ProjetoAdministrador, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Device, RegistroAvisoLog
- [ ] FKs e índices
- [ ] Enum como CHECK ou tabela auxiliar (conforme SGBD)

---

## 5. RISCOS E MITIGAÇÕES

| Risco | Mitigação |
|-------|-----------|
| Incompatibilidade de tipos | Mapear GeneXus → JS: int→number, char→string, date→Date, boolean→boolean |
| Regras de negócio ocultas | Implementar RB-001 a RB-020 conforme ENGENHARIA_REVERSA |
| Senha hash | bcrypt com salt; não migrar senhas antigas sem confirmação |
| CORS | Habilitar cors() no Express para origem do React |
| Geolocation | Navigator.geolocation.getCurrentPosition no browser |

---

## 6. CRITÉRIOS DE ACEITE

1. **Login:** Usuário consegue fazer login com login/senha e recebe token JWT.
2. **Dashboard:** Exibe projetos do usuário, horas do dia e status de apontamento em aberto.
3. **Registrar entrada:** Cria apontamento com ApontamentoInicioDataHora, Situacao=Cadastrado, Origem=W.
4. **Registrar saída:** Atualiza apontamento com ApontamentoFinalDataHora e calcula ApontamentoHoras.
5. **Validações:** Projeto obrigatório, comentário obrigatório e atividade obrigatória quando configurado.
6. **KB original:** Permanece inalterado; refatoração em pasta separada.

---

## 7. ESTRUTURA DE PASTAS (REFATORADO)

```
refatorado_20250218/
├── backend/                 # Node.js
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── database/
│       └── schema.sql
├── frontend/                # React
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

*Documento gerado na Fase 2. Plano aprovado para execução na Fase 3.*
