# PLANO DE MIGRAÇÃO POR ONDAS (WAVES)
## GeneXus v2_14 → React + Node.js

**Agente:** Agente_03_Orquestrador_Migracao_GeneXus  
**Data:** 19/02/2025  
**Base:** ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md, fase_1_inventario_escopo.md, fase_2_plano_refatoracao.md, fase_3_execucao_refatoracao.md

---

## 1. VISÃO GERAL

O sistema **Registro de Horário** (KB v2_14) será migrado em ondas incrementais para a stack React + Node.js, garantindo rastreabilidade total com os artefatos GeneXus e minimizando riscos de produção.

### 1.1 Escopo do KB GeneXus

| Categoria | Quantidade | Evidência |
|-----------|------------|-----------|
| Business Components | 9 | Usuario, Apontamento, Projeto, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Device, RegistroAvisoLog |
| Níveis Transaccion | 2 | ProjetoEquipe, ProjetoAdministrador |
| Objetos UI | 3 | SdLogin, SdDashBoard, SdApontamento |
| Procedures | 9+ | PrcValidaLoginUsuario, PrcGeraApontamento, PrcGetSdtUsuarioHorasDia, etc. |
| Domínios/Enums | 11+ | Perfil, Situacao, Tipo, OrigemApontamento, EvTipo, Abrangencia, etc. |
| Regras de Negócio | 20 | RB-001 a RB-020 |

---

## 2. ONDAS DE MIGRAÇÃO

### WAVE 0 — Fundação Técnica

| Item | Objetivo | Dependências | Riscos |
|------|----------|--------------|--------|
| Projeto Node.js + React | Estrutura base, package.json, tsconfig | — | P2 |
| Schema BD | Tabelas compatíveis com dicionário GeneXus | — | P1 |
| Auth (GAM → JWT) | POST /auth/login, PrcValidaLoginUsuario equivalente | Usuario BC | P0 |
| Middleware auth | Proteção de rotas | JWT | P0 |

**Critérios de aceite:**
- Usuário consegue fazer login com login/senha e recebe token JWT
- Rotas protegidas redirecionam para /login se não autenticado
- Banco de dados com tabelas Usuario, Apontamento, Projeto, etc.

**Status:** ✅ Executado (fase_3)

---

### WAVE 1 — Core CRUD e Apontamento

| Item | Objetivo | Dependências | Riscos |
|------|----------|--------------|--------|
| Usuario BC | GET /usuarios/me, modelo Usuario | Auth | P1 |
| Apontamento BC | POST entrada, PUT saída, GET listagem | Usuario, Projeto | P0 |
| Projeto BC | GET /projetos, etapas e atividades | Empresa, CentroCusto | P0 |
| ProjetoEtapa / ProjetoEtapaAtividade | GET etapas/:id/atividades | Projeto | P1 |
| SdLogin → LoginPage | Formulário login/senha | Auth API | P0 |
| SdDashBoard → DashboardPage | Projetos, horas do dia, apontamento aberto | Apontamento, Projeto APIs | P0 |
| SdApontamento → ApontamentoPage | Registrar entrada/saída, projeto, atividade, comentário | Apontamento API | P0 |

**Regras implementadas:** RB-003, RB-007, RB-009, RB-010, RB-011, RB-012

**Critérios de aceite:**
- Dashboard exibe projetos, horas do dia e status de apontamento em aberto
- Registrar entrada cria Apontamento com Situacao=Cadastrado, Origem=W
- Registrar saída atualiza ApontamentoFinalDataHora e calcula ApontamentoHoras
- Validações: projeto obrigatório, comentário obrigatório, atividade obrigatória quando configurado

**Status:** ✅ Executado (fase_3)

---

### WAVE 2 — Cadastros e Entidades Suporte

| Item | Objetivo | Dependências | Riscos |
|------|----------|--------------|--------|
| Empresa | CRUD Empresa (inferida no GeneXus) | — | P1 |
| CentroCusto | CRUD CentroCusto (inferida no GeneXus) | Empresa | P1 |
| Equipe | CRUD Equipe (inferida em Usuario) | Empresa | P1 |
| Evento BC | GET /eventos (feriados, férias, atestados) | Empresa, Usuario | P1 |
| Mensagem BC | GET /mensagens, PrcQntMensagem | Usuario | P2 |
| CadastroPage | Cadastro de usuários, projetos, empresas | Usuario, Projeto, Empresa APIs | P1 |

**Critérios de aceite:**
- Eventos filtrados por período e abrangência (Sistema, Empresa, Usuario)
- Mensagens com contagem por usuário
- Cadastro unificado de entidades mestres

**Status:** ✅ Parcialmente executado (Empresa, CentroCusto, Equipe, Evento, Mensagem implementados)

---

### WAVE 3 — Reembolso, Relatórios e Notificações

| Item | Objetivo | Dependências | Riscos |
|------|----------|--------------|--------|
| Reembolso / TipoReembolso | CRUD (TableAccess no GeneXus, sem JSON completo) | Usuario, Projeto | P1 |
| Device BC | POST /devices (NotificationsRegistrationHandler) | UsuarioDevice | P2 |
| RegistroAvisoLog | Log de avisos (VerificaSeAvisaUsuarioApontamento) | Usuario, RotinaSemanal | P2 |
| Relatórios | Horas profissional, colaborador, fechamento | Apontamento, Reembolso | P1 |
| Notificações | Cadastro, alertas, vínculos usuário | Device, TipoAlerta | P2 |
| Rotinas batch | RotinaSemanal, RotinaMensal, RotinaCalcHoras* | Apontamento, Evento | P1 |

**Critérios de aceite:**
- Reembolso com fluxo de aprovação equivalente
- Device vinculado a usuário para push
- Relatórios exportáveis (Excel)
- Notificações configuráveis por empresa/usuário

**Status:** ✅ Parcialmente executado (Reembolso, Relatórios, Notificações implementados; Rotinas batch pendentes)

---

### WAVE 4 — Mobile/Offline (Futuro)

| Item | Objetivo | Dependências | Riscos |
|------|----------|--------------|--------|
| Synchronizer / Offline | Modo offline GeneXus | Apontamento, Device | P1 |
| Geolocation | ApontamentoInicioGeolocation, ApontamentoFimGeolocation | Apontamento | P2 |
| Push notifications | Device.DeviceToken, notificações | Device, serviço externo | P2 |

**Status:** 🔲 Fora do escopo inicial (fase_2)

---

## 3. DEPENDÊNCIAS ENTRE ONDAS

```
WAVE 0 (Fundação)
    │
    ├── Auth, BD, Estrutura
    │
    ▼
WAVE 1 (Core)
    │
    ├── Usuario, Apontamento, Projeto
    ├── Login, Dashboard, Apontamento UI
    │
    ▼
WAVE 2 (Cadastros)
    │
    ├── Empresa, CentroCusto, Equipe, Evento, Mensagem
    ├── CadastroPage
    │
    ▼
WAVE 3 (Extensões)
    │
    ├── Reembolso, Device, Relatórios, Notificações
    ├── Rotinas batch
    │
    ▼
WAVE 4 (Mobile/Offline)
    │
    └── Offline, Geolocation, Push
```

---

## 4. MATRIZ DE RISCOS

| Risco | Onda | Severidade | Mitigação |
|-------|------|------------|-----------|
| SGBD desconhecido no GeneXus | 0 | P1 | Usar SQLite/PostgreSQL; schema compatível |
| Lógica de Procedures não exposta | 1 | P0 | Inferir a partir de TableAccess XML e parâmetros |
| UsuarioDevice sem modelo | 3 | P2 | Criar tabela Usuario_Device |
| Hash senha incompatível | 0 | P0 | bcrypt em Node; migrar ou resetar senhas |
| ProjetoEquipe/ProjetoAdministrador | 1 | P1 | Filtro de projetos por usuário; implementar vínculos |
| Rotinas batch complexas | 3 | P1 | Documentar lógica; implementar jobs Node.js |
| Offline não replicado | 4 | P2 | PWA/Service Worker em fase futura |

---

## 5. ESTRATÉGIA DE RELEASES

| Release | Ondas | Entregáveis | Critério de Go-Live |
|---------|-------|-------------|---------------------|
| R1 | 0 + 1 | Login, Dashboard, Apontamento (entrada/saída) | Fluxo principal de ponto operacional |
| R2 | 2 | Cadastros, Eventos, Mensagens | Gestão de entidades mestres |
| R3 | 3 | Reembolso, Relatórios, Notificações | Módulos administrativos |
| R4 | 4 | Offline, Geolocation, Push | Paridade mobile (opcional) |

---

## 6. INCERTEZAS E PENDÊNCIAS

| # | Incerteza | Impacto |
|---|-----------|---------|
| 1 | Banco de dados em produção (SGBD) | Migração de dados |
| 2 | Estrutura completa Empresa/CentroCusto no GeneXus | Validação de mapeamento |
| 3 | Lógica exata RotinaSemanal, RotinaMensal | Avisos de apontamento |
| 4 | GAM vs JWT (EnableIntegratedSecurity) | Autenticação |
| 5 | Reembolso/TipoReembolso (TableAccess sem JSON) | Validação de modelo |

---

*Documento gerado pelo Agente 03. Plano operacional para governança da migração.*
