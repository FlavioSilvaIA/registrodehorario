# MATRIZ DE RASTREABILIDADE DE MIGRAÇÃO
## GeneXus v2_14 → React + Node.js

**Agente:** Agente_03_Orquestrador_Migracao_GeneXus  
**Data:** 19/02/2025  
**Base:** ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md, backlog_migracao_genexus.md

---

## LEGENDA DE STATUS

| Status | Significado |
|-------|-------------|
| ✅ Coberto | Implementado com equivalência funcional |
| ⚠️ Parcial | Implementado com gaps ou simplificações |
| 🔲 Não Coberto | Não implementado |
| ➕ Extra | Existe no refatorado sem origem GeneXus explícita |

---

## MATRIZ PRINCIPAL

| Objeto GeneXus | Tipo | Feature MIG | API | UI | Regras RB | Status |
|----------------|------|-------------|-----|-----|-----------|--------|
| **SdLogin** | SD | MIG-001 | POST /api/auth/login | LoginPage (/login) | RB-001, RB-002 | ✅ Coberto |
| **PrcValidaLoginUsuario** | Procedure | MIG-001 | POST /api/auth/login | — | RB-001, RB-002 | ✅ Coberto |
| **Usuario** | BC | MIG-002, MIG-008 | GET /api/usuarios/me, CRUD /api/usuarios | CadastroPage | RB-001 a RB-013 | ✅ Coberto |
| **Apontamento** | BC | MIG-002, MIG-003, MIG-004, MIG-006 | POST /api/apontamentos/entrada, PUT /:id/saida, GET /api/apontamentos | ApontamentoPage, ListaApontamentoPage | RB-003 a RB-008 | ✅ Coberto |
| **Projeto** | BC | MIG-002, MIG-007 | GET/POST/PUT/DELETE /api/projetos | CadastroPage, DashboardPage | RB-009, RB-010, RB-016, RB-017 | ✅ Coberto |
| **ProjetoEtapa** | BC | MIG-007 | GET /api/projetos/:id/etapas | CadastroPage | — | ✅ Coberto |
| **ProjetoEtapaAtividade** | BC | MIG-007 | GET /api/projetos/etapas/:etapaId/atividades | CadastroPage, ApontamentoPage | RB-010 | ✅ Coberto |
| **ProjetoEquipe** | Level | MIG-007 | Incluso em Projeto | CadastroPage | — | ⚠️ Parcial |
| **ProjetoAdministrador** | Level | MIG-007 | GET /api/notificacao/administradores | NotificacaoPage | — | ✅ Coberto |
| **SdDashBoard** | SD | MIG-005 | GET /api/apontamentos/horas-dia, /aberto, /api/projetos | DashboardPage (/) | — | ✅ Coberto |
| **SdApontamento** | SD | MIG-003, MIG-004, MIG-006 | POST entrada, PUT saida, GET apontamentos | ApontamentoPage, ListaApontamentoPage | RB-003 a RB-012 | ✅ Coberto |
| **RegistrarApontamento** | TableAccess | MIG-003, MIG-004 | POST /api/apontamentos/entrada, PUT /:id/saida | ApontamentoPage | RB-009 a RB-012 | ✅ Coberto |
| **VerificaApontamentoEmAberto** | TableAccess | MIG-003 | GET /api/apontamentos/aberto | DashboardPage, ApontamentoPage | — | ✅ Coberto |
| **PrcGetSdtUsuarioHorasDia** | Procedure | MIG-005 | GET /api/apontamentos/horas-dia | DashboardPage | — | ✅ Coberto |
| **PrcVerificaApontamentoAntigo** | Procedure | MIG-003 | GET /api/apontamentos/aberto | DashboardPage | — | ✅ Coberto |
| **Evento** | BC | MIG-012 | GET/POST/PUT/DELETE /api/eventos | CadastroPage | RB-014, RB-015 | ✅ Coberto |
| **Mensagem** | BC | MIG-013 | GET /api/mensagens | NotificacaoPage | SituacaoMensagem | ✅ Coberto |
| **Device** | BC | MIG-015 | POST /api/notificacao/devices | NotificacaoPage | SmartDeviceType | ✅ Coberto |
| **RegistroAvisoLog** | BC | MIG-016 | — | — | RB-020 | ⚠️ Parcial |
| **VerificaSeAvisaUsuarioApontamento** | TableAccess | MIG-016 | — | NotificacaoPage | RB-020 | ⚠️ Parcial |
| **Empresa** | Inferida | MIG-009 | GET/POST/PUT/DELETE /api/empresas | CadastroPage | — | ✅ Coberto |
| **CentroCusto** | Inferida | MIG-010 | GET/POST/PUT/DELETE /api/centros-custo | CadastroPage | — | ✅ Coberto |
| **Equipe** | Inferida | MIG-011 | GET/POST/PUT/DELETE /api/equipes | CadastroPage | — | ✅ Coberto |
| **Reembolso** | TableAccess | MIG-014 | GET/POST/PUT/DELETE /api/reembolsos | ReembolsoPage | — | ✅ Coberto |
| **TipoReembolso** | TableAccess | MIG-014 | — | TipoReembolsoPage | — | ✅ Coberto |
| **PrcUserDeviceId** | Procedure | MIG-015 | POST /api/notificacao/vinculos | NotificacaoPage | — | ✅ Coberto |
| **PrcDesvincularUsuarioDevice** | Procedure | MIG-015 | DELETE /api/notificacao/vinculos/:id | NotificacaoPage | — | ✅ Coberto |
| **NotificationsRegistrationHandler** | Procedure | MIG-015 | POST /api/notificacao/devices | NotificacaoPage | — | ✅ Coberto |
| **PrcQntMensagem** | Procedure | MIG-013 | GET /api/mensagens | — | — | ✅ Coberto |
| **Domain Perfil** | Domain | MIG-008 | enum em types | CadastroPage | RB-013 | ✅ Coberto |
| **Domain Situacao** | Domain | MIG-004 | enum Situacao | — | RB-005 | ✅ Coberto |
| **Domain Tipo** | Domain | MIG-003 | enum TipoApontamento | ApontamentoPage | RB-006 | ✅ Coberto |
| **Domain OrigemApontamento** | Domain | MIG-003 | 'W' fixo (Web) | — | RB-007 | ✅ Coberto |
| **Domain EvTipo** | Domain | MIG-012 | enum EvTipo | CadastroPage | RB-015 | ✅ Coberto |
| **Domain Abrangencia** | Domain | MIG-012 | enum Abrangencia | CadastroPage | RB-014 | ✅ Coberto |
| **Domain DMStatusProjeto** | Domain | MIG-007 | enum | CadastroPage | RB-016 | ✅ Coberto |
| **Domain DMTipo** | Domain | MIG-007 | enum | CadastroPage | RB-017 | ✅ Coberto |
| **Domain GeneXus.Geolocation** | Domain | MIG-019 | — | — | RB-008 | 🔲 Não Coberto |
| **Geolocation (App)** | App | MIG-019 | — | — | RB-008 | 🔲 Não Coberto |
| **RotinaSemanal** | Rotina | MIG-016 | — | — | RB-020 | 🔲 Não Coberto |
| **Synchronizer/Offline** | Integração | MIG-020 | — | — | — | 🔲 Não Coberto |

---

## MATRIZ POR MÓDULO

### Módulo Autenticação

| GeneXus | Feature MIG | API | UI | Status |
|---------|-------------|-----|-----|--------|
| SdLogin | MIG-001 | POST /auth/login | LoginPage | ✅ |
| PrcValidaLoginUsuario | MIG-001 | POST /auth/login | — | ✅ |
| GAM (EnableIntegratedSecurity) | MIG-001 | JWT middleware | AuthContext | ✅ |

### Módulo Apontamento

| GeneXus | Feature MIG | API | UI | Status |
|---------|-------------|-----|-----|--------|
| SdApontamento | MIG-003, MIG-004, MIG-006 | POST entrada, PUT saida, GET | ApontamentoPage, ListaApontamentoPage | ✅ |
| RegistrarApontamento | MIG-003, MIG-004 | POST, PUT | ApontamentoPage | ✅ |
| VerificaApontamentoEmAberto | MIG-003 | GET /aberto | DashboardPage | ✅ |
| PrcGetSdtUsuarioHorasDia | MIG-005 | GET /horas-dia | DashboardPage | ✅ |

### Módulo Cadastros

| GeneXus | Feature MIG | API | UI | Status |
|---------|-------------|-----|-----|--------|
| Usuario | MIG-008 | /api/usuarios | CadastroPage | ✅ |
| Projeto | MIG-007 | /api/projetos | CadastroPage | ✅ |
| Empresa | MIG-009 | /api/empresas | CadastroPage | ✅ |
| CentroCusto | MIG-010 | /api/centros-custo | CadastroPage | ✅ |
| Equipe | MIG-011 | /api/equipes | CadastroPage | ✅ |
| Evento | MIG-012 | /api/eventos | CadastroPage | ✅ |

### Módulo Notificações e Extensões

| GeneXus | Feature MIG | API | UI | Status |
|---------|-------------|-----|-----|--------|
| Mensagem | MIG-013 | /api/mensagens | NotificacaoPage | ✅ |
| Device | MIG-015 | /api/notificacao/devices | NotificacaoPage | ✅ |
| RegistroAvisoLog | MIG-016 | — | — | ⚠️ Parcial |
| Reembolso | MIG-014 | /api/reembolsos | ReembolsoPage | ✅ |
| TipoReembolso | MIG-014 | — | TipoReembolsoPage | ✅ |

### Módulo Relatórios

| GeneXus | Feature MIG | API | UI | Status |
|---------|-------------|-----|-----|--------|
| Data Providers relatório | MIG-017 | /api/relatorios/* | RelatorioPage | ✅ |

---

## ITENS EXTRA (Refatorado sem origem GeneXus explícita)

| Componente Refatorado | Descrição | Possível Origem |
|----------------------|-----------|-----------------|
| ParametrosPage | Parâmetros do sistema | Parametros (inferido) |
| RelatorioPage | Múltiplos relatórios | Data Providers (inferido) |
| admin/stats | Estatísticas admin | Rotinas admin (inferido) |
| POST /apontamentos/manual | Registro manual | RegistrarApontamento (variação) |
| POST /apontamentos/importar | Importação em lote | — | ➕ Extra |
| tipo_alerta, notificacao | Sistema de alertas | VerificaSeAvisaUsuarioApontamento (extensão) |
| usuario_projeto | Vínculo usuário-projeto com valor | ProjetoEquipe (extensão) |

---

## RASTREABILIDADE INVERSA (UI → GeneXus)

| Rota/Page | Objeto GeneXus | Status |
|-----------|----------------|--------|
| /login | SdLogin | ✅ |
| / | SdDashBoard | ✅ |
| /apontamento | SdApontamento | ✅ |
| /lista-apontamento | WorkWith Apontamento | ✅ |
| /cadastro | Usuario, Projeto, Empresa, CentroCusto, Equipe, Evento | ✅ |
| /reembolso | Reembolso | ✅ |
| /tipo-reembolso | TipoReembolso | ✅ |
| /notificacao | Mensagem, Device, Notificações | ✅ |
| /parametros | Parametros (inferido) | ✅ |
| /relatorio | Data Providers relatório | ✅ |

---

*Documento gerado pelo Agente 03. Toda feature possui rastreabilidade bidirecional.*
