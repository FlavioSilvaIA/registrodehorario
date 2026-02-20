# AUDITORIA UI/UX — INVENTÁRIO E DIAGNÓSTICO
## Etapa A — Análise sem alteração de código

**Versão:** v1  
**Data/Hora de Execução:** 18/02/2026  
**Projeto analisado:** v2_14/refatorado_20250218/frontend  
**Agente executor:** Agente_UIUX_Governance_Executor  
**Design System usado:** Nenhum definido — estilos inline e constantes locais

---

## 1) MAPEAMENTO DE TELAS E ROTAS

| Rota | Página | Componente principal |
|------|--------|------------------------|
| /login | LoginPage | Form login/senha |
| / | DashboardPage | Cards (horas, apontamento aberto, projetos) |
| /apontamento | ApontamentoPage | Form entrada/saída, geolocation |
| /lista-apontamento | ListaApontamentoPage | Filtros, tabela, resumo, exportar |
| /cadastro | CadastroPage | Tabs CRUD (centro-custo, empresa, equipe, etc.) |
| /reembolso | ReembolsoPage | Listagem, filtros, aprovar/negar |
| /tipo-reembolso | TipoReembolsoPage | CRUD tipo reembolso |
| /notificacao | NotificacaoPage | Mensagens, devices, vínculos |
| /parametros | ParametrosPage | Parâmetros do sistema |
| /relatorio | RelatorioPage | Submenu relatórios |

## 2) MAPEAMENTO DE COMPONENTES

| Componente | Localização | Uso |
|------------|-------------|-----|
| Layout | components/Layout.tsx | Sidebar + topbar + Outlet |
| FormInput | CadastroPage (interno) | Input com label, reutilizado em tabs |
| TabelaCRUD | CadastroPage (interno) | Grid + formulário inline |
| — | — | **Não há componentes Button, Input, TableActions etc. centralizados** |

## 3) INCONSISTÊNCIAS E VIOLAÇÕES IDENTIFICADAS

### 3.1 Botões — Inconsistência de variantes e posições

| Local | Problema | Evidência |
|-------|----------|-----------|
| LoginPage | Botão único com `#1976d2`; sem variante secundária | `style={{ background: '#1976d2', ... }}` |
| CadastroPage | `btnStyle` (#22c55e), `btnSecStyle` (#4a90a4), `btnDangerStyle` (#ef4444) — cores distintas | `const btnStyle = { background: '#22c55e' }` |
| Layout | Botão "Sair" com `background: transparent`, `border: 1px solid #ddd` | `style={{ marginLeft: 8, padding: '4px 12px', ... }}` |
| ReembolsoPage | Mesmas constantes `btnStyle`, `btnSecStyle`, `btnDangerStyle` — duplicadas | `const btnStyle = { background: '#22c55e' }` |
| ApontamentoPage | Botões com cores inline (ex.: `#22c55e`, `#ef4444`) | `style={{ background: '#22c55e', ... }}` |
| ListaApontamentoPage | Botões com estilos inline | `style={{ padding: '8px 16px', background: '#22c55e', ... }}` |

**Resumo:** Cores primárias diferentes (LoginPage usa `#1976d2`; demais usam `#22c55e`). Sem componente Button unificado.

### 3.2 Formulários — Padrões variados

| Local | Problema | Evidência |
|-------|----------|-----------|
| LoginPage | Label + input sem wrapper; sem helper text | `label` + `input` direto |
| CadastroPage | FormInput com label; sem `required` visual; sem mensagem de erro | `FormInput` |
| ApontamentoPage | Labels e placeholders; `select` com estilos inline | `style={{ padding: 8, ... }}` |
| ReembolsoPage | Mesmo padrão; sem `aria-labels` | — |
| ParametrosPage | Inputs simples | — |

**Resumo:** Sem FormField padrão (label + input + error + helper). Altura de inputs variável (ex.: 10px vs 8px padding).

### 3.3 Listagens/Grids/Tabelas

| Local | Problema | Evidência |
|-------|----------|-----------|
| CadastroPage | Ações por linha: botões circulares (Editar/Excluir) com ícones; sem confirmação de exclusão | `btnEditIcon`, `btnDeleteIcon` |
| ReembolsoPage | Ações: Aprovar/Negar sem confirmação | `aprovar(id)`, `negar(id)` direto |
| ListaApontamentoPage | Tabela sem empty state explícito; loading = "Carregando..." | — |
| DashboardPage | Lista de projetos sem empty state | `projetos.map(...)` sem `length === 0` |

**Resumo:** Sem TableActions padronizado. Sem confirmação para exclusão (dialog). Empty states inconsistentes.

### 3.4 Hierarquia e layout

| Local | Problema | Evidência |
|-------|----------|-----------|
| Geral | `h2` e `h3` com tamanhos inline (ex.: `fontSize: 20`); sem escala tipográfica | `h2 style={{ marginBottom: 24, fontSize: 20 }}` |
| Layout | Sidebar com `linear-gradient(180deg, #2d3e50 0%, #1a252f 100%)`; topbar `#fff` | Cores hardcoded |
| Cards | `cardStyle` com `padding: 20`, `borderRadius: 8`, `boxShadow` — duplicado em CadastroPage e ReembolsoPage | `const cardStyle = { ... }` |
| App | Loading "Carregando..." com `style={{ padding: 20 }}` | Sem skeleton |

**Resumo:** Sem tokens de design (cores, tipografia, spacing). Cards sem componente reutilizável.

### 3.5 Conteúdo e microcopy

| Local | Problema | Evidência |
|-------|----------|-----------|
| Botões | "Salvar" vs "Confirmar" vs "Enviar" — inconsistente | CadastroPage: "Salvar"; ReembolsoPage: "Enviar" |
| Exclusão | Sem confirmação "Tem certeza?" | — |
| Loading | "Carregando..." vs "Entrando..." | LoginPage: "Entrando..."; App: "Carregando..." |
| Empty | "Nenhum apontamento em aberto" — OK; outras listas sem mensagem | DashboardPage |

### 3.6 Acessibilidade e UX

| Local | Problema | Evidência |
|-------|----------|-----------|
| Geral | Sem `aria-label` em botões de ícone | `btnEditIcon`, `btnDeleteIcon` |
| Geral | Sem focus ring visível | Estilos inline |
| Geral | `input` sem `id` associado a `label` via `htmlFor` | LoginPage, CadastroPage |
| Layout | Avatar clicável sem `role="button"` ou `aria-label` | `onClick` em div |
| ReembolsoPage | `alert()` para validação — não acessível | `alert('Preencha tipo de reembolso e valor.')` |
| Exclusão | Sem confirmação — risco de exclusão acidental | — |

### 3.7 Responsividade

| Local | Problema | Evidência |
|-------|----------|-----------|
| Layout | Sidebar fixa 240px; sem collapse em mobile | `width: 240` |
| LoginPage | `maxWidth: 400` — OK para mobile | — |
| CadastroPage | `minWidth: 200` em inputs; grid sem breakpoints | — |
| ListaApontamentoPage | Tabela pode overflow em telas pequenas | — |

---

## 4) COMPONENTES DUPLICADOS

| Padrão | Onde aparece | Proposta |
|--------|--------------|----------|
| `cardStyle` | CadastroPage, ReembolsoPage | Centralizar em componente Card |
| `inputStyle` | CadastroPage, ReembolsoPage | Centralizar em FormField |
| `btnStyle`, `btnSecStyle`, `btnDangerStyle` | CadastroPage, ReembolsoPage | Centralizar em Button com variants |
| `acoesCellStyle` | CadastroPage, ReembolsoPage | Centralizar em TableActions |
| `btnEditIcon`, `btnDeleteIcon` | CadastroPage | Centralizar em TableActions |

---

## 5) RESUMO DE VIOLAÇÕES

| Categoria | Quantidade | Gravidade |
|------------|------------|-----------|
| Botões inconsistentes | 6+ arquivos | Média |
| Formulários sem padrão | 5+ páginas | Média |
| Sem confirmação de exclusão | CadastroPage | Alta |
| Sem Design System / tokens | Todo o projeto | Alta |
| Acessibilidade (aria, focus, id/label) | 10+ pontos | Média |
| Componentes duplicados | 5 padrões | Média |
| Empty/Loading states | Parcial | Baixa |

---

## 6) DESIGN SYSTEM PROPOSTO (MÍNIMO)

Para aprovação antes de Etapa B:

- **Cores:** primary `#22c55e`, secondary `#4a90a4`, danger `#ef4444`, neutral `#333`, `#666`, `#f5f5f5`
- **Tipografia:** `font-family: system-ui`; sizes: 12, 14, 16, 18, 20, 24
- **Spacing:** base 4px; scale 8, 12, 16, 20, 24
- **Radius:** sm 4, md 8
- **Componentes:** Button (primary, secondary, ghost, danger), FormField, Card, TableActions

---

## Histórico de Execuções

| Versão | Data | Observação |
|--------|------|------------|
| v1 | 18/02/2026 | Etapa A — Inventário e diagnóstico inicial |

---

*Documento gerado pelo Agente_UIUX_Governance_Executor. Etapa A concluída. Aguardando Etapa B (plano de correção) e aprovação para execução.*
