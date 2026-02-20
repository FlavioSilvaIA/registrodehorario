# PLANO DE CORREÇÃO E MELHORIAS UI/UX
## Etapa B — Pacote de aprovação (NÃO altera código)

**Versão:** v1  
**Data/Hora de Execução:** 18/02/2026  
**Projeto analisado:** v2_14/refatorado_20250218/frontend  
**Agente executor:** Agente_UIUX_Governance_Executor  
**Design System usado:** Proposto (tokens mínimos — ver auditoria v1)

---

## PACOTE FIX — Correções obrigatórias (gaps / bugs visuais / padronização)

| ID | Descrição | Onde ocorre | Impacto | Risco | Proposta de solução | Evidência |
|----|-----------|-------------|---------|-------|---------------------|-----------|
| **FIX-001** | Confirmação antes de exclusão | CadastroPage (TabelaCRUD onExcluir) | Alto | P0 | Adicionar `window.confirm('Tem certeza que deseja excluir?')` antes de chamar API de exclusão | CadastroPage.tsx — fluxo onExcluir sem confirmação |
| **FIX-002** | Confirmação antes de Aprovar/Negar reembolso | ReembolsoPage | Médio | P1 | Adicionar `window.confirm` em aprovar() e negar() | ReembolsoPage.tsx — aprovar(id), negar(id) direto |
| **FIX-003** | Substituir alert() por feedback visual | ReembolsoPage (validação) | Médio | P1 | Trocar `alert('Preencha...')` por estado de erro exibido no formulário | ReembolsoPage.tsx linha ~74 |
| **FIX-004** | Unificar cor primária dos botões | LoginPage | Médio | P2 | Alterar botão de `#1976d2` para `#22c55e` (padrão do restante) | LoginPage.tsx — background: '#1976d2' |
| **FIX-005** | Associar label a input (htmlFor + id) | LoginPage, CadastroPage (FormInput) | Médio | P1 | Adicionar `id` nos inputs e `htmlFor` nos labels | LoginPage.tsx, CadastroPage.tsx FormInput |
| **FIX-006** | aria-label em botões de ação (Editar/Excluir) | CadastroPage | Baixo | P2 | Adicionar `aria-label="Editar"` e `aria-label="Excluir"` nos botões circulares | CadastroPage.tsx btnEditIcon, btnDeleteIcon |
| **FIX-007** | aria-label no avatar clicável | Layout.tsx | Baixo | P2 | Adicionar `role="button"` e `aria-label="Alterar foto"` no div do avatar | Layout.tsx — div onClick |

---

## PACOTE ENH — Melhorias de UX (opcional)

| ID | Descrição | Onde ocorre | Impacto | Risco | Proposta de solução | Evidência |
|----|-----------|-------------|---------|-------|---------------------|-----------|
| **ENH-001** | Criar componente Button centralizado | Novo: components/ui/Button.tsx | Alto | P2 | Criar Button com variants (primary, secondary, ghost, danger), tamanhos; consumir em todas as páginas | — |
| **ENH-002** | Criar componente Card centralizado | Novo: components/ui/Card.tsx | Médio | P2 | Criar Card com padding, radius, shadow; substituir cardStyle duplicado | CadastroPage, ReembolsoPage, DashboardPage |
| **ENH-003** | Criar FormField (label + input + error) | Novo: components/ui/FormField.tsx | Médio | P2 | Wrapper com label, input, error, helper; id/htmlFor automático | LoginPage, CadastroPage, ApontamentoPage |
| **ENH-004** | Criar TableActions (Editar/Excluir com confirmação) | Novo: components/ui/TableActions.tsx | Médio | P2 | Componente com botões Editar/Excluir, dialog de confirmação para Excluir | CadastroPage |
| **ENH-005** | Arquivo de tokens (cores, spacing) | Novo: src/styles/tokens.ts ou theme.ts | Médio | P2 | Exportar constantes primary, secondary, danger, spacing, radius | — |
| **ENH-006** | Empty state em listas vazias | DashboardPage, ListaApontamentoPage | Baixo | P2 | Exibir mensagem "Nenhum item encontrado" quando array.length === 0 | DashboardPage projetos, ListaApontamentoPage |
| **ENH-007** | Padronizar microcopy (Salvar vs Enviar) | CadastroPage, ReembolsoPage | Baixo | P2 | Usar "Salvar" para formulários de cadastro; "Enviar" apenas para submissão de pedido (reembolso) — manter Enviar em Reembolso | — |

---

## RESUMO DO PACOTE

| Tipo | Quantidade | Prioridade sugerida |
|------|------------|---------------------|
| FIX | 7 | FIX-001 (P0), FIX-002, FIX-003, FIX-005 (P1), demais P2 |
| ENH | 7 | Todos P2 |

---

## ORDEM DE EXECUÇÃO RECOMENDADA

1. **FIX-001** — Confirmação de exclusão (crítico)
2. **FIX-002, FIX-003** — Confirmação e feedback em Reembolso
3. **FIX-004, FIX-005, FIX-006, FIX-007** — Padronização e acessibilidade
4. **ENH-005** — Tokens (base para ENH-001, ENH-002)
5. **ENH-001, ENH-002, ENH-003, ENH-004** — Componentes base
6. **ENH-006, ENH-007** — Empty states e microcopy

---

## PARA EXECUTAR

Responda com um dos formatos abaixo para aprovar a execução:

- **Exemplo 1:** `APROVAR: FIX-001, FIX-002, FIX-003`
- **Exemplo 2:** `APROVAR TODOS OS FIX`
- **Exemplo 3:** `APROVAR TODOS OS FIX E ENH`
- **Exemplo 4:** `APROVAR: FIX-001, ENH-001, ENH-005`

Somente os itens aprovados serão implementados na Etapa C.

---

## Histórico de Execuções

| Versão | Data | Observação |
|--------|------|------------|
| v1 | 18/02/2026 | Etapa B — Plano de aprovação gerado |

---

*Documento gerado pelo Agente_UIUX_Governance_Executor. Aguardando aprovação explícita para Etapa C.*
