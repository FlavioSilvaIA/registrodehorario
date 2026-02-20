# UI/UX Auditoria — GX2 AI React UIUX Modernizer

| Campo | Valor |
|-------|-------|
| **Versão** | v1 |
| **Data/Hora de Execução** | 2025-02-18 |
| **Projeto analisado** | projeto completo _18022026/frontend |
| **Agente executor** | GX2_AI_React_UIUX_Modernizer_Vite_Lucide |
| **Escopo** | Frontend completo (React 18 + Vite + lucide-react) |
| **Identidade visual** | GX2 (turquesa #35b6ad, azul marinho #1b2948) |

---

## 1. Mapeamento de Rotas/Telas

| Rota | Componente | Descrição |
|------|-------------|-----------|
| `/login` | LoginPage | Autenticação |
| `/` | DashboardPage | Home, horas hoje, apontamento aberto, projetos |
| `/apontamento` | ApontamentoPage | Registrar entrada/saída (automático ou manual) |
| `/lista-apontamento` | ListaApontamentoPage | Lista com filtros e resumo |
| `/cadastro` | CadastroPage | CRUD (Centro Custo, Empresa, Equipe, Evento, Log, Projeto, Usuário, etc.) |
| `/reembolso` | ReembolsoPage | Reembolsos |
| `/tipo-reembolso` | TipoReembolsoPage | Tipos de reembolso |
| `/notificacao` | NotificacaoPage | Cadastro de notificações |
| `/parametros` | ParametrosPage | Parâmetros do sistema |
| `/relatorio` | RelatorioPage | Relatórios (colaborador, consolidados, etc.) |

---

## 2. Mapeamento de Componentes e Estilos

### Componentes base existentes
- **Button** (`components/ui/Button.tsx`) – variantes primary/secondary/ghost/danger, sizes sm/md/lg
- **FormField** (`components/ui/FormField.tsx`) – FormFieldLabel, FormInput com label/erro/helper
- **Card** (`components/ui/Card.tsx`) – container padronizado
- **LogoGX2** (`components/ui/LogoGX2.tsx`) – variantes light/dark

### Tokens CSS (index.css)
- **Cores:** `--gx2-turquesa`, `--gx2-azul-marinho`, `--gx2-branco`, `--gx2-cinza-*`, `--gx2-danger`, `--gx2-success`, `--gx2-warning`
- **Spacing:** `--spacing-1` a `--spacing-12`
- **Radius:** `--radius-sm`, `--radius-md`, `--radius-lg`
- **Tipografia:** Montserrat (400, 500, 600, 700)

---

## 3. Gaps Identificados (com evidência)

### A) Tipografia

| Gap | Severidade | Arquivo | Linha | Evidência |
|-----|------------|---------|-------|-----------|
| Labels de formulário com fontSize 12 em alguns lugares, inconsistente | P2 | CadastroPage, vários | - | Alguns labels sem `color: var(--gx2-texto-secundario)` |
| Títulos de página variam (20, 24) sem escala definida | P2 | DashboardPage, ListaApontamentoPage | 44, 98 | `fontSize: 20` direto |
| Menu sidebar: fontSize 14 no item principal, 12 no submenu – OK | - | Layout.tsx | 184 | Consistente |
| h3 sem peso/tamanho padronizado | P2 | DashboardPage | 48, 51, 70 | `h3` sem estilo explícito |

### B) Cores e consistência

| Gap | Severidade | Arquivo | Linha | Evidência |
|-----|------------|---------|-------|-----------|
| **#1976d2** (azul Material) em vez de token primário | P0 | DashboardPage | 59, 64 | Links "Registrar saída/entrada" |
| **#1976d2** em ApontamentoPage | P0 | ApontamentoPage | 273, 278, 301, 305, 381, 386 | Botões e links |
| **#c00** em vez de `var(--gx2-danger)` | P0 | ApontamentoPage | 269, 297, 377 | Mensagens de erro |
| **#f0f0f0** em vez de `var(--gx2-cinza-200)` | P1 | ApontamentoPage | 154, 291, 317 | Botões secundários |
| **#fff** em vez de `var(--gx2-branco)` | P1 | ApontamentoPage | 273, 301, 381 | Botões |
| **#ddd**, **#e2e8f0**, **#f1f5f9** hardcoded | P1 | CadastroPage, ReembolsoPage | 674, 682, 696, 188, etc. | Inputs e bordas |
| **#2d3e50**, **#e5e7eb**, **#333** em NotificacaoPage | P1 | NotificacaoPage | 219 | Submenu tabs |
| **#475569**, **#94a3b8** em vez de tokens | P1 | NotificacaoPage, ParametrosPage | 356, 390, 453, 528, 173 | Headers e empty state |
| **#22c55e**, **#ef4444**, **#dc2626**, **#166534**, etc. | P1 | CadastroPage, ReembolsoPage | 163, 699, 941, 948, 1232, etc. | Success/danger – usar tokens |
| LogoGX2 usa **#ffffff** e **#1b2948** hardcoded | P1 | LogoGX2.tsx | 13 | Deveria usar `var(--gx2-branco)`, `var(--gx2-azul-marinho)` |

### C) Componentização

| Gap | Severidade | Arquivo | Linha | Evidência |
|-----|------------|---------|-------|-----------|
| CadastroPage usa `button` nativo em vez de `Button` | P1 | CadastroPage | 132, 699, 821, etc. | "+ Novo", "Filtrar", ações |
| ApontamentoPage usa `button`/`input` inline sem FormField | P1 | ApontamentoPage | 154, 273, 278 | Formulários manuais |
| Tabelas sem padrão thBase (fontSize 12, color secundário, borderBottom) | P1 | CadastroPage, RelatorioPage | 704-707, etc. | `<th>` com padding apenas |
| Ações Editar/Excluir: botões circulares sem tooltip | P2 | CadastroPage | 67-68 | `btnEditIcon`, `btnDeleteIcon` – falta tooltip |
| CadastroPage define FormInput local em vez de usar FormField | P2 | CadastroPage | 71-95 | Duplicação de lógica |
| Falta componente Alert para mensagens (erro/sucesso/info) | P2 | Várias páginas | - | `<p>` ou `<div>` ad hoc |
| Falta componente Badge/Status padronizado | P2 | CadastroPage | 835, 1035 | Tags inline com estilos variados |

### D) Hierarquia e layout

| Gap | Severidade | Arquivo | Linha | Evidência |
|-----|------------|---------|-------|-----------|
| Loading genérico "Carregando..." sem skeleton | P2 | DashboardPage, App | 40, 22 | `<div style={{ padding: 20 }}>` |
| Empty state inconsistente | P2 | CadastroPage, ParametrosPage | 721, 173 | "Nenhum registro" vs "Nenhum parâmetro cadastrado" |
| Estrutura de página OK (Header + conteúdo) | - | Layout | - | Sidebar + topbar + main |
| Espaçamento: alguns valores fixos (20, 24) em vez de tokens | P2 | DashboardPage | 46, 47, 51 | `marginBottom: 24`, `padding: 20` |

### E) Ícones (lucide-react)

| Gap | Severidade | Arquivo | Linha | Evidência |
|-----|------------|---------|-------|-----------|
| Layout usa ícones 18/16 – OK | - | Layout.tsx | 166, 168 | Consistente |
| Ações de tabela: ícones ou texto "×" sem padrão | P2 | CadastroPage | 1038 | Botão "×" para remover |
| Falta tooltip em botões de ação (Editar, Excluir) | P2 | CadastroPage | 67-68 | `title` não presente |
| Emoji "🕐" em ApontamentoPage | P2 | ApontamentoPage | 189, 212 | Preferir ícone Lucide (Clock) |

### F) Estados modernos

| Gap | Severidade | Arquivo | Linha | Evidência |
|-----|------------|---------|-------|-----------|
| Button sem estados hover/focus visíveis | P2 | Button.tsx | - | Apenas baseStyle, sem :hover |
| Input sem estado focus explícito (index.css tem focus-visible global) | - | index.css | 59-66 | OK |
| Sem skeleton/loading visual em listas | P2 | ListaApontamentoPage, CadastroPage | - | Apenas "Carregando..." |
| Sem toast/snackbar para feedback de ações | P2 | CadastroPage, etc. | - | `alert()` ou estado local |
| Feedback de sucesso em modais (ex: "✓ Foto carregada") | - | CadastroPage | 1026 | Inline, OK |

---

## 4. Resumo por Severidade

| Severidade | Quantidade | Descrição |
|------------|------------|-----------|
| **P0** | 2 | Cores hex em vez de tokens (links/botões primários, erro) – quebra identidade |
| **P1** | 12 | Cores hex, componentes não reutilizados, tabelas sem padrão |
| **P2** | 14 | Tipografia, tooltips, loading, empty state, hover |

---

## 5. Conclusão da Auditoria

O projeto já possui:
- Design System parcial (tokens em index.css)
- Componentes base (Button, FormField, Card, LogoGX2)
- Identidade GX2 definida (turquesa, azul marinho)
- Layout consistente (sidebar + topbar)

Principais gaps:
1. **Cores hardcoded** em várias páginas (#1976d2, #c00, #f0f0f0, #ddd, etc.)
2. **CadastroPage e ApontamentoPage** não usam Button/FormField em vários pontos
3. **Tabelas** sem padrão thBase
4. **Loading/Empty state** sem padrão
5. **Tooltips** ausentes em ações de tabela

---

## Histórico de Execuções

| Versão | Data | Observação |
|--------|------|------------|
| v1 | 2025-02-18 | Primeira auditoria pelo agente 11 (GX2_AI_React_UIUX_Modernizer). Relatório incluído em reportes/ conforme REGRA_VERSIONAMENTO_RELATORIOS. |
