# RELATÓRIO UI/UX — MÓDULO GENÉRICO
## Projeto: Registro Horário (GX2) — Governança de Design System

**Documento:** projeto_outros__ui  
**Versão:** v1  
**Data:** 18/02/2026  
**Projeto analisado:** projeto completo _18022026/frontend  
**Escopo:** Inventário, Design System, Heurísticas, Gate de aprovação e itens UI-FIX/UI-ENH

---

==================================================================
1) INVENTÁRIO DE UI
==================================================================

## 1.1 Padrões de botões

| Local | Labels | Cores | Tamanhos | Variações |
|-------|--------|-------|----------|-----------|
| Button.tsx | — | primary (turquesa), secondary, ghost, danger, success | sm, md, lg | 5 variantes |
| CadastroPage | Salvar, Cancelar, Filtrar, Adicionar, Exportar, Importar, etc. | success, turquesa, danger | md | Button + btnEditIcon, btnDeleteIcon nativos |
| ApontamentoPage | Registrar entrada/saída, Salvar registro manual | primary, ghost | md | Button |
| ReembolsoPage | Aprovar, Negar, Enviar | success, danger, turquesa | md | Button |
| NotificacaoPage | Confirmar, Fechar, Vincular | inline (btnStyle, btnSecStyle) | — | Botões nativos |
| Layout | Sair | ghost | sm | Button |

**Duplicações:** NotificacaoPage, TipoReembolsoPage, ParametrosPage, RelatorioPage ainda usam estilos inline (btnStyle, btnSecStyle) em vez de Button.

## 1.2 Tipografia

| Propriedade | Valor atual |
|-------------|-------------|
| font-family | Montserrat (index.css, index.html) |
| Pesos | 400, 500, 600, 700 (Google Fonts) |
| Escala | 12, 14, 18, 20, 24 (inline variados) |
| line-height | 1.5 (body) |
| Cores de texto | --gx2-texto, --gx2-texto-secundario |

**Observação:** Escala tipográfica não está formalizada em tokens.

## 1.3 Ícones

| Local | Biblioteca | Estilo | Tamanhos |
|-------|------------|--------|----------|
| Layout | Lucide React | Outline | 20, 24 |
| ListaApontamentoPage | Lucide | Outline | 48 (EmptyState) |
| Toast, Alert | Lucide | Outline | 16, 20 |
| CadastroPage (Editar/Excluir) | Unicode (✎, 🗑) | — | — |
| NotificacaoPage | Unicode (✎, 🗑) | — | — |

**Inconsistência:** CadastroPage e NotificacaoPage usam caracteres Unicode em vez de ícones Lucide.

## 1.4 Layout e espaçamento

| Propriedade | Valor |
|-------------|-------|
| Tokens de spacing | --spacing-1 a --spacing-12 (4, 8, 12, 16, 20, 24, 32, 40, 48) |
| Radius | --radius-sm (4), --radius-md (8), --radius-lg (12) |
| Shadow | 0 1px 4px, 0 2px 8px (inline) |
| Grid | Flex ad hoc; sem grid system formal |

## 1.5 Componentes reutilizados x duplicados

| Componente | Reutilizado | Duplicado |
|------------|-------------|-----------|
| Button | CadastroPage, ApontamentoPage, ReembolsoPage, Layout | — |
| FormField (FormInput, FormSelect, FormTextarea) | ApontamentoPage, LoginPage (parcial) | CadastroPage usa FormInput local; NotificacaoPage usa inputs manuais |
| Card | — | cardStyle duplicado em CadastroPage, ReembolsoPage, DashboardPage |
| Skeleton | ListaApontamentoPage | — |
| EmptyState | ListaApontamentoPage | — |
| Toast | main.tsx (ToastProvider) | useToast ainda não usado em todas as páginas |
| Alert | — | Não utilizado; erros exibidos como `<p style={{ color: danger }}>` |

## 1.6 Estados (loading, empty, error)

| Estado | Onde | Implementação |
|--------|------|---------------|
| Loading | PrivateRoute, DashboardPage | "Carregando..." texto simples |
| Loading | ListaApontamentoPage | SkeletonRow |
| Empty | ListaApontamentoPage | EmptyState |
| Empty | DashboardPage (projetos) | Lista vazia sem EmptyState |
| Empty | CadastroPage (tabelas) | "Nenhum X encontrado" texto |
| Error | ApontamentoPage, ReembolsoPage | `<p style={{ color: danger }}>` |
| Error | NotificacaoPage | alert() |

## 1.7 Microcopy

| Contexto | Padrão atual |
|----------|--------------|
| Salvar formulário | Salvar, Confirmar |
| Cancelar | Cancelar, Fechar |
| Excluir | Excluir, com confirm() |
| Submissão de pedido | Enviar (Reembolso) |
| Validação | alert() em NotificacaoPage; estado de erro em outras |

---

==================================================================
2) DESIGN SYSTEM MÍNIMO (PROPOSTO / JÁ APLICADO)
==================================================================

## 2.1 Tokens (index.css — aplicados)

| Categoria | Tokens |
|-----------|--------|
| Cores primárias | --gx2-turquesa, --gx2-azul-marinho, --gx2-branco |
| Secundárias | --gx2-amarelo, --gx2-azul-ciano, --gx2-turquesa-claro |
| Neutros | --gx2-cinza-100 a 700, --gx2-texto, --gx2-texto-secundario |
| Semânticas | --gx2-danger, --gx2-success, --gx2-warning, *_bg |
| Spacing | --spacing-1 a --spacing-12 |
| Radius | --radius-sm, --radius-md, --radius-lg |

## 2.2 Componentes base (existentes)

| Componente | Status | Local |
|------------|--------|-------|
| Button | ✅ | components/ui/Button.tsx |
| FormField (Input, Select, Textarea) | ✅ | components/ui/FormField.tsx |
| Card | ✅ | components/ui/Card.tsx |
| Alert | ✅ | components/ui/Alert.tsx |
| Skeleton | ✅ | components/ui/Skeleton.tsx |
| EmptyState | ✅ | components/ui/EmptyState.tsx |
| Toast | ✅ | components/ui/Toast.tsx |
| LogoGX2 | ✅ | components/ui/LogoGX2.tsx |

## 2.3 Componentes pendentes de adoção

- **TableActions:** Editar/Excluir padronizado com confirmação — ainda inline em CadastroPage, NotificacaoPage.
- **Card:** CadastroPage, ReembolsoPage, DashboardPage usam cardStyle local em vez do componente Card.

---

==================================================================
3) HEURÍSTICAS & TENDÊNCIAS MODERNAS
==================================================================

| Heurística | Status | Observação |
|------------|--------|------------|
| Hierarquia clara (título, CTA) | Parcial | Títulos com fontSize 20; CTAs com Button |
| Legibilidade (menu ≥ 14px) | OK | Layout com ícones Lucide |
| Loading (skeleton) | Parcial | ListaApontamentoPage usa; DashboardPage e PrivateRoute não |
| Empty state informativo | Parcial | ListaApontamentoPage usa EmptyState; CadastroPage e DashboardPage não |
| Toast/snackbar para ações | Parcial | ToastProvider ativo; useToast não usado em NotificacaoPage, ReembolsoPage |
| Confirmação em delete | OK | confirm() em CadastroPage, NotificacaoPage |
| Estados disabled e validação | OK | FormField com error |
| Consistência de CTAs | OK | Button com variantes |
| Substituir alert() | Pendente | NotificacaoPage usa alert() em validações |

---

==================================================================
4) GATE HUMANO — LISTA DE ITENS PARA APROVAÇÃO
==================================================================

Qualquer mudança de UI/UX deve passar por aprovação humana. Itens com IDs:

## 4.1 UI-FIX — Correções obrigatórias

| ID | Categoria | Onde | Problema | Proposta | Impacto | Risco | Critério de aceite |
|----|-----------|------|----------|----------|---------|-------|---------------------|
| **UI-FIX-011** | Estados | NotificacaoPage | alert() em validações (descrição, vínculos) | Substituir por useToast().error() ou estado de erro no formulário | Médio | P1 | Nenhum alert() em NotificacaoPage |
| **UI-FIX-012** | Layout | CadastroPage, ReembolsoPage, DashboardPage | cardStyle duplicado | Usar componente Card de components/ui | Baixo | P2 | Card importado e utilizado |
| **UI-FIX-013** | Botões | NotificacaoPage, TipoReembolsoPage, ParametrosPage, RelatorioPage | Botões nativos com estilos inline | Trocar por Button | Médio | P2 | Todos os botões principais usam Button |
| **UI-FIX-014** | Estados | PrivateRoute, DashboardPage | "Carregando..." texto | Usar Skeleton ou SkeletonCard | Baixo | P2 | Loading com Skeleton |
| **UI-FIX-015** | Ícones | CadastroPage, NotificacaoPage | Editar/Excluir com Unicode (✎, 🗑) | Usar ícones Lucide (Pencil, Trash2) | Baixo | P2 | Ícones Lucide nos botões de ação |

## 4.2 UI-ENH — Melhorias opcionais

| ID | Categoria | Onde | Problema | Proposta | Impacto | Risco | Critério de aceite |
|----|-----------|------|----------|----------|---------|-------|---------------------|
| **UI-ENH-009** | Estados | DashboardPage, CadastroPage | Listas vazias sem EmptyState | Usar EmptyState quando array.length === 0 | Baixo | P2 | EmptyState em listas vazias |
| **UI-ENH-010** | Feedback | ReembolsoPage, CadastroPage, ApontamentoPage | Sucesso/erro apenas em estado local | Usar useToast().success/error após ações | Médio | P2 | Toast em operações CRUD |
| **UI-ENH-011** | Formulários | NotificacaoPage | Inputs e selects manuais | Migrar para FormInput, FormSelect, FormTextarea | Médio | P2 | FormField em todos os formulários |
| **UI-ENH-012** | A11y | Geral | aria-label em botões de ação | Garantir aria-label em Editar/Excluir e ações sem texto | Baixo | P2 | Botões com aria-label |

---

==================================================================
5) RESUMO DO PACOTE
==================================================================

| Tipo | Quantidade | Prioridade sugerida |
|------|------------|---------------------|
| UI-FIX | 5 | UI-FIX-011 (P1), demais P2 |
| UI-ENH | 4 | Todos P2 |

---

==================================================================
6) ORDEM DE EXECUÇÃO RECOMENDADA
==================================================================

1. **UI-FIX-011** — Substituir alert() em NotificacaoPage
2. **UI-FIX-013** — Button em NotificacaoPage, TipoReembolsoPage, ParametrosPage, RelatorioPage
3. **UI-FIX-012** — Card em CadastroPage, ReembolsoPage, DashboardPage
4. **UI-FIX-014** — Skeleton em loading (PrivateRoute, DashboardPage)
5. **UI-FIX-015** — Ícones Lucide em Editar/Excluir
6. **UI-ENH-010** — useToast em operações CRUD
7. **UI-ENH-011** — FormField em NotificacaoPage
8. **UI-ENH-009** — EmptyState em listas vazias
9. **UI-ENH-012** — aria-label em botões de ação

---

==================================================================
7) PARA EXECUTAR
==================================================================

Responda com um dos formatos abaixo para aprovar a execução:

- **Exemplo 1:** `APROVAR: UI-FIX-011, UI-FIX-013`
- **Exemplo 2:** `APROVAR TODOS OS UI-FIX`
- **Exemplo 3:** `APROVAR TODOS OS UI-FIX E UI-ENH`
- **Exemplo 4:** `APROVAR: UI-FIX-011, UI-ENH-010, UI-ENH-011`

Somente os itens aprovados serão implementados.

---

==================================================================
8) RELATÓRIOS VERSIONADOS (REGRA OBRIGATÓRIA)
==================================================================

Toda execução deve gerar relatórios em /reportes:

- `uiux_plano_aprovacao_vX.md` — plano de aprovação (este documento complementa)
- `uiux_execucao_vX.md` — evidências de execução

Nunca sobrescrever versões anteriores.

---

*Documento gerado conforme Módulo Genérico — UI/UX & Design System Governance. Projeto: projeto completo _18022026.*
