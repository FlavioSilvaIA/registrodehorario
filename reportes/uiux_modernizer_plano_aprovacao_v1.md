# UI/UX Plano de Aprovação — GX2 AI React UIUX Modernizer

| Campo | Valor |
|-------|-------|
| **Versão** | v1 |
| **Data/Hora de Execução** | 2025-02-18 |
| **Projeto analisado** | projeto completo _18022026/frontend |
| **Agente executor** | GX2_AI_React_UIUX_Modernizer_Vite_Lucide |
| **Escopo** | Frontend completo |
| **Identidade visual** | GX2 (tokens existentes em index.css) |

---

## Proposta de Padronização (resumo)

### Cores
- **Um CTA primário:** `var(--gx2-turquesa)` para ações principais
- **Links:** `var(--gx2-turquesa)` ou `var(--gx2-turquesa-claro)` (não #1976d2)
- **Erro:** `var(--gx2-danger)` (não #c00 ou #dc2626)
- **Paleta semântica:** success, warning, danger já definidos em tokens

### Tipografia
- **Menu:** ≥ 14px (já OK)
- **Body:** 14–16px
- **Títulos:** 20–24px (h2: 20, h3: 16–18)
- **Labels:** 12px, `color: var(--gx2-texto-secundario)`

### Ícones
- **Tamanho:** 18/20 para ações, 16 para detalhes
- **Ações:** tooltip + estado hover (ex: Editar, Excluir)

### Componentes base
- Button, FormField, Card (já existem)
- **TableActions:** botões Editar/Excluir padronizados com tooltip
- **Alert:** mensagem erro/sucesso/info
- **Badge/Status:** tags semânticas (opcional)

---

## Backlog por IDs

### PACOTE QUICKWINS (correções rápidas)

| ID | Tipo | Tela(s) | Problema | Proposta | Impacto | Risco | Critério de aceite |
|----|------|---------|----------|----------|---------|-------|---------------------|
| `UI-FIX-001` | FIX | DashboardPage | Links #1976d2 | Usar `var(--gx2-turquesa)` | Alto | Baixo | Links com cor primária GX2 |
| `UI-FIX-002` | FIX | ApontamentoPage | #1976d2, #c00, #f0f0f0, #fff | Substituir por tokens | Alto | Baixo | Cores via tokens |
| `UI-FIX-003` | FIX | LogoGX2 | #ffffff, #1b2948 hardcoded | Usar `var(--gx2-branco)`, `var(--gx2-azul-marinho)` | Médio | Baixo | Logo usa tokens |
| `UI-FIX-004` | FIX | CadastroPage | #ddd, #22c55e, #dc2626, etc. | Substituir por tokens | Alto | Baixo | Inputs/bordas/botões com tokens |
| `UI-FIX-005` | FIX | ReembolsoPage | #f8fafc, #22c55e, #f1f5f9 | Substituir por tokens | Médio | Baixo | Cores via tokens |
| `UI-FIX-006` | FIX | NotificacaoPage | #2d3e50, #e5e7eb, #333, #475569 | Substituir por tokens | Médio | Baixo | Submenu e headers com tokens |
| `UI-FIX-007` | FIX | ParametrosPage | #ef4444, #94a3b8 | Substituir por tokens | Baixo | Baixo | Cores via tokens |
| `UI-FIX-008` | FIX | RelatorioPage | (se houver hex) | Substituir por tokens | Baixo | Baixo | Cores via tokens |

### PACOTE MEDIUM (padronização de componentes)

| ID | Tipo | Tela(s) | Problema | Proposta | Impacto | Risco | Critério de aceite |
|----|------|---------|----------|----------|---------|-------|---------------------|
| `UI-FIX-009` | FIX | CadastroPage | Botões nativos | Usar Button (primary/secondary) | Alto | Médio | "+ Novo", "Filtrar", "Salvar" com Button |
| `UI-FIX-010` | FIX | ApontamentoPage | Formulários inline | Usar FormField ou FormInput | Médio | Médio | Labels e inputs padronizados |
| `UI-FIX-011` | FIX | Tabelas (Cadastro, Relatorio, etc.) | Header sem padrão | thBase: fontSize 12, color secundário, borderBottom | Médio | Baixo | Headers consistentes |
| `UI-ENH-001` | ENH | CadastroPage | Ações Editar/Excluir sem tooltip | Adicionar title/tooltip em botões | Médio | Baixo | Hover mostra "Editar"/"Excluir" |
| `UI-ENH-002` | ENH | Button | Sem hover/focus | Adicionar hover (opacity ou background) | Médio | Baixo | Feedback visual ao passar mouse |
| `UI-ENH-003` | ENH | DashboardPage | Cards com padding fixo | Usar Card ou tokens spacing | Baixo | Baixo | padding: var(--spacing-5) |
| `UI-ENH-004` | ENH | ApontamentoPage | Emoji 🕐 | Substituir por ícone Lucide Clock | Baixo | Baixo | Ícone Lucide |

### PACOTE TRANSFORMACIONAL (opcional)

| ID | Tipo | Tela(s) | Problema | Proposta | Impacto | Risco | Critério de aceite |
|----|------|---------|----------|----------|---------|-------|---------------------|
| `UI-ENH-005` | ENH | Global | Loading | Componente Skeleton ou spinner | Médio | Médio | Loading visual consistente |
| `UI-ENH-006` | ENH | Global | Empty state | Componente EmptyState | Médio | Baixo | Mensagem + ícone padronizado |
| `UI-ENH-007` | ENH | Global | Feedback de ações | Toast/Snackbar (substituir alert) | Alto | Médio | Feedback não intrusivo |
| `UI-ENH-008` | ENH | Global | Alert | Componente Alert (erro/sucesso/info) | Médio | Baixo | Mensagens com estilo consistente |

---

## Agrupamento por Pacote

| Pacote | IDs | Esforço |
|--------|-----|---------|
| **QUICKWINS** | UI-FIX-001 a UI-FIX-008 | ~1h |
| **MEDIUM** | UI-FIX-009 a UI-FIX-011, UI-ENH-001 a UI-ENH-004 | ~2h |
| **TRANSFORMACIONAL** | UI-ENH-005 a UI-ENH-008 | ~3h |

---

## Instrução de Aprovação

> **Para executar alterações, responda com um dos formatos abaixo:**
>
> - `APROVAR: UI-FIX-001, UI-FIX-004`
> - `APROVAR TODOS OS FIX`
> - `APROVAR TODOS OS FIX E ENH`
> - `APROVAR PACOTE: QUICKWINS`
> - `APROVAR PACOTES: QUICKWINS, MEDIUM`
> - `APROVAR: UI-FIX-001, UI-FIX-002, UI-FIX-003, UI-FIX-004, UI-FIX-005, UI-FIX-006, UI-FIX-007` (lista específica)

**Sem aprovação explícita, nenhuma alteração será feita no código.**

---

## Histórico de Execuções

| Versão | Data | Observação |
|--------|------|------------|
| v1 | 2025-02-18 | Primeiro plano pelo agente 11. Relatório incluído em reportes/ conforme REGRA_VERSIONAMENTO_RELATORIOS. |
