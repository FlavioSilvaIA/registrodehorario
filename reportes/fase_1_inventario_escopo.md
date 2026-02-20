# FASE 1 — INVENTÁRIO E CONFIRMAÇÃO DE ESCOPO
## Refatoração GeneXus → React JS + Node.js

**Agente:** Agente_pro_GeneXus_REFACTOR  
**Data:** 18/02/2025  
**KB:** v2_14 — Registro Horário / Apontamento de Horas  
**Objetivo:** Migrar funcionalidade do KB GeneXus para stack React + Node.js

---

## 1. OBJETIVO DA REFATORAÇÃO

Migrar o sistema de **Registro de Horário** (apontamento de horas) do GeneXus para:
- **Frontend:** React JS
- **Backend:** Node.js (API REST)

O KB original permanece **intacto**. A refatoração consiste em **criar artefatos equivalentes** na nova stack.

---

## 2. OBJETOS CANDIDATOS À REFATORAÇÃO

### 2.1 Business Components (Entidades de Dados)

| Objeto | Tipo | Atributos Principais | Domínios/Tipos | Evidência |
|--------|------|----------------------|----------------|-----------|
| **Usuario** | BC | UsuarioId, UsuarioLogin, UsuarioNome, UsuarioPerfil, UsuarioSenha, UsuarioEmail, UsuarioEmpresaId, EquipeId, UsuarioCargaHoraria, UsuarioDataEntrada, UsuarioDataSaida, UsuarioAtivo, UsuarioObrigatorioComentario, UsuarioObrigatorioProjeto, UsuarioAvisosAtivo, UsuarioFoto*, UsuarioHoraPrevista* | Id, Login, Nome, Perfil, Senha, Email, Data, Hora, boolean | gxmetadata/usuario.json |
| **Apontamento** | BC | ApontamentoId, UsuarioId, ProjetoId, ProjetoEtapaAtividadeId, ApontamentoData, ApontamentoInicioDataHora, ApontamentoFinalDataHora, ApontamentoSituacao, ApontamentoTipo, ApontamentoComentario, ApontamentoHoras, ApontamentoInicioOrigem, ApontamentoFimOrigem, ApontamentoInicioGeolocation, ApontamentoFimGeolocation | Id, DataHora, Situacao, Tipo, OrigemApontamento, GeneXus.Geolocation | gxmetadata/apontamento.json |
| **Projeto** | BC | ProjetoId, ProjetoDescricao, ProjetoEmpresaId, CentroCustoId, ProjetoValorHora, ProjetoAtivo, ProjetoStatus, ProjetoTipo, ProjetoComentarioObrigatorio, ProjetoAtividadeObrigatoria | Id, Descricao, Valor, DMStatusProjeto, DMTipo | gxmetadata/projeto.json |
| **ProjetoEtapa** | BC | ProjetoEtapaId, ProjetoEtapaProjetoId, ProjetoEtapaNome, ProjetoEtapaStatus | Id, Nome, Status | gxmetadata/projetoetapa.json |
| **ProjetoEtapaAtividade** | BC | ProjetoEtapaAtividadeId, ProjetoEtapaAtividadeEtapaId, ProjetoEtapaAtividadeNome, ProjetoEtapaAtividadeDescricao, ProjetoEtapaAtividadeStatus | Id, Nome, Status | gxmetadata/projetoetapaatividade.json |
| **Evento** | BC | EventoId, EventoData, EventoDataFinal, EventoTipo, EventoDescricao, EventoAbrangencia, EventoEmpresaId, EventoUsuarioId | Id, Data, EvTipo, Abrangencia | gxmetadata/evento.json |
| **Mensagem** | BC | MensagemId, RemetenteUsuarioId, MensagemTitulo, MensagemTexto, MensagemEnviaEmail, MensagemSituacao | Id, Titulo, Texto, SituacaoMensagem | gxmetadata/mensagem.json |
| **Device** | BC | DeviceCod, DeviceId, DeviceName, DeviceToken, DeviceType | SmartDeviceType | gxmetadata/device.json |
| **RegistroAvisoLog** | BC | RegistroAvisoLogId, RegistroAvisoLogDataHora, RegistroAvisoLogUsuarioId, RegistroAvisoLogObservacao | Id, DataHora, Observacao | gxmetadata/registroavisolog.json |

### 2.2 Níveis Transaccion (Tabelas Filhas)

| Objeto | Nível | PK | FK | Evidência |
|--------|-------|----|----|-----------|
| ProjetoEquipe | Equipe | ProjetoId, ProjetoEquipeId | ProjetoEquipeUsuarioId → Usuario | projeto.json |
| ProjetoAdministrador | Administrador | ProjetoId, ProjetoAdministradorId | ProjetoAdminitradorUsuarioId → Usuario | projeto.json |

### 2.3 Objetos UI (Smart Devices / Web Panels)

| Objeto | Padrão | Dados | Evidência |
|--------|--------|-------|-----------|
| **SdLogin** | Login | UsuarioLogin, UsuarioSenha | sdlogin.properties.json |
| **SdDashBoard** | Dashboard | Projetos, Apontamentos, Horas do dia | sddashboard.properties.json |
| **SdApontamento** | Formulário CRUD | Apontamento (início/fim, projeto, atividade, tipo, comentário, geolocation) | sdapontamento.properties.json |

### 2.4 Procedures (Lógica de Negócio)

| Procedure | Parâmetros IN | Parâmetros OUT | Dependências | Evidência |
|-----------|---------------|----------------|--------------|-----------|
| PrcValidaLoginUsuario | UsuarioLogin, UsuarioSenha | UsuarioId, UsuarioNome, UsuarioEmpresaId, IsValid | Usuario | registrohorario.gxapp.json |
| PrcGeraApontamento | UsuarioId, EmpresaId, IsProjeto, ProjetoApontamentoId, ProjetoId, NovoProjetoDesricao, ApontamentoComentario, Geolocation | IsFim, IsOk, Messages | Apontamento, Projeto, Evento, Usuario, ProjetoEtapaAtividade, Log | registrohorario.gxapp.json |
| PrcGetSdtUsuarioHorasDia | UsuarioId | SdtUsuarioHorasDia | Apontamento | registrohorario.gxapp.json |
| PrcVerificaApontamentoAntigo | UsuarioId | AbertoApontamentoDataString, IsOk | Apontamento | registrohorario.gxapp.json |
| PrcGetIsProjetoUsuarioHoje | UsuarioId | ApontamentoId, ProjetoId, ProjetoDesricao, IsProjeto | Apontamento, Projeto | registrohorario.gxapp.json |
| PrcQntMensagem | UsuarioId | QtMensagem | Mensagem | registrohorario.gxapp.json |
| PrcUserDeviceId | UsuarioId, DeviceId | — | UsuarioDevice | registrohorario.gxapp.json |
| PrcDesvincularUsuarioDevice | UsuarioId, DeviceId | — | UsuarioDevice | registrohorario.gxapp.json |
| NotificationsRegistrationHandler | DeviceType, DeviceId, DeviceToken, DeviceName | — | Device | registrohorario.gxapp.json |

### 2.5 Domínios Relevantes (Enums / Validações)

| Domínio | Tipo | Valores/Regras | Evidência |
|---------|------|----------------|-----------|
| Perfil | int | 1=AdminGX2, 2=AdminEmpresa, 3=Coordenador, 4=Colaborador, 5=GestãoProjetos | domains.json |
| Situacao | int | 1=Cadastrado, 2=Cancelado, 3=Aprovado | domains.json |
| Tipo | int | 1=Normal, 2=Férias, 3-6=Ausência/Falta/Abono, 7-10=Hora Extra | domains.json |
| OrigemApontamento | char | M=Mobile, W=Web | domains.json |
| EvTipo | int | 1=Feriado, 2=Férias, 3=Férias Coletivas, 4=Período Reduzido, 5=Outro, 6=Atestado | domains.json |
| Abrangencia | int | 1=Sistema, 2=Empresa, 3=Usuario | domains.json |
| DMStatusProjeto | char | R/I/A/P/E | domains.json |
| DMTipo | char | O/E/S/C/U/N | domains.json |
| Status | char | A=Aberta, F=Finalizada | domains.json |
| SituacaoMensagem | varchar | E=Enviada, P=Pendente | domains.json |
| GeneXus.Email | varchar | Regex e-mail | domains.json |
| GeneXus.Geolocation | char(50) | Regex lat,long | domains.json |

### 2.6 TableAccess / Dependências (Procedures/Data Providers)

- **RegistrarApontamento** → Apontamento, Projeto, Evento, Usuario, ProjetoEtapaAtividade, Log
- **VerificaApontamentoEmAberto** → Apontamento
- **VerificaSeAvisaUsuarioApontamento** → RotinaSemanal
- **Usuario**, **Projeto**, **Evento**, **Device**, **Mensagem**, **RegistroAvisoLog** (BCs)
- **UsuarioDevice**, **Reembolso**, **TipoReembolso** (referenciados, sem JSON completo)
- **RotinaSemanal**, **RotinaMensal**, **RotinaCalcHoras*** (lógica em servidor)

---

## 3. PONTOS FORA DE ESCOPO (NÃO ALTERAR)

| Item | Motivo |
|------|--------|
| **KB GeneXus original** | Não modificar. Manter como referência e backup. |
| **Artefatos .xpz / .gxproj** | Não existem no workspace; apenas gxmetadata exportado. |
| **thema-v1.5 (assets)** | Tema/UI GeneXus — não migrar; será substituído por React. |
| **GAM / EnableIntegratedSecurity** | Configuração GeneXus; equivalente será JWT/sessão em Node. |
| **Synchronizer / Offline** | Modo offline GeneXus — fora do escopo inicial; pode ser fase 2. |
| **Imagens/Resources** | Imagens específicas de plataforma (Android/iOS) — avaliar necessidade. |
| **Rotinas batch** | RotinaSemanal, RotinaMensal, RotinaCalcHoras* — lógica complexa; documentar e replicar depois. |
| **Reembolso / TipoReembolso** | Sem estrutura completa; deixar para validação. |
| **Empresa / CentroCusto** | Inferidos; criar estruturas mínimas se necessário. |

---

## 4. RISCOS E AMBIGUIDADES

| Risco | Mitigação |
|-------|-----------|
| SGBD desconhecido | Usar PostgreSQL ou SQLite para Node.js; schema compatível. |
| Lógica de Procedures não exposta | XML TableAccess só traz Dependencies; inferir lógica a partir de nomes e parâmetros. |
| UsuarioDevice sem modelo | Criar tabela de vínculo Usuario_Device (UsuarioId, DeviceId, DeviceToken, DeviceType). |
| PrcValidaLoginUsuario (hash senha) | Usar bcrypt em Node.js; migrar senhas se houver base existente. |
| Geolocation / Push | Implementar endpoints; push pode usar Firebase ou serviço externo. |

---

## 5. PENDÊNCIAS PARA VALIDAÇÃO HUMANA

1. **Banco de dados:** Confirmar se há base em produção e qual SGBD.
2. **Autenticação:** Manter compatibilidade de senhas ou resetar?
3. **Offline:** Incluir suporte offline (PWA/Service Worker) na Fase 1?
4. **Empresa / CentroCusto:** Criar entidades mínimas ou mock?
5. **Reembolso:** Incluir no escopo ou postergar?
6. **Rotinas batch:** Prioridade de implementação.

---

## 6. RESUMO DO INVENTÁRIO

| Categoria | Quantidade |
|-----------|------------|
| Business Components | 9 |
| Níveis Transaccion | 2 |
| Objetos UI | 3 |
| Procedures | 9+ |
| Domínios/Enums | 11+ |
| TableAccess XML | 194 |

---

*Documento gerado na Fase 1. Nenhuma alteração foi executada.*
