# Orientações para o Agente de Refatoração — Registro Horário GeneXus → React + Node

**Objetivo:** Reduzir retrabalho e interações humanas ao refatorar o sistema. Consulte este documento **antes** de implementar qualquer feature.

---

## 1. CONTEXTO DO PROJETO

- **Origem:** Sistema GeneXus v2_14 (Registro de Horário / Apontamento de Horas)
- **Destino:** Stack React (frontend) + Node.js + Express + Sequelize + SQLite (backend)
- **Pasta do projeto refatorado:** `refatorado_20250218/`
- **Documento de engenharia reversa:** `v2_14/ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md` — **OBRIGATÓRIO** consultar antes de implementar entidades, telas ou fluxos.

---

## 2. DOCUMENTAÇÃO OBRIGATÓRIA

| Documento | Quando consultar |
|-----------|------------------|
| `ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md` | Antes de criar/alterar entidades, telas, regras de negócio |
| Imagens de referência (quando fornecidas) | Antes de implementar UI — layout, labels, fluxos |
| Modelos em `backend/src/models/` | Antes de criar controllers ou rotas |

---

## 3. CLAREZA SEMÂNTICA DO DOMÍNIO

Evite interpretações incorretas. Consulte a tabela abaixo para termos ambíguos:

| Termo na UI / Especificação | Significado correto | O que NÃO é |
|-----------------------------|---------------------|-------------|
| **Vincular usuário** (módulo Notificação) | Vincular **TipoAlerta** (ex.: "AUSÊNCIA DE LANÇAMENTO DE HORÁRIO") a **Usuario** (Colaborador) | Vincular usuário a dispositivo (push) |
| **Notificação** (no grid Vincular usuário) | `tipoAlertaDescricao` (TipoAlerta) | `notificacaoTexto` (entidade Notificacao) |
| **Colaborador** | Usuario (entidade Usuario) | — |
| **Cadastro** (Notificação) | Configuração de notificações por empresa (Notificacao) | Tipo de alerta |
| **Alertas** (Notificação) | Tipos de alerta (TipoAlerta) com descrição, tempo, imagem | Notificações genéricas |
| **Tipo de Reembolso** | Entidade TipoReembolso (descrição) | Reembolso em si |

---

## 4. PADRÕES DE UI DO SISTEMA

Seguir estritamente estes padrões para manter consistência:

### 4.1 Tela inicial (listagem com filtros)
- Campos de pesquisa/filtro em **linha horizontal** (flexWrap, gap)
- Botão **+** circular verde (44x44px, borderRadius 50%) para adicionar
- Grid/tabela abaixo com colunas de dados + coluna **Ações** (Editar, Excluir)

### 4.2 Formulário expandido (novo/editar)
- Título da seção em `h4`, cor `#475569`
- Campos em **coluna** (flexDirection: column, gap 16)
- Botões: **Confirmar** (verde #22c55e) e **Fechar** (branco, borda cinza)
- Fundo `#f8fafc`, borda `1px solid #e2e8f0`

### 4.3 Estilos padrão
```javascript
const cardStyle = { padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, minWidth: 200 };
const btnStyle = { padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const btnSecStyle = { ...btnStyle, background: '#4a90a4' };
const btnDangerStyle = { ...btnStyle, background: '#ef4444' };
```

### 4.4 Páginas com submenu (Cadastro, Reembolso, Notificação)
- Abas horizontais no topo (tab: query param `?tab=xxx`)
- Submenu lateral (Layout) apenas com itens principais; demais abas ficam na própria página
- Ex.: Notificação: submenu só "Cadastro"; Alertas, Vincular usuário, etc. são abas na NotificacaoPage

---

## 5. ESTRUTURA DE ROTAS E API

### 5.1 Convenção de rotas
- Plural e kebab-case: `/notificacao/cadastro`, `/notificacao/alertas`, `/notificacao/vinculos-usuario`
- **Vincular usuário (Notificação↔Usuario):** `/vinculos-usuario` (não `/vinculos` — esse é para UsuarioDevice)

### 5.2 Padrão CRUD
- `GET /recurso` ou `GET /recurso?params` — listar
- `POST /recurso` — criar
- `PUT /recurso/:id` — atualizar
- `DELETE /recurso/:id` — excluir

### 5.3 Rotas específicas do módulo Notificação
| Rota | Descrição |
|------|-----------|
| `GET/POST /notificacao/cadastro` | Notificações por empresa |
| `GET/POST/PUT/DELETE /notificacao/alertas` | Tipos de alerta (TipoAlerta) |
| `GET/POST /notificacao/vinculos-usuario` | Vínculo TipoAlerta ↔ Usuario |
| `DELETE /notificacao/vinculos-usuario/:id` | Excluir vínculo |

---

## 6. MODELO DE DADOS — ENTIDADES CRÍTICAS

### 6.1 NotificacaoUsuario (Vincular usuário)
- **Tabela:** `notificacao_usuario`
- **Campos:** `notificacao_usuario_id`, `tipo_alerta_id`, `usuario_id`
- **Relacionamentos:** TipoAlerta (N:1), Usuario (N:1)
- **Constraint:** UNIQUE(tipo_alerta_id, usuario_id)

### 6.2 Diferença entre entidades de notificação
| Entidade | Uso |
|----------|-----|
| **Notificacao** | Configuração por empresa (texto, email, site, celular) |
| **TipoAlerta** | Tipo de alerta (descrição, tempo, notificar admins, imagem) — referenciado em Vincular usuário |
| **NotificacaoUsuario** | Vínculo TipoAlerta ↔ Usuario |
| **UsuarioDevice** | Vínculo Usuario ↔ Device (push) — legado, diferente de Vincular usuário |

### 6.3 Enums do domínio (consultar ENGENHARIA_REVERSA)
- **Perfil:** 1=AdminGX2, 2=AdminEmpresa, 3=Coordenador, 4=Colaborador, 5=GestãoProjetos
- **Situação apontamento:** 1=Cadastrado, 2=Cancelado, 3=Aprovado
- **EventoTipo:** 1=Feriado, 2=Férias, 3=Férias Coletivas, 4=Período Reduzido, 5=Outro, 6=Atestado
- **Abrangência:** 1=Sistema, 2=Empresa, 3=Usuario

---

## 7. CHECKLIST ANTES DE IMPLEMENTAR

- [ ] Consultei `ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md` para a feature?
- [ ] Há imagens de referência? Se sim, descrevi layout, labels e fluxos antes de codar?
- [ ] Confirmei entidades e relacionamentos (não assumi nomes por similaridade)?
- [ ] Verifiquei se o termo tem significado específico na tabela de clareza semântica?
- [ ] Segui os padrões de UI (tela inicial, formulário, estilos)?
- [ ] Rotas seguem convenção (plural, kebab-case, nome correto)?
- [ ] Registrei novo modelo em `backend/src/models/index.ts` (import, associações, export)?
- [ ] Criei tabela no `backend/src/index.ts` se for entidade nova (CREATE TABLE IF NOT EXISTS)?

---

## 8. ARMADILHAS COMUNS (EVITAR)

1. **"Vincular usuário" ≠ UsuarioDevice** — É NotificacaoUsuario (TipoAlerta + Usuario).
2. **"Notificação" no grid** — Mostrar `tipoAlertaDescricao`, não `notificacaoTexto`.
3. **Página vs aba** — Tipo de Reembolso tem rota própria (`/tipo-reembolso`); Vincular usuário é aba em Notificação.
4. **Botão "+ Novo" vs "+"** — "+ Novo" abre formulário; "+" circular pode adicionar direto se campos preenchidos.
5. **Labels em português** — Manter: "Confirmar", "Fechar", "Colaborador", "Notificação", "Selecione".

---

## 9. ESTRUTURA DE ARQUIVOS

```
refatorado_20250218/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Um controller por domínio
│   │   ├── models/        # Sequelize models
│   │   ├── routes/       # Rotas Express
│   │   └── index.ts      # CREATE TABLE, ALTER TABLE
│   └── ...
├── frontend/
│   └── src/
│       ├── pages/         # Uma página por rota principal
│       ├── components/    # Layout, etc.
│       └── services/     # api.ts (axios)
└── AGENTE_REFATORACAO_ORIENTACAO.md  # Este arquivo
```

---

## 10. QUANDO HOUVER IMAGENS DE REFERÊNCIA

Antes de implementar:
1. Descreva o layout (campos, ordem, labels)
2. Identifique título da tela e do formulário
3. Liste botões e ações (Confirmar, Fechar, +, Editar, Excluir)
4. Confirme quais entidades/dados aparecem em cada campo
5. Implemente conforme a descrição — não invente variações

---

## 11. EXEMPLO DE PROMPT COMPLETO PARA NOVA FEATURE

Ao solicitar implementação, inclua:

```
Refatore [nome da feature]. 
- Consultar ENGENHARIA_REVERSA_KB_REGISTRO_HORARIO.md
- [Se houver] Imagens em [caminho]: [breve descrição do layout]
- Entidades: [lista com relacionamentos]
- Padrão UI: tela inicial (campos + botão +) + formulário (Confirmar/Fechar) + grid
- Rotas: [lista de rotas]
- Atenção: [termos ambíguos e seu significado correto]
```

---

*Documento gerado com base no processo de refatoração que levou à versão atual. Atualizar conforme novas lições aprendidas.*
