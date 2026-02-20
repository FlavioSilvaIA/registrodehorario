# BACKLOG DE MIGRAÇÃO GENEXUS
## Itens MIG-XXX — Formato Obrigatório

**Agente:** Agente_03_Orquestrador_Migracao_GeneXus  
**Data:** 19/02/2025  
**Base:** ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md, fase_1_inventario_escopo.md

---

## LEGENDA

| Campo | Descrição |
|-------|-----------|
| **ID** | MIG-XXX (identificador único) |
| **Origem GeneXus** | Objetos e evidência (gxmetadata, TableAccess) |
| **Dados** | Transactions/BC/Levels envolvidos |
| **Regras** | RB-xxx e Domains impactados |
| **API** | Endpoints REST |
| **UI** | React page / rota |
| **DoD** | Definition of Done |
| **Risco** | P0 (crítico) / P1 (alto) / P2 (médio) |
| **Estimativa** | S (pequeno) / M (médio) / L (grande) |

---

## WAVE 0 — FUNDAÇÃO

### MIG-001 — Autenticação (Login)

| Campo | Conteúdo |
|-------|----------|
| **Título** | Autenticação JWT equivalente a PrcValidaLoginUsuario |
| **Descrição** | Migrar fluxo de login com validação de credenciais e emissão de token JWT |
| **Origem GeneXus** | SdLogin, PrcValidaLoginUsuario (registrohorario.gxapp.json) |
| **Dados** | Usuario (UsuarioLogin, UsuarioSenha) |
| **Regras** | RB-001 (login único), RB-002 (email válido) |
| **API** | POST /api/auth/login |
| **UI** | LoginPage (/login) |
| **Dependências** | — |
| **Critérios de aceite** | Given credenciais válidas When POST /auth/login Then retorna token JWT e dados do usuário |
| **DoD** | Token JWT, middleware auth, rotas protegidas |
| **Risco** | P0 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

### MIG-002 — Schema e Modelos de Dados

| Campo | Conteúdo |
|-------|----------|
| **Título** | Schema BD e modelos Sequelize |
| **Descrição** | Criar tabelas e modelos equivalentes ao dicionário de dados GeneXus |
| **Origem GeneXus** | gxmetadata/*.json (Usuario, Apontamento, Projeto, etc.) |
| **Dados** | Usuario, Apontamento, Projeto, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Device, RegistroAvisoLog, ProjetoEquipe, ProjetoAdministrador |
| **Regras** | Domains (tipos, enums) |
| **API** | — |
| **UI** | — |
| **Dependências** | — |
| **Critérios de aceite** | Tabelas criadas com FKs e tipos compatíveis |
| **DoD** | Migrations/seed executáveis |
| **Risco** | P0 |
| **Estimativa** | M |
| **Status** | ✅ Coberto |

---

## WAVE 1 — CORE APONTAMENTO

### MIG-003 — Registrar Entrada (Início de Apontamento)

| Campo | Conteúdo |
|-------|----------|
| **Título** | Registrar entrada de apontamento |
| **Descrição** | Criar apontamento com ApontamentoInicioDataHora, validar apontamento em aberto |
| **Origem GeneXus** | SdApontamento, RegistrarApontamento (TableAccess), VerificaApontamentoEmAberto |
| **Dados** | Apontamento, Usuario, Projeto, ProjetoEtapaAtividade, Evento |
| **Regras** | RB-003, RB-007, RB-008, RB-009, RB-010, RB-011, RB-012 |
| **API** | POST /api/apontamentos/entrada, GET /api/apontamentos/aberto |
| **UI** | ApontamentoPage (/apontamento) |
| **Dependências** | MIG-001, MIG-002 |
| **Critérios de aceite** | Given sem apontamento em aberto When registrar entrada Then cria Apontamento com Situacao=Cadastrado, Origem=W; Given apontamento em aberto When tentar entrada Then impede |
| **DoD** | Validações projeto/comentário/atividade obrigatórios implementadas |
| **Risco** | P0 |
| **Estimativa** | M |
| **Status** | ✅ Coberto |

---

### MIG-004 — Registrar Saída (Fim de Apontamento)

| Campo | Conteúdo |
|-------|----------|
| **Título** | Registrar saída de apontamento |
| **Descrição** | Atualizar apontamento com ApontamentoFinalDataHora e calcular ApontamentoHoras |
| **Origem GeneXus** | SdApontamento, RegistrarApontamento (TableAccess) |
| **Dados** | Apontamento |
| **Regras** | RB-005 (Situacao) |
| **API** | PUT /api/apontamentos/:id/saida |
| **UI** | ApontamentoPage (/apontamento) |
| **Dependências** | MIG-003 |
| **Critérios de aceite** | Given apontamento em aberto When registrar saída Then atualiza FinalDataHora e calcula Horas |
| **DoD** | Cálculo ApontamentoHoras (Final - Inicio) |
| **Risco** | P0 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

### MIG-005 — Dashboard (Horas e Projetos)

| Campo | Conteúdo |
|-------|----------|
| **Título** | Dashboard com projetos e horas do dia |
| **Descrição** | Exibir projetos do usuário, horas do dia e status de apontamento em aberto |
| **Origem GeneXus** | SdDashBoard, PrcGetSdtUsuarioHorasDia, PrcVerificaApontamentoAntigo |
| **Dados** | Projeto, Apontamento, SdtUsuarioHorasDia |
| **Regras** | — |
| **API** | GET /api/apontamentos/horas-dia, GET /api/apontamentos/aberto, GET /api/projetos |
| **UI** | DashboardPage (/) |
| **Dependências** | MIG-001, MIG-002 |
| **Critérios de aceite** | Given logado When acessar dashboard Then exibe projetos, horas do dia e apontamento aberto |
| **DoD** | Cards de horas, apontamento aberto, lista de projetos |
| **Risco** | P0 |
| **Estimativa** | M |
| **Status** | ✅ Coberto |

---

### MIG-006 — Listagem de Apontamentos

| Campo | Conteúdo |
|-------|----------|
| **Título** | Listar apontamentos do usuário |
| **Descrição** | Grid/listagem de apontamentos com filtros |
| **Origem GeneXus** | WorkWith Apontamento (inferido), SdApontamento lista |
| **Dados** | Apontamento |
| **Regras** | RB-005, RB-006 |
| **API** | GET /api/apontamentos, GET /api/apontamentos/resumo |
| **UI** | ListaApontamentoPage (/lista-apontamento) |
| **Dependências** | MIG-003 |
| **Critérios de aceite** | Given logado When listar apontamentos Then exibe com data, projeto, horas, situação |
| **DoD** | Listagem com resumo e filtros |
| **Risco** | P1 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

### MIG-007 — CRUD Projeto

| Campo | Conteúdo |
|-------|----------|
| **Título** | Gerenciar projetos (etapas e atividades) |
| **Descrição** | CRUD de Projeto com níveis ProjetoEquipe, ProjetoAdministrador, ProjetoEtapa, ProjetoEtapaAtividade |
| **Origem GeneXus** | Projeto BC, ProjetoEtapa, ProjetoEtapaAtividade (gxmetadata) |
| **Dados** | Projeto, ProjetoEquipe, ProjetoAdministrador, ProjetoEtapa, ProjetoEtapaAtividade |
| **Regras** | RB-009, RB-010, RB-016, RB-017 |
| **API** | GET/POST/PUT/DELETE /api/projetos, GET /api/projetos/:id/etapas, GET /api/projetos/etapas/:etapaId/atividades |
| **UI** | CadastroPage (/cadastro) — seção projetos |
| **Dependências** | MIG-002, Empresa, CentroCusto |
| **Critérios de aceite** | CRUD completo com etapas e atividades |
| **DoD** | Projeto com ComentarioObrigatorio, AtividadeObrigatoria |
| **Risco** | P0 |
| **Estimativa** | L |
| **Status** | ✅ Coberto |

---

## WAVE 2 — CADASTROS

### MIG-008 — Usuario (Perfil e Cadastro)

| Campo | Conteúdo |
|-------|----------|
| **Título** | CRUD Usuario e perfil |
| **Descrição** | GET /usuarios/me, CRUD usuários com perfis e configurações |
| **Origem GeneXus** | Usuario BC (gxmetadata/usuario.json) |
| **Dados** | Usuario |
| **Regras** | RB-001, RB-002, RB-011, RB-012, RB-013 |
| **API** | GET /api/usuarios/me, GET/POST/PUT/DELETE /api/usuarios |
| **UI** | CadastroPage (/cadastro) — seção usuários |
| **Dependências** | MIG-001, Empresa, Equipe |
| **Critérios de aceite** | Perfis AdminGX2, AdminEmpresa, Coordenador, Colaborador, GestãoProjetos |
| **DoD** | UsuarioObrigatorioComentario, UsuarioObrigatorioProjeto configuráveis |
| **Risco** | P1 |
| **Estimativa** | M |
| **Status** | ✅ Coberto |

---

### MIG-009 — Empresa

| Campo | Conteúdo |
|-------|----------|
| **Título** | CRUD Empresa |
| **Descrição** | Entidade Empresa inferida (referenciada em Usuario, Projeto, Evento) |
| **Origem GeneXus** | Empresa (inferida, sem JSON próprio) |
| **Dados** | Empresa |
| **Regras** | — |
| **API** | GET/POST/PUT/DELETE /api/empresas |
| **UI** | CadastroPage (/cadastro) |
| **Dependências** | MIG-002 |
| **Critérios de aceite** | CRUD Empresa para multi-tenant |
| **DoD** | Empresa vinculada a Usuario e Projeto |
| **Risco** | P1 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

### MIG-010 — CentroCusto

| Campo | Conteúdo |
|-------|----------|
| **Título** | CRUD CentroCusto |
| **Descrição** | Entidade CentroCusto inferida (referenciada em Projeto) |
| **Origem GeneXus** | CentroCusto (inferida, sem JSON próprio) |
| **Dados** | CentroCusto |
| **Regras** | — |
| **API** | GET/POST/PUT/DELETE /api/centros-custo |
| **UI** | CadastroPage (/cadastro) |
| **Dependências** | Empresa |
| **Critérios de aceite** | CRUD CentroCusto vinculado a Projeto |
| **DoD** | CentroCustoId em Projeto |
| **Risco** | P1 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

### MIG-011 — Equipe

| Campo | Conteúdo |
|-------|----------|
| **Título** | CRUD Equipe |
| **Descrição** | Entidade Equipe inferida (EquipeId em Usuario) |
| **Origem GeneXus** | Equipe (inferida em Usuario) |
| **Dados** | Equipe |
| **Regras** | — |
| **API** | GET/POST/PUT/DELETE /api/equipes |
| **UI** | CadastroPage (/cadastro) |
| **Dependências** | Empresa |
| **Critérios de aceite** | CRUD Equipe vinculada a Usuario |
| **DoD** | EquipeId em Usuario |
| **Risco** | P1 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

### MIG-012 — Evento (Feriados, Férias, Atestados)

| Campo | Conteúdo |
|-------|----------|
| **Título** | CRUD Evento |
| **Descrição** | Eventos com tipos Feriado, Férias, Atestado, abrangência Sistema/Empresa/Usuario |
| **Origem GeneXus** | Evento BC (gxmetadata/evento.json) |
| **Dados** | Evento |
| **Regras** | RB-014, RB-015 |
| **API** | GET/POST/PUT/DELETE /api/eventos |
| **UI** | CadastroPage ou tela dedicada |
| **Dependências** | Empresa, Usuario |
| **Critérios de aceite** | EventoTipo, EventoAbrangencia, EventoDiaInteiro |
| **DoD** | Eventos usados em validações de apontamento |
| **Risco** | P1 |
| **Estimativa** | M |
| **Status** | ✅ Coberto |

---

### MIG-013 — Mensagem

| Campo | Conteúdo |
|-------|----------|
| **Título** | Mensagens internas |
| **Descrição** | Mensagens com envio por e-mail (PrcQntMensagem) |
| **Origem GeneXus** | Mensagem BC (gxmetadata/mensagem.json) |
| **Dados** | Mensagem |
| **Regras** | SituacaoMensagem (E/P) |
| **API** | GET /api/mensagens (contagem), CRUD se aplicável |
| **UI** | NotificacaoPage ou componente |
| **Dependências** | Usuario |
| **Critérios de aceite** | Contagem de mensagens por usuário |
| **DoD** | PrcQntMensagem equivalente |
| **Risco** | P2 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

## WAVE 3 — EXTENSÕES

### MIG-014 — Reembolso e TipoReembolso

| Campo | Conteúdo |
|-------|----------|
| **Título** | CRUD Reembolso |
| **Descrição** | Reembolso e TipoReembolso (TableAccess no GeneXus, sem JSON completo) |
| **Origem GeneXus** | TableAccess Reembolso, ReembolsoEmail, TipoReembolso |
| **Dados** | Reembolso, TipoReembolso |
| **Regras** | A definir (estrutura incompleta) |
| **API** | GET/POST/PUT/DELETE /api/reembolsos, /api/tipo-reembolso |
| **UI** | ReembolsoPage (/reembolso), TipoReembolsoPage (/tipo-reembolso) |
| **Dependências** | Usuario, Projeto |
| **Critérios de aceite** | Fluxo de solicitação e aprovação de reembolso |
| **DoD** | Validação com negócio (estrutura) |
| **Risco** | P1 |
| **Estimativa** | L |
| **Status** | ✅ Coberto |

---

### MIG-015 — Device e Notificações Push

| Campo | Conteúdo |
|-------|----------|
| **Título** | Device e NotificationsRegistrationHandler |
| **Descrição** | Registro de dispositivos para push (UsuarioDevice) |
| **Origem GeneXus** | Device BC, PrcUserDeviceId, PrcDesvincularUsuarioDevice, NotificationsRegistrationHandler |
| **Dados** | Device, UsuarioDevice |
| **Regras** | SmartDeviceType (iOS, Android) |
| **API** | POST /api/notificacao/devices, GET/POST/DELETE vinculos |
| **UI** | NotificacaoPage (/notificacao) |
| **Dependências** | Usuario |
| **Critérios de aceite** | Vincular/desvincular device a usuário |
| **DoD** | DeviceToken para push |
| **Risco** | P2 |
| **Estimativa** | M |
| **Status** | ✅ Coberto |

---

### MIG-016 — RegistroAvisoLog e Avisos

| Campo | Conteúdo |
|-------|----------|
| **Título** | Log de avisos de apontamento |
| **Descrição** | VerificaSeAvisaUsuarioApontamento, RotinaSemanal |
| **Origem GeneXus** | RegistroAvisoLog BC, VerificaSeAvisaUsuarioApontamento (TableAccess) |
| **Dados** | RegistroAvisoLog, Usuario (UsuarioAvisosAtivo) |
| **Regras** | RB-020 |
| **API** | Endpoint de avisos (job ou trigger) |
| **UI** | NotificacaoPage |
| **Dependências** | Usuario, Device |
| **Critérios de aceite** | Aviso quando usuário não registrou ponto |
| **DoD** | Rotina batch ou job equivalente |
| **Risco** | P2 |
| **Estimativa** | L |
| **Status** | ⚠️ Parcial (estrutura; rotina batch pendente) |

---

### MIG-017 — Relatórios

| Campo | Conteúdo |
|-------|----------|
| **Título** | Relatórios de horas e fechamento |
| **Descrição** | Relatórios: horas por profissional, colaborador, fechamento reembolso |
| **Origem GeneXus** | Data Providers / Procedures de relatório (inferido) |
| **Dados** | Apontamento, Usuario, Projeto, Reembolso |
| **Regras** | — |
| **API** | GET /api/relatorios/horas-profissional, /colaborador, /fechamento-reembolso, etc. |
| **UI** | RelatorioPage (/relatorio) |
| **Dependências** | Apontamento, Reembolso |
| **Critérios de aceite** | Exportação Excel, filtros por período |
| **DoD** | Relatórios operacionais |
| **Risco** | P1 |
| **Estimativa** | L |
| **Status** | ✅ Coberto |

---

### MIG-018 — Parâmetros e Admin

| Campo | Conteúdo |
|-------|----------|
| **Título** | Parâmetros do sistema e admin |
| **Descrição** | Configurações globais, stats admin |
| **Origem GeneXus** | Parametros (inferido), rotinas admin |
| **Dados** | Parametro |
| **Regras** | — |
| **API** | GET/POST /api/parametros, GET /api/admin/stats |
| **UI** | ParametrosPage (/parametros) |
| **Dependências** | Auth (perfil Admin) |
| **Critérios de aceite** | Configurações editáveis por admin |
| **DoD** | Parâmetros persistentes |
| **Risco** | P2 |
| **Estimativa** | S |
| **Status** | ✅ Coberto |

---

## WAVE 4 — MOBILE/OFFLINE (FUTURO)

### MIG-019 — Geolocation no Apontamento

| Campo | Conteúdo |
|-------|----------|
| **Título** | Geolocalização no registro de ponto |
| **Descrição** | ApontamentoInicioGeolocation, ApontamentoFimGeolocation |
| **Origem GeneXus** | Apontamento BC, Domain GeneXus.Geolocation (regex lat,long) |
| **Dados** | Apontamento |
| **Regras** | RB-008 |
| **API** | POST /apontamentos/entrada com geolocation |
| **UI** | ApontamentoPage (navigator.geolocation) |
| **Dependências** | MIG-003 |
| **Critérios de aceite** | Captura lat/long no browser ou mobile |
| **DoD** | Campos preenchidos opcionalmente |
| **Risco** | P2 |
| **Estimativa** | S |
| **Status** | 🔲 Não implementado |

---

### MIG-020 — Modo Offline

| Campo | Conteúdo |
|-------|----------|
| **Título** | Sincronização offline |
| **Descrição** | Modo offline GeneXus (Synchronizer) |
| **Origem GeneXus** | Connectivity Online + Offline (ENGENHARIA_REVERSA) |
| **Dados** | Apontamento (cache local) |
| **Regras** | — |
| **API** | Sync endpoint |
| **UI** | PWA / Service Worker |
| **Dependências** | MIG-003, MIG-004 |
| **Critérios de aceite** | Registrar ponto offline e sincronizar depois |
| **DoD** | Cache + conflitos resolvidos |
| **Risco** | P1 |
| **Estimativa** | L |
| **Status** | 🔲 Fora do escopo inicial |

---

## RESUMO DO BACKLOG

| Wave | Itens | Cobertos | Parciais | Pendentes |
|------|-------|----------|----------|-----------|
| 0 | 2 | 2 | 0 | 0 |
| 1 | 5 | 5 | 0 | 0 |
| 2 | 6 | 6 | 0 | 0 |
| 3 | 5 | 4 | 1 | 0 |
| 4 | 2 | 0 | 0 | 2 |
| **Total** | **20** | **17** | **1** | **2** |

---

*Documento gerado pelo Agente 03. Cada MIG-XXX possui rastreabilidade com GeneXus.*
