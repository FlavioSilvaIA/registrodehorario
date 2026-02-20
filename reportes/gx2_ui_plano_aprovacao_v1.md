# PLANO DE AÇÃO GX2 — APROVAÇÃO OBRIGATÓRIA
## Etapa B — Backlog para aderência ao Guia de Identidade Visual GX2

**Versão:** v1  
**Data/Hora de Execução:** 19/02/2026  
**Projeto analisado:** v2_14/refatorado_20250218  
**Agente executor:** GX2_AI_Brand_UI_Guardian (Agente 08)  
**Resumo GX2 Design Tokens a aplicar:** #35b6ad, #1b2948, #ffffff, #19dbd1, #feb801, #01d5fe | Montserrat Regular/Bold

---

## GX2-FIX — Correções necessárias para aderir ao guia

| ID | Categoria | Onde ocorre | Problema | Regra do guia | Proposta de correção | Impacto | Risco |
|----|-----------|--------------|----------|---------------|----------------------|---------|-------|
| GX2-FIX-001 | Color | index.css, Layout, todas as páginas | Cores fora da paleta GX2 | Paleta primárias/secundárias | Criar tokens em CSS/theme: `--gx2-turquesa: #35b6ad`, `--gx2-azul-marinho: #1b2948`, `--gx2-turquesa-claro: #19dbd1`; substituir #22c55e, #1976d2, #4ade80, #4a90a4, #2d3e50 pelos tokens | Alto | P1 |
| GX2-FIX-002 | Color | Layout (sidebar) | Gradient #2d3e50 / #1a252f | Azul marinho #1b2948 | Usar `background: #1b2948` ou gradient com #1b2948 | Alto | P1 |
| GX2-FIX-003 | Color | Layout (menu ativo) | #4ade80 (verde) | Turquesa para destaque | Usar #35b6ad ou #19dbd1 para item ativo | Médio | P2 |
| GX2-FIX-004 | Color | LoginPage, CadastroPage, ReembolsoPage, ApontamentoPage, RelatorioPage | Botões primários #22c55e | Turquesa escuro #35b6ad | Substituir por #35b6ad | Alto | P1 |
| GX2-FIX-005 | Color | DashboardPage | Links #1976d2 | Turquesa #35b6ad | Substituir por #35b6ad | Médio | P2 |
| GX2-FIX-006 | Type | index.css, index.html | system-ui, sans-serif | Montserrat como fonte principal | Importar Montserrat (Google Fonts); `font-family: 'Montserrat', sans-serif` | Alto | P1 |
| GX2-FIX-007 | Type | Geral | Sem escala tipográfica | Regular para textos, Bold para títulos | Definir tamanhos e pesos (evitar Thin/Light/Black) | Médio | P2 |
| GX2-FIX-008 | Icon | Layout (menuItems, topbar) | Emojis 🏠📋⏱️📁💰🔔⚙️📄📧 | Ícones solid ou outline, sem ilustrativos | Substituir por ícones de biblioteca (ex.: Lucide React) em estilo único | Alto | P1 |
| GX2-FIX-009 | Layout | Layout (topbar) | Texto "GX2" #2d3e50 | Azul marinho #1b2948 | Usar #1b2948 no texto GX2 | Baixo | P2 |
| GX2-FIX-010 | Layout | Layout (avatar) | #4a90a4 | Turquesa #35b6ad | Usar #35b6ad no avatar | Baixo | P2 |

---

## GX2-ENH — Melhorias modernas de UX/UI (opcionais)

| ID | Categoria | Onde ocorre | Problema | Proposta de melhoria | Impacto | Risco |
|----|-----------|--------------|----------|---------------------|---------|-------|
| GX2-ENH-001 | Layout | Geral | Sem tokens de spacing | Criar `--spacing-*` e escala (4, 8, 12, 16, 20, 24, 32) | Médio | P2 |
| GX2-ENH-002 | Component | Geral | Sem componente Button centralizado | Criar `<Button variant="primary\|secondary\|ghost\|danger" />` usando tokens GX2 | Alto | P2 |
| GX2-ENH-003 | Component | Geral | Sem FormField/Input padrão | Criar `<FormField label error helper />` com estilo GX2 | Médio | P2 |
| GX2-ENH-004 | Component | CadastroPage, ReembolsoPage | cardStyle duplicado | Criar componente `<Card />` reutilizável | Baixo | P2 |
| GX2-ENH-005 | Logo | Layout (topbar) | Apenas texto "GX2" | Incluir asset de logo GX2 (SVG) se disponível | Médio | P2 |
| GX2-ENH-006 | State | App, páginas | "Carregando..." texto simples | Skeleton ou spinner com cores GX2 | Baixo | P2 |
| GX2-ENH-007 | A11y | Geral | Focus ring não verificado | Garantir `:focus-visible` com outline em cor GX2 | Médio | P2 |

---

## RESUMO

| Tipo | Quantidade |
|------|------------|
| GX2-FIX | 10 |
| GX2-ENH | 7 |

---

## APROVAÇÃO OBRIGATÓRIA

**Nenhuma alteração de código será executada sem sua aprovação explícita.**

Para aprovar, use um dos formatos:

- `APROVAR: GX2-FIX-001, GX2-FIX-004, GX2-ENH-002`
- `APROVAR TODOS OS FIX`
- `APROVAR TODOS OS FIX E ENH`
- `APROVAR SOMENTE FIX`

Após aprovação, a **ETAPA C** será executada aplicando somente os itens aprovados.
