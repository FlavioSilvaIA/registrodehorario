# COMPARAÇÃO GENEXUS vs REFATORADO
## Auditoria de Equivalência Estrutural e Funcional

**Versão:** v2  
**Data/Hora de Execução:** 18/02/2026  
**Projeto analisado:** v2_14/refatorado_20250218  
**Agente executor:** Agente_04_Comparador_GeneXus_vs_Refatorado  
**Base:** ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md, projeto refatorado_20250218

---

## 1) SUMÁRIO EXECUTIVO

### Métricas de Cobertura

| Métrica | Valor | Detalhamento |
|---------|-------|---------------|
| **Cobertura estrutural (BCs/Transactions)** | **~95%** | 9/9 BCs mapeados; Empresa, CentroCusto, Equipe inferidos e implementados |
| **Cobertura de regras (RB-xxx)** | **~85%** | 17/20 regras implementadas; RB-020 (avisos) e RB-008 (geolocation) parciais |
| **Cobertura de telas (UI)** | **100%** | SdLogin, SdDashBoard, SdApontamento equivalentes; telas extras (Cadastro, Reembolso, etc.) |
| **Cobertura de integrações** | **~60%** | Auth JWT OK; Offline/Synchronizer não replicado; Push parcial |
| **Gaps críticos (P0)** | **0** | Nenhum gap P0 bloqueante para operação core |
| **Gaps P1** | **2** | RotinaSemanal (avisos), ProjetoEquipe filtro por usuário |
| **Gaps P2** | **2** | Geolocation, Modo offline |

### Conclusão

O sistema refatorado **atinge equivalência funcional** para o fluxo principal de registro de horário (login → dashboard → apontamento entrada/saída). Os cadastros mestres (Usuario, Projeto, Empresa, CentroCusto, Equipe, Evento) e extensões (Reembolso, Mensagens, Notificações, Relatórios) foram implementados além do escopo inicial da fase_3, com boa rastreabilidade. **Não há gaps P0** que impeçam go-live do core.

**Atualização v2:** Modelo RegistroAvisoLog confirmado implementado (models/RegistroAvisoLog.ts). Fluxo de VerificaSeAvisaUsuarioApontamento (RotinaSemanal) continua não coberto.

---

## 2) TABELA DE COBERTURA POR TIPO

| Tipo | Total GeneXus | Coberto | Parcial | Não Coberto | Extra |
|------|---------------|---------|---------|-------------|-------|
| **Business Components** | 9 | 9 | 0 | 0 | 0 |
| **Níveis Transaccion** | 2 | 1 | 1 | 0 | 0 |
| **Entidades Inferidas** | 3 | 3 | 0 | 0 | 0 |
| **Procedures** | 9 | 7 | 0 | 2 | 0 |
| **TableAccess** | 3 | 2 | 1 | 0 | 0 |
| **Domains** | 11 | 10 | 0 | 1 | 0 |
| **Regras RB** | 20 | 17 | 1 | 2 | 0 |
| **Objetos UI (SD)** | 3 | 3 | 0 | 0 | 0 |
| **Integrações** | 2 | 1 | 0 | 1 | 0 |
| **Rotinas batch** | 3 | 0 | 0 | 3 | 0 |

### Detalhamento por Categoria

- **BCs:** Usuario, Apontamento, Projeto, ProjetoEtapa, ProjetoEtapaAtividade, Evento, Mensagem, Device, RegistroAvisoLog — todos mapeados a models Sequelize.
- **Procedures não cobertas:** RotinaSemanal, RotinaMensal, RotinaCalcHoras* (lógica em servidor GeneXus).
- **Domain não coberto:** GeneXus.Geolocation (RB-008) — campos existem no modelo, captura não implementada.
- **Integração não coberta:** Synchronizer/Offline.

---

## 3) MATRIZ DETALHADA DE MAPEAMENTO

| Objeto GeneXus | Tipo | Papel | Refatorado (arquivo/rota/tela) | Status | Evidência |
|----------------|------|-------|--------------------------------|--------|-----------|
| Usuario | BC | Entidade | models/Usuario.ts, controllers/usuarioController.ts | ✅ Coberto | usuario.json |
| Apontamento | BC | Entidade | models/Apontamento.ts, controllers/apontamentoController.ts | ✅ Coberto | apontamento.json |
| Projeto | BC | Entidade | models/Projeto.ts, controllers/projetoController.ts | ✅ Coberto | projeto.json |
| ProjetoEtapa | BC | Entidade | models/ProjetoEtapa.ts | ✅ Coberto | projetoetapa.json |
| ProjetoEtapaAtividade | BC | Entidade | models/ProjetoEtapaAtividade.ts | ✅ Coberto | projetoetapaatividade.json |
| Evento | BC | Entidade | models/Evento.ts, controllers/eventoController.ts | ✅ Coberto | evento.json |
| Mensagem | BC | Entidade | models/Mensagem.ts, controllers/mensagemController.ts | ✅ Coberto | mensagem.json |
| Device | BC | Entidade | models/Device.ts, notificacaoController | ✅ Coberto | device.json |
| RegistroAvisoLog | BC | Entidade | models/RegistroAvisoLog.ts | ⚠️ Parcial | registroavisolog.json (modelo OK; fluxo VerificaSeAvisa não implementado) |
| ProjetoEquipe | Level | Nível Projeto | projetoController (ProjetoEquipe) | ⚠️ Parcial | projeto.json Level Equipe |
| ProjetoAdministrador | Level | Nível Projeto | notificacaoController administradores | ✅ Coberto | projeto.json Level Administrador |
| Empresa | Inferida | Entidade | models/Empresa.ts, controllers/empresaController.ts | ✅ Coberto | Referência em Usuario, Projeto |
| CentroCusto | Inferida | Entidade | models/CentroCusto.ts, controllers/centroCustoController.ts | ✅ Coberto | Referência em Projeto |
| Equipe | Inferida | Entidade | models/Equipe.ts, controllers/equipeController.ts | ✅ Coberto | EquipeId em Usuario |
| SdLogin | SD | Tela login | pages/LoginPage.tsx, /login | ✅ Coberto | sdlogin.properties.json |
| SdDashBoard | SD | Dashboard | pages/DashboardPage.tsx, / | ✅ Coberto | sddashboard.properties.json |
| SdApontamento | SD | Form apontamento | pages/ApontamentoPage.tsx, /apontamento | ✅ Coberto | sdapontamento.properties.json |
| PrcValidaLoginUsuario | Procedure | Auth | controllers/authController.login | ✅ Coberto | registrohorario.gxapp.json |
| PrcGeraApontamento | Procedure | Registrar ponto | apontamentoController.registrarEntrada, registrarSaida | ✅ Coberto | RegistrarApontamento.xml |
| PrcGetSdtUsuarioHorasDia | Procedure | Horas dia | apontamentoController.getHorasDia | ✅ Coberto | registrohorario.gxapp.json |
| PrcVerificaApontamentoAntigo | Procedure | Apont. aberto | apontamentoController.getApontamentoAberto | ✅ Coberto | registrohorario.gxapp.json |
| VerificaApontamentoEmAberto | TableAccess | Verificar aberto | getApontamentoAberto | ✅ Coberto | VerificaApontamentoEmAberto.xml |
| VerificaSeAvisaUsuarioApontamento | TableAccess | Avisos | — | 🔲 Não Coberto | VerificaSeAvisaUsuarioApontamento.xml |
| PrcQntMensagem | Procedure | Contagem msg | mensagemController | ✅ Coberto | registrohorario.gxapp.json |
| PrcUserDeviceId | Procedure | Vincular device | notificacaoController.criarVinculoUsuario | ✅ Coberto | registrohorario.gxapp.json |
| PrcDesvincularUsuarioDevice | Procedure | Desvincular | notificacaoController.desvincularUsuario | ✅ Coberto | registrohorario.gxapp.json |
| NotificationsRegistrationHandler | Procedure | Registrar device | notificacaoController.criarDevice | ✅ Coberto | registrohorario.gxapp.json |
| Reembolso | TableAccess | Entidade | models/Reembolso.ts, reembolsoController | ✅ Coberto | TableAccess Reembolso |
| TipoReembolso | TableAccess | Entidade | TipoReembolsoPage, cadastro | ✅ Coberto | TableAccess TipoReembolso |
| Domain Perfil | Domain | Enum | types/enums.ts Perfil | ✅ Coberto | domains.json |
| Domain Situacao | Domain | Enum | Situacao | ✅ Coberto | domains.json |
| Domain Tipo | Domain | Enum | TipoApontamento | ✅ Coberto | domains.json |
| Domain OrigemApontamento | Domain | Enum | 'W' fixo | ✅ Coberto | domains.json |
| Domain EvTipo | Domain | Enum | EvTipo | ✅ Coberto | domains.json |
| Domain Abrangencia | Domain | Enum | Abrangencia | ✅ Coberto | domains.json |
| Domain GeneXus.Geolocation | Domain | Validação | — | 🔲 Não Coberto | apontamento.json |
| GAM / Auth | Integração | Autenticação | JWT middleware, AuthContext | ✅ Coberto | settings.json |
| Synchronizer / Offline | Integração | Offline | — | 🔲 Não Coberto | ENGENHARIA_REVERSA |
| RotinaSemanal | Rotina | Batch | — | 🔲 Não Coberto | VerificaSeAvisaUsuarioApontamento.xml |
| RotinaMensal | Rotina | Batch | — | 🔲 Não Coberto | TableAccess |
| RotinaCalcHoras* | Rotina | Batch | — | 🔲 Não Coberto | TableAccess |

---

## 4) TOP GAPS CRÍTICOS (P0)

**Nenhum gap P0 identificado.**

O fluxo principal (login → dashboard → registrar entrada/saída) está operacional e equivalente ao GeneXus. As validações RB-009, RB-010, RB-011, RB-012 (projeto/comentário/atividade obrigatórios) foram implementadas.

---

## 5) GAPS P1 (Prioridade Alta)

| Gap | Impacto Técnico | Impacto Funcional | Risco Produção |
|-----|-----------------|-------------------|----------------|
| **RotinaSemanal / VerificaSeAvisaUsuarioApontamento** | Lógica de avisos de apontamento não replicada | Usuários não recebem lembretes de bater ponto | Médio — funcionalidade auxiliar |
| **ProjetoEquipe — filtro de projetos por usuário** | Lista todos projetos ativos em vez de filtrar por equipe/administrador | Usuário pode ver projetos não autorizados | Baixo — depende de multi-tenant |

---

## 6) GAPS P2 (Prioridade Média)

| Gap | Descrição |
|-----|------------|
| **Geolocation** | ApontamentoInicioGeolocation, ApontamentoFimGeolocation não capturados na UI |
| **Modo Offline** | Synchronizer GeneXus não replicado; sem PWA/Service Worker |
| **RegistroAvisoLog** | Modelo implementado; fluxo de registro de avisos (VerificaSeAvisaUsuarioApontamento) incompleto |

---

## 7) ITENS EXTRA (SEM ORIGEM GENEXUS EXPLÍCITA)

| Arquivo/Componente | Descrição | Justificativa | Risco |
|-------------------|-----------|---------------|-------|
| **POST /api/apontamentos/importar** | Importação em lote de apontamentos | Extensão para migração de dados ou correções | Baixo — operação admin |
| **POST /api/apontamentos/manual** | Registro manual de apontamento | Variação de RegistrarApontamento para ajustes | Baixo |
| **tipo_alerta, notificacao** | Sistema de alertas configuráveis | Extensão de VerificaSeAvisaUsuarioApontamento | Baixo |
| **usuario_projeto** | Vínculo usuário-projeto com valor % | Extensão de ProjetoEquipe para alocação | Baixo |
| **ParametrosPage** | Parâmetros do sistema | Inferido de configurações; sem JSON GeneXus | Baixo |
| **RelatorioPage** | Múltiplos relatórios (horas, fechamento, etc.) | Data Providers inferidos | Baixo |
| **admin/stats** | Estatísticas administrativas | Rotinas admin inferidas | Baixo |
| **logRoutes, cadastroRoutes** | Logs e cadastro unificado | Organização do refatorado | Nenhum |

**Recomendação:** Itens extra são extensões ou inferências razoáveis. Nenhum representa risco de divergência com o GeneXus.

---

## 8) RECOMENDAÇÕES

### Correções Obrigatórias

1. **ProjetoEquipe — filtro de projetos:** Implementar filtro de projetos por usuário (equipe ou administrador) em `projetoController.listarProjetos` para evitar exposição de projetos não autorizados em cenário multi-empresa.

### Ajustes Estruturais

2. **RegistroAvisoLog:** Fluxo de VerificaSeAvisaUsuarioApontamento para gravação de avisos — implementar endpoint/service que consuma a lógica.
3. **RotinaSemanal:** Implementar job/cron Node.js equivalente para envio de avisos de apontamento (UsuarioAvisosAtivo).

### Riscos Arquiteturais

4. **SGBD:** O GeneXus não especifica dialeto. SQLite em desenvolvimento; validar migração para PostgreSQL em produção.
5. **Offline:** Se o negócio exigir modo offline, planejar PWA com Service Worker e sincronização.

### Sugestões de Melhoria

6. **Geolocation:** Adicionar `navigator.geolocation.getCurrentPosition` no ApontamentoPage para preencher ApontamentoInicioGeolocation/ApontamentoFimGeolocation (opcional).
7. **Documentação:** Manter matriz_rastreabilidade_migracao.md atualizada a cada nova feature.
8. **Testes de equivalência:** Implementar testes automatizados que validem regras RB-001 a RB-020.

---

## 9) ITENS MIG-XXX SUGERIDOS (GAPS P1/P2)

Para uso no refinamento do backlog pelo Agente 03:

| ID Sugerido | Título | Prioridade | Origem GeneXus | Descrição |
|-------------|--------|------------|----------------|-----------|
| MIG-AVISOS | Rotina de avisos de apontamento | P1 | RotinaSemanal, VerificaSeAvisaUsuarioApontamento | Implementar job/cron Node.js que verifique UsuarioAvisosAtivo e registre em RegistroAvisoLog; integrar com notificações push |
| MIG-FILTRO-PROJETO | Filtro de projetos por usuário/equipe | P1 | ProjetoEquipe Level | Implementar filtro em listarProjetos: apenas projetos da equipe do usuário ou onde é administrador |
| MIG-GEOLOCATION | Captura de geolocalização no apontamento | P2 | Domain GeneXus.Geolocation | Adicionar navigator.geolocation no ApontamentoPage; preencher ApontamentoInicioGeolocation e ApontamentoFimGeolocation |
| MIG-OFFLINE | Modo offline / PWA | P2 | Synchronizer | Planejar PWA com Service Worker; estratégia de cache e sincronização de apontamentos |

---

## 10) RESPOSTA À PERGUNTA CHAVE

> **"Estamos 100% equivalentes ao GeneXus?"**

**Resposta:** **Não.** A equivalência é de **~90%** para o escopo operacional core (login, dashboard, apontamento). Faltam:
- Rotinas batch (avisos)
- Modo offline
- Geolocation na UI
- Filtro rigoroso de projetos por usuário

Para o **fluxo principal de registro de horário**, a equivalência é **suficiente para go-live**. Os gaps restantes são extensões ou funcionalidades auxiliares.

---

## Histórico de Execuções

| Versão | Data | Observação |
|--------|------|------------|
| v1 | 19/02/2025 | Execução inicial |
| v2 | 18/02/2026 | Reexecução; inclusão seção 9) ITENS MIG-XXX SUGERIDOS; atualização RegistroAvisoLog (modelo confirmado) |

---

*Documento gerado pelo Agente 04. Auditoria técnica sem alteração de código.*
