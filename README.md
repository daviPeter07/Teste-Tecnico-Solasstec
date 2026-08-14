<div align="center">

# Solasstec Portaria

**Controle de visitantes e agendamento de salas corporativas**

[![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repositório-181717?logo=github&logoColor=white)](https://github.com/daviPeter07/Teste-Tecnico-Solasstec)

</div>

## Sobre o projeto

O **Solasstec Portaria** é um sistema web administrativo para cadastrar visitantes, salas e feriados, além de organizar o uso de ambientes corporativos por meio de agendamentos.

O projeto foi criado para a Fase 2 do desafio técnico da Solasstec. A especificação original está disponível em [`docs/Desafio Solasstec_.pdf`](docs/Desafio%20Solasstec_.pdf).

Repositório oficial: <https://github.com/daviPeter07/Teste-Tecnico-Solasstec>

> [!IMPORTANT]
> O repositório ainda está em desenvolvimento. A base do backend, o schema inicial e o health check já estão implementados; os módulos de visitantes, salas, feriados e agendamentos permanecem planejados. O frontend ainda contém a página inicial do Next.js.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Regras de negócio](#regras-de-negócio)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Contrato da API](#contrato-da-api)
- [Como executar](#como-executar)
- [Docker](#docker)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Testes e qualidade](#testes-e-qualidade)
- [Roadmap](#roadmap)

## Funcionalidades

- Cadastro e consulta de visitantes por CPF ou RG.
- Identificação automática de atendimento prioritário.
- Cadastro de salas, capacidade, responsável e horários de funcionamento.
- Histórico de responsáveis e horários de cada sala.
- Cadastro de feriados sem alterar agendamentos já confirmados.
- Criação, edição, consulta e cancelamento de agendamentos.
- Busca do histórico completo por visitante ou sala.
- Validação de capacidade, disponibilidade, feriados e dias ativos.
- Sugestão automática da próxima data disponível quando o horário solicitado for inválido.

## Regras de negócio

1. O sistema será operado por um administrador e não exigirá autenticação.
2. Visitantes com deficiência ou idade igual ou superior a 60 anos terão prioridade.
3. O documento do visitante será único para evitar duplicidade e preservar o histórico.
4. Um visitante não poderá ocupar duas salas no mesmo intervalo de tempo.
5. Uma sala não poderá receber agendamentos conflitantes ou acima de sua capacidade.
6. Novos agendamentos não poderão ser criados em feriados, dias inativos ou fora do expediente.
7. Um feriado cadastrado posteriormente não cancelará agendamentos já confirmados.
8. Datas inválidas deverão retornar uma sugestão para o próximo horário disponível.
9. Alterações de responsável e funcionamento da sala deverão manter histórico.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Monorepo | pnpm Workspaces 10 |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Dados no frontend | TanStack Query, React Hook Form, Zod |
| Backend | NestJS 11, TypeScript, class-validator, Swagger |
| Persistência | PostgreSQL 17, Prisma ORM 7 |
| Testes | Jest, Supertest, Vitest, Testing Library |
| Infraestrutura | Docker e Docker Compose |

## Arquitetura

O repositório usa um monorepo pnpm com aplicações independentes e uma orquestração Docker na raiz.

O schema Prisma mapeia o schema PostgreSQL `desafio` e foi modelado a partir do dump oficial disponível em [`api/src/database/dumps/20260806_desafio (1).sql`](api/src/database/dumps/20260806_desafio%20(1).sql). Nomes físicos, tipos, relações e índices do dump são preservados com `@map`, `@@map` e `@@schema`.

```text
solasstec-portaria/
|-- api/                    # API REST NestJS
|   |-- prisma/             # Schema, migrations e seed
|   |-- src/                # Código da aplicação
|   |-- Dockerfile
|   |-- .dockerignore
|   `-- .env.example
|-- web/                    # Interface Next.js
|   |-- public/
|   |-- src/
|   |-- Dockerfile
|   |-- .dockerignore
|   `-- .env.example
|-- docs/                   # Especificação do desafio
|-- docker-compose.yml      # Web, API e PostgreSQL
|-- pnpm-workspace.yaml
|-- pnpm-lock.yaml
|-- package.json
|-- .dockerignore
|-- .gitignore
`-- README.md
```

### API

A API seguirá uma organização modular. Cada domínio terá controller, DTOs, repository, service e testes próprios.

```text
api/
|-- prisma/
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.ts
|-- src/
|   |-- common/
|   |   |-- exceptions/
|   |   |-- filters/
|   |   |-- interceptors/
|   |   `-- utils/
|   |-- config/
|   |   |-- configuration.ts
|   |   |-- env.validation.ts
|   |   `-- swagger.config.ts
|   |-- database/prisma/
|   |   |-- prisma.module.ts
|   |   `-- prisma.service.ts
|   |-- v1/
|   |   `-- modules/
|   |       |-- health/
|   |       |   |-- dto/
|   |       |   |-- repositories/
|   |       |   |-- test/
|   |       |   |   |-- unit/
|   |       |   |   `-- e2e/
|   |       |   |-- health.controller.ts
|   |       |   |-- health.service.ts
|   |       |   `-- health.module.ts
|   |       |-- visitors/
|   |       |-- rooms/
|   |       |-- holidays/
|   |       `-- appointments/
|   |-- app.module.ts
|   `-- main.ts
|-- Dockerfile
|-- .dockerignore
|-- .env.example
`-- package.json
```

Imports entre camadas usam os aliases `@/` para `api/src` e `@generated/` para o Prisma Client. Imports internos do mesmo módulo permanecem relativos.

### Frontend

O frontend usa o App Router com módulos verticais por rota. Cada módulo mantém sua página, componentes, hooks e services próximos; apenas elementos realmente compartilhados ficam nas pastas globais.

```text
web/
|-- public/
|-- src/
|   |-- app/
|   |   |-- (home)/
|   |   |   |-- _components/
|   |   |   |-- _hooks/
|   |   |   |-- _services/
|   |   |   `-- page.tsx
|   |   |-- agendamentos/
|   |   |-- visitantes/
|   |   |-- salas/
|   |   |-- feriados/
|   |   |-- layout.tsx
|   |-- components/
|   |   `-- ui/
|   |-- lib/
|   |   `-- utils.ts
|-- Dockerfile
|-- .dockerignore
|-- .env.example
`-- package.json
```

## Contrato da API

A API usa o prefixo `/api/v1` e disponibiliza sua documentação Swagger em `/docs`. O health check está implementado; as demais rotas abaixo representam o contrato planejado para os próximos módulos.

### Saúde

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Verifica a disponibilidade da API e do banco |

### Visitantes

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/visitors` | Lista visitantes com filtros e paginação |
| `GET` | `/api/v1/visitors/:id` | Busca um visitante pelo ID |
| `GET` | `/api/v1/visitors/document/:document` | Localiza visitante por CPF ou RG para autopreenchimento |
| `POST` | `/api/v1/visitors` | Cadastra um visitante e calcula sua prioridade |
| `PATCH` | `/api/v1/visitors/:id` | Atualiza os dados de um visitante |
| `DELETE` | `/api/v1/visitors/:id` | Inativa um visitante sem apagar seu histórico |
| `GET` | `/api/v1/visitors/:id/appointments` | Consulta o histórico de agendamentos do visitante |

### Salas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/rooms` | Lista salas com filtros e paginação |
| `GET` | `/api/v1/rooms/:id` | Busca uma sala pelo ID |
| `POST` | `/api/v1/rooms` | Cadastra sala, capacidade, responsável e horários |
| `PATCH` | `/api/v1/rooms/:id` | Atualiza uma sala e registra as alterações no histórico |
| `DELETE` | `/api/v1/rooms/:id` | Inativa uma sala sem apagar seu histórico |
| `GET` | `/api/v1/rooms/:id/history` | Consulta responsáveis e horários anteriores |
| `GET` | `/api/v1/rooms/:id/appointments` | Consulta o histórico de agendamentos da sala |

### Feriados

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/holidays` | Lista feriados por período, tipo ou status |
| `GET` | `/api/v1/holidays/:id` | Busca um feriado pelo ID |
| `POST` | `/api/v1/holidays` | Cadastra um feriado |
| `PATCH` | `/api/v1/holidays/:id` | Atualiza um feriado |
| `DELETE` | `/api/v1/holidays/:id` | Inativa um feriado |

### Agendamentos

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/appointments` | Lista agendamentos e aceita filtros por visitante, sala, período e status |
| `GET` | `/api/v1/appointments/:id` | Exibe os detalhes de um agendamento |
| `POST` | `/api/v1/appointments` | Cria um agendamento após validar todas as regras |
| `PATCH` | `/api/v1/appointments/:id` | Reagenda ou atualiza um agendamento |
| `PATCH` | `/api/v1/appointments/:id/status` | Altera o status do agendamento |
| `PATCH` | `/api/v1/appointments/:id/cancel` | Cancela o agendamento preservando o histórico |

Filtros previstos para as listagens:

| Parâmetro | Uso |
| --- | --- |
| `page`, `limit` | Paginação |
| `search` | Busca textual |
| `visitorId` | Histórico por visitante |
| `roomId` | Histórico por sala |
| `status` | Filtro por status |
| `startDate`, `endDate` | Intervalo de datas |
| `active` | Registros ativos ou inativos |

Uma tentativa inválida de agendamento deverá responder com `422 Unprocessable Entity` e incluir a próxima disponibilidade encontrada:

```json
{
  "statusCode": 422,
  "code": "APPOINTMENT_UNAVAILABLE",
  "message": "A sala não está disponível no período solicitado.",
  "details": {
    "suggestion": {
      "startsAt": "2026-08-17T09:00:00.000Z",
      "endsAt": "2026-08-17T10:00:00.000Z"
    }
  }
}
```

## Como executar

### Pré-requisitos

- [Node.js 24](https://nodejs.org/)
- [pnpm 10.26.1](https://pnpm.io/)
- [PostgreSQL 17](https://www.postgresql.org/) para execução local
- [Docker](https://docs.docker.com/get-docker/) para execução em containers

### Instalação local

```bash
git clone https://github.com/daviPeter07/Teste-Tecnico-Solasstec.git
cd Teste-Tecnico-Solasstec
corepack enable
pnpm install
```

Crie os arquivos locais de ambiente. Não existe `.env` global:

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env.local
```

No PowerShell:

```powershell
Copy-Item api/.env.example api/.env
Copy-Item web/.env.example web/.env.local
```

Com um PostgreSQL disponível, gere o Prisma Client e prepare o banco:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Inicie API e frontend simultaneamente:

```bash
pnpm dev
```

| Serviço | Endereço |
| --- | --- |
| Frontend | <http://localhost:3000> |
| Health check | <http://localhost:3001/api/v1/health> |
| API | <http://localhost:3001/api/v1> |
| Swagger | <http://localhost:3001/docs> |
| Prisma Studio | <http://localhost:5555> após executar `pnpm db:studio` |

## Docker

### Stack completa

O Compose cria três serviços: `database`, `api` e `web`. As migrations de produção são aplicadas antes de iniciar a API.

```bash
pnpm docker:up
```

Ou diretamente:

```bash
docker compose up --build
```

Comandos úteis:

```bash
pnpm docker:logs
pnpm docker:down
docker compose down --volumes
```

> [!WARNING]
> `docker compose down --volumes` também remove os dados locais do PostgreSQL.

### Imagem da API

O contexto de build deve ser a raiz para que o Docker tenha acesso ao lockfile do monorepo:

```bash
docker build -f api/Dockerfile -t solasstec-portaria-api .
docker run --rm -p 3001:3001 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/solasstec_portaria?schema=public" \
  -e CORS_ORIGIN \
  solasstec-portaria-api
```

### Imagem do frontend

A URL da API é informada em runtime e consultada apenas pelo servidor Next.js. Ao executar as imagens separadamente, use um endereço que seja alcançável de dentro do container:

```bash
docker build -f web/Dockerfile -t solasstec-portaria-web .

docker run --rm -p 3000:3000 \
  -e API_URL="http://host.docker.internal:3001/api/v1" \
  solasstec-portaria-web
```

## Variáveis de ambiente

### API: `api/.env`

Use [`api/.env.example`](api/.env.example) como modelo.

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `NODE_ENV` | Não | `development` | Ambiente da aplicação |
| `PORT` | Não | `3001` | Porta HTTP da API |
| `API_PREFIX` | Não | `api/v1` | Prefixo global das rotas |
| `CORS_ORIGIN` | Não | nenhuma | Origens permitidas, separadas por vírgula |
| `DATABASE_URL` | Sim | - | Connection string PostgreSQL usada pelo Prisma |
| `SWAGGER_ENABLED` | Não | `true` | Habilita a documentação OpenAPI |
| `SWAGGER_PATH` | Não | `docs` | Caminho da interface Swagger |

### Web: `web/.env.local`

Use [`web/.env.example`](web/.env.example) como modelo.

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `API_URL` | Sim | `http://localhost:3001/api/v1` | URL interna da API usada pelos Server Components |

> [!NOTE]
> `API_URL` não usa o prefixo `NEXT_PUBLIC_` e permanece disponível apenas no servidor Next.js. No Docker Compose, ela aponta para a API pela rede interna.

## Scripts

### Raiz

| Script | Descrição |
| --- | --- |
| `pnpm dev` | Inicia API e web em modo de desenvolvimento |
| `pnpm build` | Compila todos os projetos do workspace |
| `pnpm lint` | Executa o lint em todos os projetos |
| `pnpm lint:fix` | Executa o lint e aplica correções automáticas |
| `pnpm test` | Executa os testes disponíveis |
| `pnpm format` | Formata os projetos que possuem script de formatação |
| `pnpm db:generate` | Gera o Prisma Client |
| `pnpm db:migrate` | Cria/aplica migrations no ambiente de desenvolvimento |
| `pnpm db:deploy` | Aplica migrations existentes em produção |
| `pnpm db:seed` | Cadastra os tipos iniciais de prioridade |
| `pnpm db:studio` | Abre o Prisma Studio |
| `pnpm docker:up` | Constrói e inicia toda a stack |
| `pnpm docker:down` | Encerra a stack |
| `pnpm docker:logs` | Acompanha os logs dos containers |

### API

| Script | Descrição |
| --- | --- |
| `pnpm --filter api dev` | Inicia o NestJS com watch |
| `pnpm --filter api build` | Compila a API |
| `pnpm --filter api start:prod` | Executa a versão compilada |
| `pnpm --filter api test` | Executa testes unitários |
| `pnpm --filter api test:e2e` | Executa testes end-to-end |
| `pnpm --filter api test:cov` | Gera cobertura de testes |

### Web

| Script | Descrição |
| --- | --- |
| `pnpm --filter web dev` | Inicia o Next.js em desenvolvimento |
| `pnpm --filter web build` | Gera o build de produção |
| `pnpm --filter web start` | Inicia o build de produção |
| `pnpm --filter web lint` | Executa o ESLint |
| `pnpm --filter web test` | Executa os testes unitários com Vitest |

## Testes e qualidade

A base atual inclui testes unitários do health service/controller e um teste HTTP e2e do endpoint. A cobertura planejada para os próximos módulos inclui:

- Testes unitários de controllers, services e regras de disponibilidade.
- Testes e2e dos endpoints da API.
- Testes de componentes e formulários com Testing Library.
- Validação de DTOs no backend e schemas Zod no frontend.
- Cobertura das regras críticas de conflito, prioridade e sugestão de horários.

Antes de enviar alterações, execute:

```bash
pnpm lint
pnpm test
pnpm build
```

## Roadmap

- [x] Monorepo pnpm com API e frontend.
- [x] Containers individuais e Docker Compose com PostgreSQL.
- [x] Exemplos de ambiente separados por aplicação.
- [x] Scripts globais de desenvolvimento, build e banco.
- [x] Configuração global da API, validação de ambiente e Swagger.
- [x] Modelagem Prisma, migration inicial e seed.
- [x] Módulo Prisma por injeção de dependência e health check.
- [x] Estrutura modular do frontend e health check SSR.
- [ ] Módulo de visitantes e cálculo de prioridade.
- [ ] Módulo de salas e históricos.
- [ ] Módulo de feriados.
- [ ] Módulo de agendamentos e disponibilidade.
- [ ] Páginas administrativas do frontend.
- [x] Integração inicial frontend/API.
- [ ] Cobertura de testes unitários, integração e e2e.

---

<div align="center">
Desenvolvido para o desafio técnico da Solasstec.
</div>
