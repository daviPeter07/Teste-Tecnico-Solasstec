<div align="center">

# Solasstec Portaria

**Sistema administrativo para controle de visitantes e agendamentos de salas**

[![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

</div>

## Sobre

O **Solasstec Portaria** é um sistema web administrativo desenvolvido para a Fase 2 do desafio técnico da Solasstec. A aplicação permite gerenciar visitantes, salas, feriados e agendamentos usados no controle de portaria e ocupação de salas corporativas.

A especificação original está em [`docs/Desafio Solasstec_.pdf`](docs/Desafio%20Solasstec_.pdf).

Repositório: <https://github.com/daviPeter07/Teste-Tecnico-Solasstec>

## Funcionalidades Implementadas

- Dashboard administrativo sem autenticação, com visão geral, indicadores e ações rápidas.
- CRUD de visitantes com documento CPF, data de nascimento e deficiência.
- Classificação automática de prioridade por idade igual ou superior a 60 anos e/ou deficiência.
- CRUD de salas com capacidade, responsável atual e horários de funcionamento.
- Histórico de responsáveis e disponibilidade das salas.
- CRUD de feriados com data, descrição, tipo e inativação lógica.
- CRUD de agendamentos com seleção de visitante, sala, data e horário de atendimento.
- Histórico de agendamentos por sala, incluindo registros cancelados.
- Seleção de horários de início por slots disponíveis, com horários ocupados exibidos de forma desabilitada.
- Sugestão automática da próxima disponibilidade quando a data selecionada é feriado ou quando o agendamento é inválido.
- Busca e paginação nas listagens de visitantes, salas, feriados e agendamentos.
- Próximo feriado em destaque na visão geral.
- API REST versionada com Swagger.
- Testes unitários e e2e no backend.
- Testes de schemas e serviços no frontend.

## Regras De Negócio Atendidas

- O sistema é operado por administrador e não exige autenticação.
- Visitantes prioritários são definidos automaticamente.
- Visitantes ativos usam CPF como documento principal no fluxo atual.
- Visitantes, salas e feriados são inativados por soft delete.
- Salas mantêm histórico de responsável e disponibilidade.
- Horários de sala não podem ter períodos sobrepostos no mesmo dia.
- Novos agendamentos não podem ser criados em feriados ativos.
- Novos agendamentos devem respeitar dias e horários ativos da sala.
- Visitantes não podem ocupar duas salas no mesmo horário.
- Salas respeitam a capacidade máxima no período agendado.
- Datas de feriado exibem sugestão da próxima data disponível antes do envio do formulário.
- Agendamentos inválidos por feriado, dia inativo, horário fora do expediente, conflito de visitante ou capacidade retornam sugestão automática quando houver próximo horário disponível.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Monorepo | pnpm Workspaces |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Dados no frontend | TanStack Query, React Hook Form, Zod |
| Backend | NestJS 11, TypeScript, class-validator, Swagger |
| Persistência | PostgreSQL 17, Prisma ORM 7 |
| Testes | Jest, Supertest, Vitest |
| Infraestrutura | Docker e Docker Compose |

## Estrutura

```text
solasstec-portaria/
|-- api/                    # API NestJS
|   |-- prisma/             # Schema, migrations e seed
|   `-- src/
|       |-- common/         # Filtros, interceptors, DTOs e exceptions
|       |-- config/         # Configuração da aplicação
|       |-- database/       # PrismaService e PrismaModule
|       `-- v1/modules/     # Health, visitors, rooms, holidays e appointments
|-- web/                    # Interface Next.js
|   `-- src/
|       |-- app/            # Rotas do App Router
|       |-- components/     # Componentes globais e UI
|       |-- lib/            # Helpers compartilhados
|       |-- modules/        # Módulos verticais do dashboard
|       `-- providers/      # Providers globais
|-- docs/                   # Especificação e resumos de PRs
|-- docker-compose.yml
|-- pnpm-workspace.yaml
`-- package.json
```

## Arquitetura Da API

A API usa módulos por domínio. Cada módulo concentra controller, DTOs, service, repository, implementação Prisma e testes.

```text
api/src/v1/modules/
|-- health/
|-- visitors/
|-- rooms/
|-- holidays/
`-- appointments/
```

As exceptions ficam em `api/src/common/exceptions`, agrupadas por domínio:

```text
exceptions/
|-- app.exception.ts
|-- not-found.exception.ts
|-- health/
|-- holidays/
|-- appointments/
|-- rooms/
`-- visitors/
```

O schema Prisma mapeia o schema PostgreSQL `desafio`. A migration incremental alinha os dados legados às regras do sistema, incluindo normalização de visitantes, disponibilidade de salas e restrições de conflito para agendamentos futuros.

## Arquitetura Do Frontend

O frontend usa App Router e módulos verticais por área do dashboard.

```text
web/src/modules/dashboard/
|-- shared/       # Navegação, header, layout e componentes compartilhados
|-- visitantes/   # Components, hooks, schemas e services de visitantes
|-- salas/        # Components, hooks, schemas e services de salas
|-- feriados/     # Components, hooks, schemas e services de feriados
`-- agendamentos/ # Components, hooks, schemas e services de agendamentos
```

Os arquivos em `services` concentram TanStack Query, mutations e chamadas ao backend. Os arquivos em `hooks` ficam restritos a estado de UI, como controle de modais.

Componentes compartilhados centralizam padrões de listagem, busca, paginação, estados vazios e formatação de datas para evitar repetição entre módulos.

O frontend chama o backend diretamente pela URL configurada em runtime; não há route handlers `/api` no Next.js para proxy interno.

## Endpoints

A API usa o prefixo `/api/v1`. A documentação Swagger fica em `/docs` quando habilitada.

### Health

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Verifica disponibilidade da aplicação |

### Visitantes

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/visitors` | Lista visitantes com busca e paginação |
| `GET` | `/api/v1/visitors/:id` | Busca visitante por ID |
| `POST` | `/api/v1/visitors` | Cadastra visitante |
| `PATCH` | `/api/v1/visitors/:id` | Atualiza visitante |
| `DELETE` | `/api/v1/visitors/:id` | Inativa visitante |

### Salas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/rooms` | Lista salas com busca e paginação |
| `GET` | `/api/v1/rooms/:id` | Busca sala por ID |
| `GET` | `/api/v1/rooms/:id/history` | Consulta histórico de responsável e disponibilidade |
| `POST` | `/api/v1/rooms` | Cadastra sala |
| `PATCH` | `/api/v1/rooms/:id` | Atualiza sala e registra histórico |
| `DELETE` | `/api/v1/rooms/:id` | Inativa sala |

### Feriados

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/holidays` | Lista feriados com busca e paginação |
| `GET` | `/api/v1/holidays/:id` | Busca feriado por ID |
| `POST` | `/api/v1/holidays` | Cadastra feriado |
| `PATCH` | `/api/v1/holidays/:id` | Atualiza feriado |
| `DELETE` | `/api/v1/holidays/:id` | Inativa feriado |

### Agendamentos

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/appointments` | Lista agendamentos com busca, filtros, paginação e opção `includeInactive` para histórico |
| `GET` | `/api/v1/appointments/availability` | Lista horários disponíveis e ocupados para sala/data |
| `GET` | `/api/v1/appointments/:id` | Busca agendamento por ID |
| `POST` | `/api/v1/appointments` | Cadastra agendamento após validar regras de disponibilidade |
| `PATCH` | `/api/v1/appointments/:id` | Atualiza visitante, sala, data ou horário do agendamento |
| `PATCH` | `/api/v1/appointments/:id/status` | Atualiza status do agendamento |
| `DELETE` | `/api/v1/appointments/:id` | Cancela agendamento preservando histórico |

## Como Executar

### Pré-Requisitos

- Node.js 24
- pnpm 10.26.1
- Docker, para execução com containers
- PostgreSQL 17, para execução local sem Docker

### Instalação

```bash
git clone https://github.com/daviPeter07/Teste-Tecnico-Solasstec.git
cd Teste-Tecnico-Solasstec
corepack enable
pnpm install
```

Para execução local, crie os arquivos de ambiente das aplicações a partir dos exemplos existentes em `api/.env.example` e `web/.env.example`.

Com o banco disponível, prepare o Prisma:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Inicie API e web em desenvolvimento:

```bash
pnpm dev
```

Serviços principais:

| Serviço | Endereço |
| --- | --- |
| Frontend | <http://localhost:3001> |
| API | <http://localhost:3333/api/v1> |
| Swagger | <http://localhost:3333/docs> |
| Health | <http://localhost:3333/api/v1/health> |

## Docker

Para subir a stack completa:

```bash
pnpm docker:up
```

Comandos úteis:

```bash
pnpm docker:logs
pnpm docker:down
docker compose down --volumes
```

O Compose sobe PostgreSQL, API e web. A API aplica migrations antes de iniciar.

## Scripts

### Raiz

| Script | Descrição |
| --- | --- |
| `pnpm dev` | Inicia API e web em desenvolvimento |
| `pnpm build` | Compila todos os projetos |
| `pnpm lint` | Executa lint em todos os projetos |
| `pnpm lint:fix` | Aplica correções automáticas de lint quando disponíveis |
| `pnpm test` | Executa testes disponíveis |
| `pnpm format` | Executa formatação nos projetos que possuem script |
| `pnpm db:generate` | Gera Prisma Client |
| `pnpm db:migrate` | Aplica migrations em desenvolvimento |
| `pnpm db:deploy` | Aplica migrations existentes |
| `pnpm db:seed` | Executa seed da API |
| `pnpm db:studio` | Abre Prisma Studio |
| `pnpm docker:up` | Constrói e inicia a stack |
| `pnpm docker:down` | Encerra a stack |
| `pnpm docker:logs` | Acompanha logs dos containers |

### API

| Script | Descrição |
| --- | --- |
| `pnpm --filter api dev` | Inicia NestJS com watch |
| `pnpm --filter api build` | Compila API |
| `pnpm --filter api lint` | Executa ESLint |
| `pnpm --filter api test` | Executa testes unitários |
| `pnpm --filter api test:e2e` | Executa testes e2e HTTP |

### Web

| Script | Descrição |
| --- | --- |
| `pnpm --filter web dev` | Inicia Next.js |
| `pnpm --filter web build` | Gera build de produção |
| `pnpm --filter web start` | Inicia build de produção |
| `pnpm --filter web lint` | Executa ESLint |
| `pnpm --filter web test` | Executa testes com Vitest |

## Testes E Qualidade

Backend:

- Unitários com Jest para services, repositories e regras de domínio.
- E2E HTTP com Supertest para health, visitantes, salas, feriados e agendamentos.
- `DATABASE_URL` não é hardcoded nos e2e mockados; em `NODE_ENV=test`, a validação de ambiente não exige essa variável.

Frontend:

- Testes Vitest para schemas, utilitários, providers e serviço de health.
- Build Next.js validando rotas e TypeScript.

Comandos recomendados antes de enviar alterações:

```bash
pnpm lint
pnpm test
pnpm build
pnpm --filter api test:e2e -- --runInBand
```

## Documentação

- Especificação do desafio: [`docs/Desafio Solasstec_.pdf`](docs/Desafio%20Solasstec_.pdf)
- Resumos de pull requests: [`docs/pull-requests`](docs/pull-requests)

---

<div align="center">
Desenvolvido para o desafio técnico da Solasstec.
</div>
