# Orientações Genéricas — Refatoração GeneXus → React + Node.js / React Native

**Objetivo:** Guia reutilizável para refatorar qualquer aplicação GeneXus para React.js + Node.js ou React Native. Use este documento como base e adapte ao projeto específico.

---

## 1. CONTEXTO GENEXUS

### 1.1 Conceitos que se traduzem em código

| GeneXus | Equivalente na refatoração |
|---------|----------------------------|
| **Business Component (BC)** | Model/Entidade + Controller + Rotas API |
| **Transaction** | Formulário CRUD + API REST |
| **Work With** | Listagem + formulário + grid |
| **Domain** | Tipo/Enum/Validação (ex.: Email, Data, Id) |
| **Procedure** | Função no controller ou serviço |
| **Web Panel** | Página React (web) ou tela React Native |
| **SD (Smart Device)** | Tela mobile (React Native) |
| **Level (Transaction)** | Relacionamento 1:N (tabela filha) |
| **Data Provider** | Endpoint API ou hook que busca dados |
| **GAM** | Sistema de auth (JWT, sessão, etc.) |

### 1.2 Estrutura típica de artefatos GeneXus

- `gxmetadata/*.json` — definição de BCs, Transactions, Procedures
- `Metadata/TableAccess/*.xml` — dependências entre objetos
- `Resources/` — imagens, strings, configurações
- `*.gxapp.json` — apps e contextos

---

## 2. ENGENHARIA REVERSA — OBRIGATÓRIA ANTES DE CODAR

### 2.1 Documento de engenharia reversa

Crie ou consulte um documento que contenha:

- **Catálogo de entidades** — tabelas, campos, tipos, FKs
- **Dicionário de dados** — origem GeneXus de cada campo
- **Regras de negócio** — validações, enums, constraints
- **Mapa UI ↔ Dados** — qual tela usa quais dados
- **Incertezas** — o que não ficou claro e precisa de validação

### 2.2 Perguntas a responder antes de implementar

- Qual BC/Transaction origina esta tela?
- Quais Domains afetam validação e tipo de dado?
- Existem Levels (tabelas filhas)? Como se relacionam?
- Há Procedures que encapsulam lógica? Onde vivem na nova stack?
- O sistema usa GAM? Como migrar autenticação?

---

## 3. CLAREZA SEMÂNTICA — EVITAR INTERPRETAÇÕES ERRADAS

### 3.1 Termos ambíguos no GeneXus

O GeneXus usa nomes genéricos que podem ter significados diferentes por contexto:

| Termo | Pode significar | Verificar em |
|-------|------------------|--------------|
| "Cadastro" | BC, Transaction ou seção de uma tela | Estrutura do objeto |
| "Notificação" | Entidade, tipo de alerta ou mensagem | Dicionário de dados |
| "Vincular" | Relacionamento N:N, tabela associativa | Modelo ER |
| "Usuario" | Usuário do sistema, colaborador, cliente | Contexto da tela |
| "Situação" / "Status" | Enum com valores específicos | Domain no GeneXus |

### 3.2 Regra de ouro

**Não assuma significado por similaridade de nome.** Consulte o documento de engenharia reversa e os artefatos GeneXus antes de implementar.

---

## 4. PADRÕES DE MIGRAÇÃO

### 4.1 Backend (Node.js + Express)

- **Um model** por BC/tabela
- **Um controller** por domínio ou grupo de Transactions relacionadas
- **Rotas REST** no padrão: `GET/POST /recurso`, `PUT/DELETE /recurso/:id`
- **Validações** — migrar regras dos Domains para validação no controller ou middleware
- **Procedures** — lógica de negócio em funções do controller ou em serviços

### 4.2 Frontend Web (React.js)

- **Uma página** por Transaction/Web Panel principal
- **Submenus/abas** — equivalentes a Levels ou seções da Transaction
- **Formulários** — campos conforme atributos do BC
- **Listagens** — grid com colunas dos atributos + ações (Editar, Excluir)
- **Navegação** — React Router com rotas equivalentes à estrutura do menu GeneXus

### 4.3 Mobile (React Native)

- **Uma tela** por SD (Smart Device) ou Transaction mobile
- **Stack de navegação** — fluxos equivalentes ao app GeneXus
- **Offline** — se o GeneXus usa Synchronizer, planejar cache local (AsyncStorage, SQLite)
- **APIs** — mesmas rotas do backend Node.js

---

## 5. CHECKLIST ANTES DE IMPLEMENTAR QUALQUER FEATURE

- [ ] Consultei o documento de engenharia reversa?
- [ ] Identifiquei o BC/Transaction/Procedure de origem?
- [ ] Verifiquei se há termos ambíguos na especificação?
- [ ] Há imagens ou protótipos? Descrevi layout e fluxo antes de codar?
- [ ] Confirmei relacionamentos (FKs, tabelas associativas)?
- [ ] Verifiquei Domains (enums, validações) que afetam os campos?
- [ ] Defini onde a lógica das Procedures vai viver (controller, serviço)?

---

## 6. ARMADILHAS COMUNS NA MIGRAÇÃO GENEXUS

1. **Levels (tabelas filhas)** — não esquecer de criar models e rotas para cada Level
2. **Domains com validação** — Email, CPF, etc. precisam ser replicados no backend
3. **Enums** — GeneXus usa números ou chars; mapear para constantes legíveis
4. **ReadOnly/Computed** — campos calculados: implementar no backend ou no frontend conforme regra
5. **Default values** — verificar defaults dos atributos no GeneXus
6. **Nomenclatura** — GeneXus usa PascalCase; backend costuma usar snake_case nas colunas
7. **Transações** — GeneXus faz commit por objeto; garantir atomicidade em operações que afetam múltiplas tabelas

---

## 7. ESTRUTURA SUGERIDA DO PROJETO REFATORADO

```
projeto-refatorado/
├── backend/                 # Node.js + Express
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/          # Sequelize/TypeORM
│   │   ├── routes/
│   │   ├── services/       # Lógica de Procedures
│   │   └── middleware/     # Auth, validação
│   └── ...
├── frontend/                # React (web) OU
│   └── src/
│       ├── pages/
│       ├── components/
│       └── services/
├── mobile/                  # React Native (se aplicável)
│   └── src/
│       ├── screens/
│       ├── components/
│       └── services/
├── docs/
│   ├── ENGENHARIA_REVERSA.md
│   └── AGENTE_REFATORACAO_*.md  # Este doc adaptado
└── ...
```

---

## 8. PROMPT SUGERIDO PARA INICIAR REFATORAÇÃO

```
Refatore o sistema GeneXus [NOME_DO_SISTEMA] para [React + Node.js | React Native + Node.js].

Contexto:
- Artefatos GeneXus em: [CAMINHO]
- Documento de engenharia reversa: [CAMINHO_OU_INDICAR_QUE_PRECISA_SER_CRIADO]
- Stack destino: [React/Node | React Native/Node]

Antes de implementar:
1. Consulte o documento de engenharia reversa
2. Para cada tela/entidade, identifique o BC/Transaction de origem
3. Verifique termos ambíguos na tabela de clareza semântica
4. Se houver imagens de referência, descreva layout e fluxo

Padrões a seguir:
- Backend: models por BC, controllers por domínio, rotas REST
- Frontend: páginas por Transaction, formulários com Confirmar/Fechar, grids com Editar/Excluir
- Consultar AGENTE_REFATORACAO_GENEXUS_GENERICO.md para detalhes
```

---

## 9. ADAPTAÇÃO AO PROJETO ESPECÍFICO

Para cada novo projeto de refatoração:

1. **Copie este documento** e renomeie (ex.: `AGENTE_REFATORACAO_[PROJETO].md`)
2. **Preencha a seção 1** com conceitos específicos do KB (BCs, Transactions principais)
3. **Adicione uma tabela de clareza semântica** (seção 3) com termos ambíguos do domínio
4. **Documente armadilhas** já encontradas no projeto
5. **Mantenha o checklist** atualizado com itens específicos

---

*Documento genérico para refatoração GeneXus → React/Node. Adapte e expanda conforme o projeto.*
