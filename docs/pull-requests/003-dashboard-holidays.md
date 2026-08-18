# Dashboard com CRUD de feriados e organização dos módulos

## Contexto

Este PR continua a evolução do dashboard administrativo, preservando visitantes e salas, adicionando o CRUD completo de feriados e ajustando a organização do frontend e do backend para os próximos módulos.

Agendamentos continuam fora do escopo desta entrega. Os feriados cadastrados passam a estar disponíveis para a regra futura de bloqueio de novos agendamentos, sem alterar agendamentos já confirmados.

## Principais alterações

- CRUD backend de feriados em `/api/v1/holidays`.
- CRUD frontend de feriados na rota `/feriados`.
- Frontend integrado diretamente ao backend, sem route handlers `/api` no Next.js para proxy interno.
- Busca, paginação, criação, edição e exclusão lógica de feriados.
- Validação de data no formato `YYYY-MM-DD` e conflito por data duplicada.
- Mensagens de erro de feriados ajustadas para linguagem de usuário.
- React Query, mutations e chamadas HTTP movidos para `services` nos módulos do dashboard.
- Hooks mantidos para estado de UI, principalmente abertura e seleção de modais.
- Modais de visitantes, salas e feriados renderizados apenas quando abertos.
- Dialog simplificado para reduzir custo visual de blur/zoom.
- Exceptions agrupadas por domínio em `common/exceptions`.
- `NotFoundException` genérica adicionada para padronizar exceptions de recurso ausente.
- Testes e2e adicionados para salas e feriados.
- E2E mockado ajustado para não depender de `DATABASE_URL` hardcoded.
- Documentação de PR centralizada em `docs/pull-requests`.
- README atualizado para refletir o estado atual do projeto, sem roadmap e sem seção de variáveis de ambiente.

## Backend

### Feriados

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/holidays` | Lista feriados com busca e paginação |
| `GET` | `/api/v1/holidays/:id` | Busca feriado por ID |
| `POST` | `/api/v1/holidays` | Cadastra feriado |
| `PATCH` | `/api/v1/holidays/:id` | Atualiza feriado |
| `DELETE` | `/api/v1/holidays/:id` | Inativa feriado |

O módulo segue o padrão dos módulos existentes, com controller, DTOs, service, repository abstrato, implementação Prisma e testes no próprio domínio.

### Exceptions

As exceptions foram reorganizadas para deixar claro o domínio de cada erro:

```text
api/src/common/exceptions/
|-- app.exception.ts
|-- not-found.exception.ts
|-- health/
|-- holidays/
|-- rooms/
`-- visitors/
```

Exceptions específicas como `RoomNotFoundException`, `VisitorNotFoundException` e `HolidayNotFoundException` passam a reutilizar a base `NotFoundException`.

### Configuração de teste

`DATABASE_URL` continua obrigatória fora de teste. Em `NODE_ENV=test`, a validação de ambiente permite testes e2e mockados sem connection string real de PostgreSQL.

## Frontend

### Feriados

A tela `/feriados` deixou de ser placeholder e passou a conter:

- listagem responsiva em tabela/cards;
- busca com debounce;
- paginação por query string;
- formulário de criação e edição;
- confirmação de exclusão;
- validação com Zod;
- integração com TanStack Query.

### Organização dos módulos

Os módulos `visitantes`, `salas` e `feriados` seguem a mesma separação:

```text
components/  # UI do módulo
hooks/       # estado local de UI
schemas/     # contratos Zod e tipos
services/    # fetch, queries e mutations
```

## Documentação

- Os resumos de PR foram movidos de `api/docs` e `web/docs` para `docs/pull-requests`.
- O README foi reescrito para descrever o estado atual: visitantes, salas e feriados implementados; agendamentos ainda pendentes.
- A documentação não expõe uma seção dedicada de variáveis de ambiente.

## Validações executadas

- `pnpm --filter api lint`
- `pnpm --filter api test -- --runInBand`
- `pnpm --filter api test:e2e -- --runInBand`
- `pnpm --filter api build`
- `pnpm --filter web lint`
- `pnpm --filter web test -- holiday-schema room-schema visitor-schema --run`
- `pnpm --filter web build`
- `docker compose up -d --build api`
- `GET http://localhost:3333/api/v1/holidays?page=1`

## Commits principais

- `fix(web): call backend API directly from dashboard`
- `refactor(api): group domain exceptions`
- `feat(api): add holiday CRUD module`
- `feat(web): add holidays dashboard CRUD`
- `perf(web): simplify dialog animations`
- `refactor(web): move dashboard data operations to services`
- `fix(api): allow mocked e2e without database URL`
- `test(api): add rooms and holidays e2e coverage`
- `docs: consolidate PR docs and update README`

## Checklist

- [x] CRUD de feriados no backend.
- [x] CRUD de feriados no frontend.
- [x] Soft delete preservado.
- [x] Data de feriado validada como `YYYY-MM-DD`.
- [x] Busca e paginação implementadas.
- [x] Services separados de hooks de UI.
- [x] Exceptions agrupadas por domínio.
- [x] Testes e2e adicionados.
- [x] README atualizado.
