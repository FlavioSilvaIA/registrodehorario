# Engenharia Reversa — Knowledge Base GeneXus v2_14
## Registro Horário / Apontamento de Horas

**Agente:** Agente_Engenharia_Reversa_GeneXus  
**Data:** 18/02/2025  
**Evidência:** Artefatos em `v2_14/v2_14/` (gxmetadata, Metadata/TableAccess, Resources)

---

## A) SUMÁRIO DO SISTEMA

### Visão Geral
Sistema de **Registro de Horário (Apontamento)** para controle de jornada de colaboradores, com suporte a projetos, etapas, atividades, eventos (feriados, férias, atestados) e mensagens internas. Multiplataforma: **Android**, **iOS** e **Web**, com modo offline e sincronização.

### Características Técnicas
| Item | Evidência |
|------|-----------|
| **KB Language** | Portuguese |
| **GeneXus Version** | 15.0.1 |
| **Plataformas** | Android, iOS, Windows (Smart Devices) |
| **Connectivity** | Online + Offline (Synchronizer) |
| **ConvertTimeFromUTC** | True |
| **Apps** | RegistroHorario (principal), Geolocation |

### Banco de Dados
**INCERTEZA:** Não há evidência explícita de dialeto (SQL Server/Oracle/Postgres/MySQL). Tipos inferidos: `int`, `datetime`, `date`, `char`, `varchar`, `bitstr`, `numeric`.

---

## B) CATÁLOGO DE ENTIDADES (Alto Nível)

| Entidade | Tipo GeneXus | Descrição |
|----------|--------------|-----------|
| **Usuario** | Business Component | Colaboradores, perfis, carga horária, empresa, equipe |
| **Apontamento** | Business Component | Registros de entrada/saída, projeto, atividade, tipo (normal, férias, hora extra, etc.) |
| **Projeto** | Business Component | Projetos com empresa, centro de custo, equipe, administradores |
| **ProjetoEtapa** | Business Component | Etapas do projeto |
| **ProjetoEtapaAtividade** | Business Component | Atividades por etapa |
| **Evento** | Business Component | Feriados, férias, atestados, períodos reduzidos |
| **Mensagem** | Business Component | Mensagens internas com envio por e-mail |
| **Device** | Business Component | Dispositivos móveis (token push, tipo iOS/Android) |
| **RegistroAvisoLog** | Business Component | Log de avisos de registro |
| **Empresa** | Inferida | Referenciada em Usuario, Projeto, Evento (sem JSON próprio) |
| **CentroCusto** | Inferida | Referenciada em Projeto (sem JSON próprio) |
| **UsuarioDevice** | Inferida | Relacionamento Usuario ↔ Device (registrohorario.gxapp.json) |

---

## C) DICIONÁRIO DE DADOS (Detalhado e Auditável)

### Tabela: Usuario
*Origem: gxmetadata/usuario.json — Business Component Usuario*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK (→tabela.campo) | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|--------------------|--------|---------|-------|---------|------------|-------------------|
| Usuario | UsuarioId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | Usuario / Domain Id |
| Usuario | UsuarioLogin | char | 40 | N | N | — | — | — | — | — | N | Usuario / Domain Login |
| Usuario | UsuarioNome | char | 80 | N | N | — | — | — | — | — | N | Usuario / Domain Nome |
| Usuario | UsuarioPerfil | int | 1,0 | N | N | — | — | 0 | Perfil enum | — | N | Usuario / Domain Perfil (1=AdminGX2, 2=AdminEmpresa, 3=Coordenador, 4=Colaborador, 5=GestãoProjetos) |
| Usuario | UsuarioSenha | char | 80 | N | N | — | — | — | — | — | N | Usuario / Domain Senha |
| Usuario | UsuarioEmpresaId | int | 10,0 | S | N | →Empresa.EmpresaId | — | 0 | — | — | N | Usuario / SuperType EmpresaId |
| Usuario | EquipeId | int | 10,0 | S | N | — | — | 0 | Equipe enum | — | N | Usuario |
| Usuario | UsuarioEmail | varchar | 100 | N | N | — | — | — | Regex Email | — | N | Usuario / Domain GeneXus.Email |
| Usuario | UsuarioFoto | bitstr | 4 | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioCargaHoraria | numeric | 5,2 | N | N | — | — | 0 | — | — | N | Usuario |
| Usuario | UsuarioDataEntrada | date | 8 | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioDataSaida | date | 8 | S | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioAtivo | boolean | 1 | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioObrigatorioComentario | boolean | — | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioHoraPrevistaChegada | dtime | — | S | N | — | — | — | — | — | N | Usuario / Domain Hora |
| Usuario | UsuarioHoraPrevistaSaida | dtime | — | S | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioHoraPrevistaAlmocoSaida | dtime | — | S | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioHoraPrevistaAlmocoChegada | dtime | — | S | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioTravaApontamento | boolean | — | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioEmailGestor | varchar | 100 | N | N | — | — | — | Regex Email | — | N | Usuario |
| Usuario | UsuarioObrigatorioProjeto | boolean | — | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioAvisosAtivo | boolean | — | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioTotalHorasMensais | numeric | 9,2 | N | N | — | — | 0 | — | — | N | Usuario |
| Usuario | UsuarioReferenciaData | date | 8 | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioFotoExtensao | varchar | 6 | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioFotoNome | char | 80 | N | N | — | — | — | — | — | N | Usuario |
| Usuario | UsuarioFotoBase64 | varchar | 2097152 | N | N | — | — | — | — | — | N | Usuario / Domain Base64 |

### Tabela: Apontamento
*Origem: gxmetadata/apontamento.json — Business Component Apontamento*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK (→tabela.campo) | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|--------------------|--------|---------|-------|---------|------------|-------------------|
| Apontamento | ApontamentoId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | Apontamento / Domain Id |
| Apontamento | ApontamentoCadastroDataHora | dtime | 7,5 | N | N | — | — | — | — | — | N | Apontamento / Domain DataHora |
| Apontamento | ApontamentoInicioDataHora | dtime | 7,5 | N | N | — | — | — | — | — | N | Apontamento |
| Apontamento | ApontamentoInicioHora | dtime | — | S | N | — | — | — | — | — | S | Apontamento / ReadOnly |
| Apontamento | ApontamentoData | date | 8 | N | N | — | — | — | — | — | N | Apontamento / Domain Data |
| Apontamento | ApontamentoDiaSemana | char | 40 | S | N | — | — | — | — | — | S | Apontamento / ReadOnly |
| Apontamento | ApontamentoFinalDataHora | dtime | 7,5 | N | N | — | — | — | — | — | N | Apontamento |
| Apontamento | ApontamentoFinalHora | dtime | — | S | N | — | — | — | — | — | S | Apontamento / ReadOnly |
| Apontamento | ApontamentoSituacao | int | 2,0 | N | N | — | — | 0 | Situacao enum | — | N | Apontamento / Domain Situacao (1=Cadastrado, 2=Cancelado, 3=Aprovado) |
| Apontamento | UsuarioId | int | 10,0 | N | N | →Usuario.UsuarioId | — | 0 | — | — | N | Apontamento / FK Usuario |
| Apontamento | ProjetoId | int | 10,0 | S | N | →Projeto.ProjetoId | — | 0 | — | — | N | Apontamento / FK Projeto |
| Apontamento | ProjetoEtapaAtividadeId | int | 10,0 | S | N | →ProjetoEtapaAtividade.ProjetoEtapaAtividadeId | — | 0 | — | — | N | Apontamento / FK Atividade |
| Apontamento | ApontamentoComentario | varchar | 4000 | S | N | — | — | — | — | — | N | Apontamento / Domain Comentario |
| Apontamento | ApontamentoTipo | int | 4,0 | N | N | — | — | 0 | Tipo enum | — | N | Apontamento / Domain Tipo (1=Normal, 2=Férias, 3-6=Ausência/Falta/Abono, 7-10=HE) |
| Apontamento | ApontamentoHoras | numeric | 9,2 | S | N | — | — | 0 | — | — | S | Apontamento / ReadOnly |
| Apontamento | ApontamentoEventoId | int | 10,0 | S | N | →Evento.EventoId | — | 0 | — | — | N | Apontamento / FK Evento |
| Apontamento | ApontamentoInicioOrigem | char | 1 | N | N | — | — | — | OrigemApontamento | — | N | Apontamento / M=Mobile, W=Web |
| Apontamento | ApontamentoFimOrigem | char | 1 | S | N | — | — | — | OrigemApontamento | — | N | Apontamento |
| Apontamento | ApontamentoInicioGeolocation | char | 50 | S | N | — | — | — | Regex lat,long | — | N | Apontamento / Domain GeneXus.Geolocation |
| Apontamento | ApontamentoFimGeolocation | char | 50 | S | N | — | — | — | Regex lat,long | — | N | Apontamento |

### Tabela: Projeto
*Origem: gxmetadata/projeto.json — Business Component Projeto*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK (→tabela.campo) | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|--------------------|--------|---------|-------|---------|------------|-------------------|
| Projeto | ProjetoId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | Projeto / Domain Id |
| Projeto | ProjetoDescricao | char | 80 | N | N | — | — | — | — | — | N | Projeto / Domain Descricao |
| Projeto | ProjetoEmpresaId | int | 10,0 | N | N | →Empresa.EmpresaId | — | 0 | — | — | N | Projeto |
| Projeto | CentroCustoId | int | 10,0 | S | N | →CentroCusto.CentroCustoId | — | 0 | — | — | N | Projeto |
| Projeto | ProjetoValorHora | numeric | 13,2 | N | N | — | — | 0 | — | — | N | Projeto / Domain Valor |
| Projeto | ProjetoAtivo | boolean | 1 | N | N | — | — | — | — | — | N | Projeto |
| Projeto | ProjetoDataInicio | date | 8 | S | N | — | — | — | — | — | N | Projeto |
| Projeto | ProjetoDataFim | date | 8 | S | N | — | — | — | — | — | N | Projeto |
| Projeto | ProjetoStatus | char | 1 | N | N | — | — | — | DMStatusProjeto | — | N | Projeto (R/I/A/P/E) |
| Projeto | ProjetoTipo | char | 1 | S | N | — | — | — | DMTipo | — | N | Projeto (O/E/S/C/U/N) |
| Projeto | ProjetoComentarioObrigatorio | boolean | — | S | N | — | — | — | — | — | N | Projeto |
| Projeto | ProjetoAtividadeObrigatoria | boolean | — | S | N | — | — | — | — | — | N | Projeto |
| Projeto | ProjetoDefault | boolean | — | S | N | — | — | — | — | — | N | Projeto |

### Tabela: ProjetoEquipe (Transaccion Level)
*Origem: gxmetadata/projeto.json — Level Equipe*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| ProjetoEquipe | ProjetoId | int | 10,0 | N | S | →Projeto.ProjetoId | — | — | — | PK | N | Projeto / Level Equipe |
| ProjetoEquipe | ProjetoEquipeId | int | 8,0 | N | S | — | — | 0 | — | PK | N | Projeto / Level Equipe |
| ProjetoEquipe | ProjetoEquipeUsuarioId | int | 10,0 | N | N | →Usuario.UsuarioId | — | 0 | — | — | N | Projeto / Level Equipe |

### Tabela: ProjetoAdministrador (Transaccion Level)
*Origem: gxmetadata/projeto.json — Level Administrador*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| ProjetoAdministrador | ProjetoId | int | 10,0 | N | S | →Projeto.ProjetoId | — | — | — | PK | N | Projeto / Level Administrador |
| ProjetoAdministrador | ProjetoAdministradorId | int | 8,0 | N | S | — | — | 0 | — | PK | N | Projeto / Level Administrador |
| ProjetoAdministrador | ProjetoAdminitradorUsuarioId | int | 10,0 | N | N | →Usuario.UsuarioId | — | 0 | — | — | N | Projeto / Level Administrador |

### Tabela: ProjetoEtapa
*Origem: gxmetadata/projetoetapa.json*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| ProjetoEtapa | ProjetoEtapaId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | ProjetoEtapa / Domain Id |
| ProjetoEtapa | ProjetoEtapaProjetoId | int | 10,0 | N | N | →Projeto.ProjetoId | — | 0 | — | — | N | ProjetoEtapa |
| ProjetoEtapa | ProjetoEtapaNome | char | 80 | N | N | — | — | — | — | — | N | ProjetoEtapa |
| ProjetoEtapa | ProjetoEtapaStatus | char | 1 | N | N | — | — | — | Status (A/F) | — | N | ProjetoEtapa |

### Tabela: ProjetoEtapaAtividade
*Origem: gxmetadata/projetoetapaatividade.json*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| ProjetoEtapaAtividade | ProjetoEtapaAtividadeId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | ProjetoEtapaAtividade |
| ProjetoEtapaAtividade | ProjetoEtapaAtividadeEtapaId | int | 10,0 | N | N | →ProjetoEtapa.ProjetoEtapaId | — | 0 | — | — | N | ProjetoEtapaAtividade |
| ProjetoEtapaAtividade | ProjetoEtapaAtividadeNome | char | 80 | N | N | — | — | — | — | — | N | ProjetoEtapaAtividade |
| ProjetoEtapaAtividade | ProjetoEtapaAtividadeDescricao | varchar | 2097152 | N | N | — | — | — | — | — | N | ProjetoEtapaAtividade |
| ProjetoEtapaAtividade | ProjetoEtapaAtividadeStatus | char | 1 | N | N | — | — | — | Status (A/F) | — | N | ProjetoEtapaAtividade |

### Tabela: Evento
*Origem: gxmetadata/evento.json*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| Evento | EventoId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | Evento |
| Evento | EventoData | date | 8 | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoDataFinal | date | 8 | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoCadastroDataHora | dtime | 7,5 | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoTipo | int | 2,0 | N | N | — | — | 0 | EvTipo | — | N | Evento (1=Feriado, 2=Férias, 3=Férias Coletivas, 4=Período Reduzido, 5=Outro, 6=Atestado) |
| Evento | EventoDescricao | char | 80 | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoAbrangencia | int | 2,0 | N | N | — | — | 0 | Abrangencia (1=Sistema, 2=Empresa, 3=Usuario) | — | N | Evento |
| Evento | EventoDiaInteiro | boolean | — | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoInicioDataHora | dtime | — | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoFinalDataHora | dtime | — | N | N | — | — | — | — | — | N | Evento |
| Evento | EventoEmpresaId | int | 10,0 | S | N | →Empresa.EmpresaId | — | 0 | — | — | N | Evento |
| Evento | EventoUsuarioId | int | 10,0 | S | N | →Usuario.UsuarioId | — | 0 | — | — | N | Evento |

### Tabela: Mensagem
*Origem: gxmetadata/mensagem.json*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| Mensagem | MensagemId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | Mensagem |
| Mensagem | RemetenteUsuarioId | int | 10,0 | N | N | →Usuario.UsuarioId | — | 0 | — | — | N | Mensagem |
| Mensagem | MensagemCadastroDataHora | dtime | 7,5 | N | N | — | — | — | — | — | N | Mensagem |
| Mensagem | MensagemTitulo | char | 80 | N | N | — | — | — | — | — | N | Mensagem |
| Mensagem | MensagemTexto | varchar | 8000 | N | N | — | — | — | — | — | N | Mensagem |
| Mensagem | MensagemEnviaEmail | boolean | — | N | N | — | — | — | — | — | N | Mensagem |
| Mensagem | MensagemSituacao | varchar | 1 | N | N | — | — | — | SituacaoMensagem (E/P) | — | N | Mensagem |

### Tabela: Device
*Origem: gxmetadata/device.json*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| Device | DeviceCod | int | 4,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | Device |
| Device | DeviceId | char | 128 | N | N | — | — | — | — | — | N | Device |
| Device | DeviceName | char | 128 | N | N | — | — | — | — | — | N | Device |
| Device | DeviceToken | char | 255 | N | N | — | — | — | — | — | N | Device |
| Device | DeviceType | int | 1,0 | N | N | — | — | 0 | SmartDeviceType | — | N | Device (0=iOS, 1=Android, 2=BB, 3=Win) |

### Tabela: RegistroAvisoLog
*Origem: gxmetadata/registroavisolog.json*

| Tabela | Campo | Tipo | Tamanho/Precisão | Nulável | PK | FK | Unique | Default | Check | Índices | Computado? | Comentário/Origem |
|--------|-------|------|------------------|---------|----|----|--------|---------|-------|---------|------------|-------------------|
| RegistroAvisoLog | RegistroAvisoLogId | int | 10,0 | N | S | — | — | 0 (AutoNumber) | — | PK | N | RegistroAvisoLog |
| RegistroAvisoLog | RegistroAvisoLogDataHora | dtime | 7,5 | N | N | — | — | — | — | — | N | RegistroAvisoLog |
| RegistroAvisoLog | RegistroAvisoLogData | date | 8 | N | N | — | — | — | — | — | N | RegistroAvisoLog |
| RegistroAvisoLog | RegistroAvisoLogUsuarioId | int | 10,0 | N | N | →Usuario.UsuarioId | — | 0 | — | — | N | RegistroAvisoLog |
| RegistroAvisoLog | RegistroAvisoLogObservacao | varchar | 4000 | N | N | — | — | — | — | — | N | RegistroAvisoLog |

---

## D) MAPEAMENTO UI ↔ DADOS

| Objeto UI | Padrão | Dados Principais | Evidência |
|-----------|--------|------------------|-----------|
| **SdLogin** | Login | UsuarioLogin, UsuarioSenha | sdlogin.properties.json, registrohorario.gxapp.json |
| **SdDashBoard** | Dashboard | Projetos, Apontamentos, Horas do dia | sddashboard.properties.json |
| **SdApontamento** | Formulário apontamento | Apontamento (início/fim, projeto, atividade, tipo, comentário, geolocation) | sdapontamento.properties.json |
| **RegistroHorario** | App principal | Context (UsuarioId, UsuarioNome, UsuarioFoto, UsuarioPerfil, EquipeId) | registrohorario.gxapp.json |
| **Geolocation** | App geolocalização | ApontamentoInicioGeolocation, ApontamentoFimGeolocation | geolocation.gxapp.json |

---

## E) REGRAS DE NEGÓCIO (RB-001...)

| ID | Regra | Origem | Evidência |
|----|-------|--------|-----------|
| RB-001 | Usuário deve ter login único | Usuario / Domain Login | usuario.json |
| RB-002 | Usuário deve ter e-mail válido (regex) | Usuario / UsuarioEmail | usuario.json, Domain GeneXus.Email |
| RB-003 | Apontamento deve ter UsuarioId obrigatório | Apontamento / FK Usuario | apontamento.json |
| RB-004 | Apontamento pode ter ProjetoId e ProjetoEtapaAtividadeId opcionais | Apontamento | apontamento.json |
| RB-005 | ApontamentoSituacao: 1=Cadastrado, 2=Cancelado, 3=Aprovado | Apontamento / Domain Situacao | domains.json |
| RB-006 | ApontamentoTipo: 1=Normal, 2=Férias, 3-6=Ausência/Falta/Abono, 7-10=Hora Extra | Apontamento / Domain Tipo | domains.json |
| RB-007 | Origem do apontamento: M=Mobile, W=Web | Apontamento / Domain OrigemApontamento | domains.json |
| RB-008 | Geolocation deve seguir regex lat,long | Apontamento / Domain GeneXus.Geolocation | apontamento.json |
| RB-009 | Projeto pode exigir comentário obrigatório | Projeto / ProjetoComentarioObrigatorio | projeto.json |
| RB-010 | Projeto pode exigir atividade obrigatória | Projeto / ProjetoAtividadeObrigatoria | projeto.json |
| RB-011 | Usuário pode ter comentário obrigatório no apontamento | Usuario / UsuarioObrigatorioComentario | usuario.json |
| RB-012 | Usuário pode ter projeto obrigatório no apontamento | Usuario / UsuarioObrigatorioProjeto | usuario.json |
| RB-013 | Perfis: AdminGX2, AdminEmpresa, Coordenador, Colaborador, GestãoProjetos | Usuario / Domain Perfil | domains.json |
| RB-014 | Evento tem abrangência: Sistema, Empresa, Usuario | Evento / Domain Abrangencia | domains.json |
| RB-015 | Evento tem tipos: Feriado, Férias, Férias Coletivas, Período Reduzido, Outro, Atestado | Evento / Domain EvTipo | domains.json |
| RB-016 | Projeto tem status: Previsto, Aguardando Início, Em Andamento, Parado, Encerrado | Projeto / Domain DMStatusProjeto | domains.json |
| RB-017 | Projeto tem tipo: Outsourcing, Labs (vários) | Projeto / Domain DMTipo | domains.json |
| RB-018 | RegistrarApontamento depende de Apontamento, Projeto, Evento, Usuario, ProjetoEtapaAtividade, Log | Metadata/TableAccess/RegistrarApontamento.xml | RegistrarApontamento.xml |
| RB-019 | VerificaApontamentoEmAberto depende de Apontamento | Metadata/TableAccess/VerificaApontamentoEmAberto.xml | VerificaApontamentoEmAberto.xml |
| RB-020 | VerificaSeAvisaUsuarioApontamento depende de RotinaSemanal | Metadata/TableAccess/VerificaSeAvisaUsuarioApontamento.xml | VerificaSeAvisaUsuarioApontamento.xml |

---

## F) USER STORIES (INVEST) com Gherkin

### US-001: Login no aplicativo
**Como** colaborador  
**Quero** fazer login com usuário e senha  
**Para** acessar o sistema de registro de horário  

**Critérios de aceite (Gherkin):**
```gherkin
Scenario: Login com credenciais válidas
  Given que estou na tela de login
  When informo UsuarioLogin e UsuarioSenha válidos
  Then o sistema valida via PrcValidaLoginUsuario
  And exibe o dashboard (SdDashBoard)

Scenario: Login com credenciais inválidas
  Given que estou na tela de login
  When informo credenciais inválidas
  Then o sistema retorna IsValid = false
  And exibe mensagem de erro
```

### US-002: Registrar entrada (início de apontamento)
**Como** colaborador  
**Quero** registrar minha entrada  
**Para** iniciar o controle de jornada  

**Critérios de aceite (Gherkin):**
```gherkin
Scenario: Registrar entrada sem apontamento em aberto
  Given que estou logado e não tenho apontamento em aberto
  When registro minha entrada (início)
  Then o sistema cria Apontamento com ApontamentoInicioDataHora
  And ApontamentoSituacao = 1 (Cadastrado)
  And ApontamentoInicioOrigem = M ou W conforme origem
  And opcionalmente grava ApontamentoInicioGeolocation

Scenario: Tentar registrar entrada com apontamento em aberto
  Given que tenho apontamento em aberto (VerificaApontamentoEmAberto)
  When tento registrar nova entrada
  Then o sistema impede e exibe mensagem apropriada
```

### US-003: Registrar saída (fim de apontamento)
**Como** colaborador  
**Quero** registrar minha saída  
**Para** encerrar o apontamento do dia  

**Critérios de aceite (Gherkin):**
```gherkin
Scenario: Registrar saída com apontamento em aberto
  Given que tenho apontamento em aberto
  When registro minha saída
  Then o sistema atualiza ApontamentoFinalDataHora
  And calcula ApontamentoHoras (ReadOnly)
  And opcionalmente grava ApontamentoFimGeolocation
```

### US-004: Registrar apontamento com projeto e atividade
**Como** colaborador  
**Quero** vincular projeto e atividade ao apontamento  
**Para** que o tempo seja alocado corretamente  

**Critérios de aceite (Gherkin):**
```gherkin
Scenario: Apontamento com projeto obrigatório (UsuarioObrigatorioProjeto)
  Given que meu usuário exige projeto obrigatório
  When registro apontamento sem ProjetoId
  Then o sistema exibe erro e não aceita

Scenario: Apontamento com atividade obrigatória (ProjetoAtividadeObrigatoria)
  Given que o projeto exige atividade obrigatória
  When registro apontamento sem ProjetoEtapaAtividadeId
  Then o sistema exibe erro e não aceita

Scenario: Apontamento com comentário obrigatório
  Given que UsuarioObrigatorioComentario ou ProjetoComentarioObrigatorio
  When registro apontamento sem ApontamentoComentario
  Then o sistema exibe erro e não aceita
```

### US-005: Visualizar dashboard
**Como** colaborador  
**Quero** ver meus projetos e horas do dia  
**Para** acompanhar minha jornada  

**Critérios de aceite (Gherkin):**
```gherkin
Scenario: Dashboard com projetos e horas
  Given que estou logado
  When acesso o SdDashBoard
  Then o sistema exibe projetos (SdDashBoard_Level_Detail_GridProjeto)
  And exibe gráfico de horas (SdDashBoard_Level_Detail_GridGrafico)
  And PrcGetSdtUsuarioHorasDia retorna horas do dia
```

### US-006: Receber avisos de registro
**Como** colaborador com avisos ativos  
**Quero** receber notificações de lembrete de registro  
**Para** não esquecer de bater ponto  

**Critérios de aceite (Gherkin):**
```gherkin
Scenario: Aviso de apontamento
  Given UsuarioAvisosAtivo = true
  And RotinaSemanal verifica necessidade de aviso
  When VerificaSeAvisaUsuarioApontamento retorna positivo
  Then o sistema registra em RegistroAvisoLog
  And envia notificação push (Device.DeviceToken)
```

---

## G) CASOS DE USO (Fluxos)

| UC | Nome | Ator | Fluxo Principal | Fluxos Alternativos |
|----|------|------|-----------------|---------------------|
| UC-01 | Login | Colaborador | 1. Acessar app 2. Informar login/senha 3. PrcValidaLoginUsuario 4. Exibir dashboard | FA1: Credenciais inválidas → mensagem erro |
| UC-02 | Registrar entrada | Colaborador | 1. Verificar apontamento em aberto 2. Se não houver, registrar início 3. Opcional: projeto, atividade, comentário, geolocation | FA1: Apontamento em aberto → impedir |
| UC-03 | Registrar saída | Colaborador | 1. Verificar apontamento em aberto 2. Registrar fim 3. Calcular horas | — |
| UC-04 | Gerenciar projetos | Admin/Coordenador | 1. Cadastrar projeto 2. Vincular equipe e administradores 3. Configurar etapas e atividades | — |
| UC-05 | Cadastrar eventos | Admin | 1. Cadastrar evento (feriado, férias, atestado) 2. Definir abrangência e período | — |
| UC-06 | Enviar mensagem | Admin/Coordenador | 1. Criar mensagem 2. Opcional: enviar por e-mail 3. MensagemSituacao = E ou P | — |

---

## H) MATRIZ DE RASTREABILIDADE

| Story | Regra | Dados | Objeto GeneXus | Evidência |
|-------|-------|-------|----------------|-----------|
| US-001 | RB-001, RB-002 | Usuario (Login, Senha) | SdLogin, PrcValidaLoginUsuario | sdlogin, usuario.json |
| US-002 | RB-003, RB-007, RB-008 | Apontamento (Inicio, Origem, Geolocation) | SdApontamento, RegistrarApontamento, VerificaApontamentoEmAberto | apontamento.json, RegistrarApontamento.xml |
| US-003 | RB-005 | Apontamento (Final, Horas) | SdApontamento, RegistrarApontamento | apontamento.json |
| US-004 | RB-009, RB-010, RB-011, RB-012 | Apontamento, Projeto, Usuario | Apontamento BC, Projeto BC | apontamento.json, projeto.json, usuario.json |
| US-005 | — | Projeto, Apontamento, SdtUsuarioHorasDia | SdDashBoard, PrcGetSdtUsuarioHorasDia | sddashboard, registrohorario.gxapp |
| US-006 | RB-020 | RegistroAvisoLog, RotinaSemanal | VerificaSeAvisaUsuarioApontamento | registroavisolog.json, VerificaSeAvisaUsuarioApontamento.xml |

---

## I) DADOS DE TESTE (Seed)

```sql
-- Usuario de teste (senha deve ser hasheada conforme implementação)
-- INSERT INTO Usuario (UsuarioLogin, UsuarioNome, UsuarioPerfil, UsuarioSenha, UsuarioEmail, UsuarioCargaHoraria, UsuarioDataEntrada, UsuarioAtivo, UsuarioObrigatorioComentario, UsuarioObrigatorioProjeto)
-- VALUES ('colab01', 'Colaborador Teste', 4, '<hash>', 'colab@teste.com', 44.00, '2024-01-01', 1, 0, 0);

-- Projeto de teste
-- INSERT INTO Projeto (ProjetoDescricao, ProjetoEmpresaId, ProjetoValorHora, ProjetoAtivo, ProjetoStatus)
-- VALUES ('Projeto Teste', 1, 100.00, 1, 'A');

-- Evento (Feriado)
-- INSERT INTO Evento (EventoData, EventoDataFinal, EventoCadastroDataHora, EventoTipo, EventoDescricao, EventoAbrangencia, EventoDiaInteiro)
-- VALUES ('2025-01-01', '2025-01-01', GETDATE(), 1, 'Ano Novo', 1, 1);
```

**INCERTEZA:** Sintaxe SQL depende do dialeto do banco. Não há evidência de qual SGBD está em uso.

---

## J) INCERTEZAS & PERGUNTAS AO NEGÓCIO

| # | Incerteza | Pergunta ao Negócio |
|---|-----------|---------------------|
| 1 | Banco de dados | Qual SGBD é utilizado (SQL Server, Oracle, Postgres, MySQL)? |
| 2 | Empresa | Existe Transaction/BC Empresa? Qual a estrutura? |
| 3 | CentroCusto | Existe Transaction/BC CentroCusto? Qual a estrutura? |
| 4 | UsuarioDevice | Como é a relação Usuario ↔ Device? Existe tabela de vínculo? |
| 5 | Reembolso | Objetos Reembolso, ReembolsoEmail, TipoReembolso aparecem em TableAccess. Qual o modelo de dados? |
| 6 | MsgUsuario | Existe tabela de mensagens por usuário (leitura)? |
| 7 | Rotinas | RotinaSemanal, RotinaMensal, RotinaCalcHoras* — qual a lógica exata? (XML só traz Dependencies) |
| 8 | GAM | O sistema utiliza GAM para autenticação? settings.json indica EnableIntegratedSecurity=False |
| 9 | Validações | PrcValidaLoginUsuario, PrcVerificaApontamentoAntigo — qual a lógica completa? |
| 10 | PrcGeraApontamento | Parâmetros e fluxo completo de geração de apontamento |

---

*Documento gerado por engenharia reversa dos artefatos GeneXus em v2_14. Sem evidência não foi inventado.*
