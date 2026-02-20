# AUDITORIA GX2 — IDENTIDADE VISUAL
## Etapa A — Análise sem alteração de código

**Versão:** v1  
**Data/Hora de Execução:** 19/02/2026  
**Projeto analisado:** v2_14/refatorado_20250218  
**Agente executor:** GX2_AI_Brand_UI_Guardian (Agente 08)  
**Resumo GX2 Design Tokens aplicados:** Nenhum — aplicação usa paleta e tipografia fora do guia

---

## 1) MAPEAMENTO DE ROTAS E TELAS

| Rota | Página | Componente principal |
|------|--------|----------------------|
| /login | LoginPage | Form login/senha |
| / | DashboardPage | Cards (horas, apontamento aberto, projetos) |
| /apontamento | ApontamentoPage | Form entrada/saída, geolocation |
| /lista-apontamento | ListaApontamentoPage | Filtros, tabela, resumo, exportar |
| /cadastro | CadastroPage | Tabs CRUD (centro-custo, empresa, equipe, evento, log, projeto, usuário, etc.) |
| /reembolso | ReembolsoPage | Listagem, filtros, aprovar/negar |
| /tipo-reembolso | TipoReembolsoPage | CRUD tipo reembolso |
| /notificacao | NotificacaoPage | Mensagens, devices, vínculos |
| /parametros | ParametrosPage | Parâmetros do sistema |
| /relatorio | RelatorioPage | Submenu relatórios |

---

## 2) MAPEAMENTO DE COMPONENTES DE UI

| Componente | Localização | Uso |
|------------|-------------|-----|
| Layout | components/Layout.tsx | Sidebar + topbar + Outlet |
| — | — | **Não há componentes Button, Input, TableActions, FormField centralizados** |
| — | — | Estilos inline e constantes locais em cada página |

---

## 3) VIOLAÇÕES DO GUIA GX2 POR CATEGORIA

### 3.1 Cores (tokens, contrastes, uso indevido)

**Guia GX2:**
- Primárias: Turquesa escuro `#35b6ad`, Azul marinho `#1b2948`, Branco `#ffffff`
- Secundárias (detalhes, NÃO background principal): Amarelo `#feb801`, Azul Ciano `#01d5fe`
- Turquesa claro (detalhes em fundo azul marinho): `#19dbd1`

| Local | Problema | Evidência |
|-------|----------|-----------|
| index.css | body `background: #f5f5f5`, `color: #333` | Fora da paleta GX2 |
| Layout (sidebar) | `linear-gradient(180deg, #2d3e50 0%, #1a252f 100%)` | Deveria usar azul marinho `#1b2948` |
| Layout (sidebar ativo) | `#4ade80` (verde) | Deveria usar turquesa `#35b6ad` ou `#19dbd1` |
| Layout (avatar) | `#4a90a4` | Deveria usar turquesa `#35b6ad` |
| Layout (topbar) | `#2d3e50` no texto "GX2" | Deveria usar `#1b2948` |
| LoginPage | Botão `#22c55e` (verde) | Deveria usar turquesa `#35b6ad` |
| CadastroPage | btnStyle `#22c55e`, btnSecStyle `#4a90a4` | Primária deveria ser `#35b6ad` |
| ReembolsoPage | btnStyle `#22c55e`, btnSecStyle `#4a90a4` | Idem |
| RelatorioPage | btnStyle `#22c55e` | Idem |
| DashboardPage | Links `#1976d2` (azul Material) | Deveria usar `#35b6ad` |
| ApontamentoPage | Botões com `#22c55e`, `#ef4444` | Primária deveria ser `#35b6ad` |

**Resumo:** Nenhuma cor da paleta GX2 está aplicada. Uso predominante de verde `#22c55e`, azul genérico `#1976d2`, cinzas `#2d3e50`, `#4a90a4`.

---

### 3.2 Tipografia (uso fora do padrão)

**Guia GX2:** Fonte principal Montserrat; pesos permitidos: Regular e Bold (evitar Thin, Extra Light, Light, Black).

| Local | Problema | Evidência |
|-------|----------|-----------|
| index.css | `font-family: system-ui, -apple-system, sans-serif` | Não usa Montserrat |
| index.html | Sem import de Montserrat (Google Fonts ou similar) | Fonte não carregada |
| Geral | Sem escala tipográfica definida | Tamanhos inline variados (12, 14, 20, 24) |

**Resumo:** Tipografia completamente fora do guia GX2.

---

### 3.3 Botões e ações

| Local | Problema | Evidência |
|-------|----------|-----------|
| Layout | Botão "Sair" com `background: transparent`, `border: 1px solid #ddd` | Estilo ghost inconsistente |
| CadastroPage | btnEditIcon `#e2e8f0`, btnDeleteIcon `#ef4444` | Cores fora do guia; danger poderia usar vermelho com cuidado |
| Geral | Sem componente Button com variantes (primary/secondary/ghost/danger) | Estilos duplicados em cada página |
| Geral | Labels "Salvar"/"Confirmar"/"Enviar" inconsistentes | Microcopy variado |

---

### 3.4 Ícones

**Guia GX2:** Preferir consistência (Solid OU Outline); evitar ilustrativos/coloridos.

| Local | Problema | Evidência |
|-------|----------|-----------|
| Layout (menuItems) | Emojis: 🏠, 📋, ⏱️, 📁, 💰, 🔔, ⚙️, 📄 | Ícones ilustrativos/coloridos fora do padrão |
| Layout (topbar) | Emoji 📧 | Idem |
| Geral | Sem biblioteca de ícones (ex.: Lucide, Heroicons) | Mistura de emojis e texto |

**Resumo:** Uso de emojis viola princípio de "simplicidade e uniformidade" do guia.

---

### 3.5 Layout (alinhamento, espaçamento, hierarquia)

| Local | Problema | Evidência |
|-------|----------|-----------|
| Geral | Sem tokens de spacing (base 4, escala) | Valores hardcoded (8, 12, 16, 20, 24) |
| Cards | cardStyle duplicado em CadastroPage, ReembolsoPage, RelatorioPage | Sem componente Card reutilizável |
| Geral | Sem grid definido | Layout flex ad hoc |

---

### 3.6 Logo

| Local | Problema | Evidência |
|-------|----------|-----------|
| Layout (topbar) | Apenas texto "GX2" em `fontWeight: 700` | Sem logo oficial; sem referência a asset de logo |
| Geral | Nenhum uso de logo em SVG/PNG | Área de não interferência e redução mínima não aplicáveis |

---

### 3.7 Estados (loading, empty, error)

| Local | Problema | Evidência |
|-------|----------|-----------|
| App (PrivateRoute) | "Carregando..." com `padding: 20` | Sem skeleton ou spinner padronizado |
| LoginPage | "Entrando..." no botão | OK |
| ListaApontamentoPage | Empty state genérico | Sem EmptyState componente |
| CadastroPage | "Nenhum centro de custo encontrado" etc. | Mensagens OK, estilo inconsistente |

---

### 3.8 Acessibilidade

| Local | Problema | Evidência |
|-------|----------|-----------|
| Layout | aria-label no avatar (FIX-007 aplicado) | OK |
| Geral | Focus ring visível | Não verificado em estilos inline |
| Geral | Contraste mínimo | Cores fora do guia podem afetar contraste |

---

## 4) EVIDÊNCIAS POR ARQUIVO

| Arquivo | Trechos relevantes |
|---------|-------------------|
| frontend/src/index.css | `font-family: system-ui`; `background: #f5f5f5`; `color: #333` |
| frontend/src/components/Layout.tsx | Linhas 85-86 (sidebar gradient); 134, 155, 178 (ativo #4ade80); 104 (avatar #4a90a4); 206 (GX2 #2d3e50) |
| frontend/src/pages/LoginPage.tsx | Linha 66 (`background: #22c55e`) |
| frontend/src/pages/CadastroPage.tsx | Linhas 65-66 (btnStyle, btnSecStyle); 68-69 (btnEditIcon, btnDeleteIcon) |
| frontend/src/pages/ReembolsoPage.tsx | Linhas 11-14 (cardStyle, btnStyle, btnSecStyle, btnDangerStyle) |
| frontend/src/pages/DashboardPage.tsx | Linhas 57, 63 (`color: #1976d2`) |
| frontend/index.html | Sem link para Montserrat |

---

## 5) CONCLUSÃO ETAPA A

A aplicação **não adere** ao Guia de Identidade Visual GX2. Principais gaps:

1. **Cores:** Nenhum token GX2 aplicado; uso de verde, azul Material e cinzas genéricos.
2. **Tipografia:** system-ui em vez de Montserrat.
3. **Ícones:** Emojis ilustrativos em vez de ícones solid/outline.
4. **Componentes:** Ausência de Design System (Button, Input, Card, tokens).
5. **Logo:** Apenas texto "GX2", sem logo oficial.

Próximo passo: **ETAPA B** — Plano de ação com GX2-FIX e GX2-ENH para aprovação humana.
