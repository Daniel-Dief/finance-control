# Finance Control

Aplicação web (SPA) para controle financeiro pessoal, com gestão de áreas, categorias, orçamentos e transações, além de um dashboard com indicadores e gráficos.

O frontend consome uma API REST configurável por variável de ambiente e foi construído com React, TypeScript, Vite, HeroUI v3, Tailwind CSS 4 e MUI X Charts.

> **Status:** projeto em desenvolvimento. Não há testes automatizados ou pipeline de CI configurados no repositório.

## Funcionalidades

- **Autenticação:** login, cadastro, logout e persistência da sessão entre recarregamentos.
- **Rotas protegidas:** redirecionamento para `/login` quando não há sessão ativa.
- **Renovação de token:** refresh automático no carregamento da aplicação, em intervalo periódico e após respostas `401`, com fila para evitar refreshes concorrentes.
- **Dashboard:**
  - KPIs de receitas, despesas e saldo por mês/ano;
  - gráfico de linhas da movimentação diária ou semanal;
  - gráfico radar por área, com filtro de áreas;
  - acompanhamento do percentual gasto de cada orçamento.
- **Áreas e categorias:** listagem com busca por nome, paginação e CRUD em drawers.
- **Orçamentos:** CRUD, filtros por área, mês e ano e paginação.
- **Transações:** CRUD, filtros por área, categoria e mês, paginação e seleção de tipo (receita/despesa).
- **Tema claro/escuro:** preferência persistida no navegador.
- **Experiência de uso:** carregamento sob demanda das páginas, estados de loading/erro/vazio, confirmação de exclusão e notificações via toast.

## Stack

| Camada              | Tecnologia                                        |
| ------------------- | ------------------------------------------------- |
| UI                  | React 19, HeroUI v3, Tailwind CSS 4               |
| Linguagem           | TypeScript (modo estrito)                         |
| Build/dev server    | Vite 8                                            |
| Roteamento          | React Router DOM 7                                |
| Gráficos            | MUI X Charts 9                                    |
| Estado global       | Zustand 5 (com persistência em `localStorage`)    |
| HTTP                | Axios                                             |
| Efeito visual       | OGL (componente `GradientWaves` na tela de login) |
| Qualidade de código | ESLint 10 e Prettier 3                            |

## Requisitos

- **Node.js** `^20.19.0` ou `>=22.12.0` (requisito do Vite 8), ou **Bun** 1.x.
- Uma instância da **Finance Control API** acessível pelo frontend. Por padrão, a aplicação usa `http://localhost:1323`.

## Configuração

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/Daniel-Dief/finance-control.git
cd finance-control
bun install
```

Também é possível usar npm, pnpm ou yarn, mas o projeto mantém o `bun.lock` versionado.

Crie o arquivo de variáveis de ambiente a partir do exemplo:

```bash
cp .env.exemple .env
```

No PowerShell:

```powershell
Copy-Item .env.exemple .env
```

Variável disponível:

| Variável       | Descrição            | Padrão                  |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | URL base da API REST | `http://localhost:1323` |

Se a variável não for definida, o fallback `http://localhost:1323` é usado em `src/services/apiClient.ts`.

## Como rodar

```bash
bun run dev
```

A aplicação fica disponível em `http://localhost:5173`.

Com npm:

```bash
npm install
npm run dev
```

Para criar um orçamento ou uma transação, é necessário ter pelo menos uma área e uma categoria cadastradas.

## Scripts

| Comando           | Descrição                                                                    |
| ----------------- | ---------------------------------------------------------------------------- |
| `bun run dev`     | Inicia o servidor de desenvolvimento do Vite.                                |
| `bun run build`   | Executa a checagem de tipos com `tsc` e gera o build de produção em `dist/`. |
| `bun run preview` | Serve localmente o build de produção.                                        |
| `bun run lint`    | Executa o ESLint com correção automática.                                    |
| `bun run format`  | Formata o projeto com Prettier.                                              |

## Estrutura do projeto

```text
src/
├── components/       # Componentes reutilizáveis e formulários/dialogs por domínio
├── config/           # Configurações gerais da aplicação
├── hooks/            # Hooks compartilhados (ex.: useAsyncData)
├── layouts/          # Layout padrão com cabeçalho e navegação
├── pages/            # Páginas da aplicação
├── services/         # Clientes HTTP e integração com a API
├── stores/           # Estado global (autenticação)
├── styles/           # Estilos globais e integração com Tailwind/HeroUI
├── types/            # Tipos e contratos de dados
└── utils/            # Formatação, validação, paginação e tratamento de erros
```

O alias `@/*` aponta para `src/*`.

## Rotas

| Rota            | Acesso    | Tela                   |
| --------------- | --------- | ---------------------- |
| `/login`        | Pública   | Login e cadastro       |
| `/`             | Protegida | Transações (atalho)    |
| `/transactions` | Protegida | Transações             |
| `/dashboard`    | Protegida | Dashboard e relatórios |
| `/areas`        | Protegida | Áreas                  |
| `/categories`   | Protegida | Categorias             |
| `/budgets`      | Protegida | Orçamentos             |

O controle de acesso é feito em `src/provider.tsx`, que valida a sessão antes de renderizar as rotas e redireciona usuários sem autenticação para `/login`.

## Integração com a API

A URL base é definida por `VITE_API_URL`. As requisições autenticadas enviam o cabeçalho `Authorization: Bearer <token>`.

### Endpoints utilizados

| Recurso      | Endpoints                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticação | `POST /auth/login`, `POST /auth/register`                                                                                              |
| Áreas        | `GET /areas/list`, `GET /areas/{id}`, `POST /areas/create`, `PUT /areas/{id}`, `DELETE /areas/{id}`                                    |
| Categorias   | `GET /categories/list`, `GET /categories/{id}`, `POST /categories/create`, `PUT /categories/{id}`, `DELETE /categories/{id}`           |
| Orçamentos   | `GET /budgets/list`, `GET /budgets/{id}`, `POST /budgets/create`, `PUT /budgets/{id}`, `DELETE /budgets/{id}`                          |
| Transações   | `GET /transactions/list`, `GET /transactions/{id}`, `POST /transactions/create`, `PUT /transactions/{id}`, `DELETE /transactions/{id}` |
| Relatórios   | `GET /reports/kpis`, `GET /reports/line-chart`, `GET /reports/radar-chart`, `GET /reports/budgets`                                     |

### Convenções da API

- **Valores monetários:** inteiros em centavos. Ex.: `R$ 1.500,00` é representado por `150000`.
- **Datas:** `AAAA-MM-DD`.
- **Tipo de transação:** `income` (receita) ou `expense` (despesa).
- **Paginação:** parâmetros `page` e `limit`; resposta com `data`, `page`, `limit`, `total` e `total_pages`.
- **Listas vazias:** a API pode responder `204 No Content`; os services convertem isso em uma página vazia.
- **Relatórios:** aceitam `year` e `month`; os gráficos de linha e radar também aceitam `type`, e o radar aceita `area_ids` separados por vírgula.

## Autenticação e sessão

- O estado de autenticação é mantido em `src/stores/authStore.ts` e persistido no `localStorage` com a chave `auth-storage`.
- O token é renovado em três situações:
  1. ao iniciar a aplicação, se houver usuário e senha persistidos;
  2. a cada 60 segundos, quando o token estiver expirado ou perto de expirar;
  3. ao receber `401`, por meio do interceptor do Axios.
- O refresh usa `POST /auth/login` novamente. Requisições que falham durante uma renovação aguardam na fila e são repetidas com o novo token.

> **Atenção:** para permitir a renovação silenciosa, a senha do usuário também é persistida no `localStorage`. Em um cenário de produção mais rigoroso, o ideal é substituir essa estratégia por refresh tokens com cookies `httpOnly` gerenciados pelo backend.

## Build e deploy

### Build local

```bash
bun run build
bun run preview
```

O resultado é gerado em `dist/`.

### Docker

O projeto possui um build multi-stage: as dependências e o bundle são gerados com Bun, e os arquivos estáticos são servidos por Nginx.

```bash
docker compose up --build
```

A aplicação fica disponível em `http://localhost:8080`. O container usa a configuração de `nginx.conf`, que inclui fallback para `index.html` (necessário para as rotas do React Router) e cache para arquivos estáticos.

Também é possível construir e executar manualmente:

```bash
docker build -t finance-control .
docker run --rm -p 8080:80 finance-control
```

#### Múltiplas arquiteturas (amd64 e arm64)

O `Dockerfile` é compatível com `linux/amd64` e `linux/arm64` (e demais arquiteturas suportadas pelas imagens base). O estágio de build roda na plataforma nativa via `--platform=$BUILDPLATFORM`, evitando emulação QEMU, e o `nginx:alpine` é resolvido para a plataforma de destino.

Para gerar e publicar uma imagem multi-arquitetura:

```bash
docker buildx create --use --name finance-builder   # apenas na primeira vez
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <usuario>/finance-control:latest \
  --push .
```

Para apenas construir a imagem local rodando em ARM (ex.: Raspberry Pi ou Mac com Apple Silicon), use a plataforma única com `--load`:

```bash
docker buildx build --platform linux/arm64 -t finance-control --load .
```

> **Emulação:** ao cross-buildar (ex.: gerar `arm64` em uma máquina `amd64`), o estágio final executa `apk upgrade` com binários da arquitetura de destino. Isso exige emulação QEMU registrada no builder (`docker run --privileged --rm tonistiigi/binfmt --install arm64`, ou `docker/setup-qemu-action` em CI). Em hosts ARM o build roda nativamente, sem emulação.

> **Importante:** no Vite, `VITE_API_URL` é incorporada ao bundle durante o build. O `Dockerfile` atual não recebe essa variável como build arg; portanto, sem ajuste, a imagem usa o fallback `http://localhost:1323`. Para apontar para outra API no container, adicione um `ARG`/`ENV` de `VITE_API_URL` antes de `bun run build` ou defina a variável no ambiente de build.

### Vercel

O arquivo `vercel.json` redireciona todas as rotas para `/`, permitindo o funcionamento do React Router em produção. Configure `VITE_API_URL` nas variáveis de ambiente do projeto na Vercel (ambiente de build) e use `bun run build` como comando de build, com `dist` como diretório de saída.

## Limitações conhecidas

- Não há testes unitários, de integração ou E2E.
- Não há workflow de CI/CD no repositório.
- A sessão persiste usuário e senha no `localStorage` para permitir a renovação automática do token.
- O `VITE_API_URL` da imagem Docker precisa ser configurado em tempo de build, não em tempo de execução.
- A configuração de deploy da Vercel depende da variável `VITE_API_URL` definida no ambiente de build.

## Licença

Este projeto está licenciado sob a [MIT License](./LICENSE).
