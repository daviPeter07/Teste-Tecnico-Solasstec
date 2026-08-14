# Estrutura base do backend com Prisma e health check

## Contexto

Este PR estabelece a fundação da API do Sistema de Portaria Solasstec. A implementação organiza configuração, infraestrutura de banco, tratamento HTTP e o primeiro módulo versionado, preparando a aplicação para receber os módulos de visitantes, salas, feriados e agendamentos.

O schema Prisma foi modelado a partir do dump oficial fornecido pela empresa, preservando o schema PostgreSQL `desafio`, tabelas, colunas, tipos, índices e relacionamentos.

## Principais alterações

- Configuração global e validada com `ConfigModule` e Joi.
- Prefixo global configurável, com padrão `api/v1`.
- Swagger disponível em `/docs` quando habilitado.
- Helmet, CORS configurável e `ValidationPipe` global.
- Filtro global para respostas de erro padronizadas.
- Interceptor de logging sem exposição de query strings.
- Aliases `@/` e `@generated/` sem uso de `baseUrl`.
- Build com reescrita dos aliases por `tsc-alias`.
- Módulo Prisma com lifecycle de conexão e injeção de dependência.
- Schema, migration inicial e seed baseados no dump oficial.
- Seed idempotente e protegido contra execução concorrente.
- Módulo `health` em `src/v1/modules/health`.
- Repository abstrato e implementação Prisma para o health check.
- Testes unitários e e2e organizados dentro do módulo.
- Docker Compose atualizado com healthcheck da API e migrations no startup.
- Documentação principal atualizada com arquitetura, scripts e ambientes.

## Estrutura principal

```text
api/src/
|-- common/
|-- config/
|-- database/
|   `-- prisma/
`-- v1/
    `-- modules/
        `-- health/
            |-- dto/
            |-- repositories/
            |-- test/
            |   |-- unit/
            |   `-- e2e/
            |-- health.controller.ts
            |-- health.service.ts
            `-- health.module.ts
```

## Endpoint implementado

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Verifica a disponibilidade da API e do PostgreSQL |

Quando o banco está disponível, o endpoint responde `200`. Quando a conexão falha, responde `503` com o código `DATABASE_UNAVAILABLE` e sem expor detalhes sensíveis da conexão.

## Banco de dados

- PostgreSQL 17.
- Prisma ORM 7 com adapter `pg`.
- Modelos armazenados no schema `desafio`.
- Metadados de migration mantidos no schema `public`.
- Migration inicial equivalente ao dump oficial.
- Seed com quatro classificações iniciais de prioridade.
- Prisma Client gerado localmente e ignorado pelo Git.

## Segurança e configuração

- `.env`, Prisma Client, builds e dependências permanecem ignorados pelo Git.
- A origem permitida pelo CORS não possui URL fixa no código ou no Compose.
- Query strings não são registradas pelo interceptor nem refletidas no path dos erros.
- Respostas inesperadas usam mensagem genérica.
- Nenhuma vulnerabilidade de produção foi identificada pelo audit.

## Validações executadas

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm test`
- `pnpm --filter api test:e2e`
- `pnpm build`
- `pnpm --filter api exec prisma validate`
- `pnpm audit --prod`
- `docker compose config --quiet`

Resultado atual:

- 4 suítes e 5 testes unitários aprovados.
- 1 suíte e 2 testes e2e aprovados.
- Build da API e do frontend aprovado.
- Schema Prisma válido.
- Nenhuma vulnerabilidade de produção conhecida.

## Commits

- `feat(database): configure Prisma from official dump`
- `feat(api): configure application foundation`
- `feat(health): add versioned health module`
- `chore(infra): update compose and backend docs`

## Checklist

- [x] Estrutura modular e versionada.
- [x] Configuração e variáveis validadas.
- [x] Prisma conectado por injeção de dependência.
- [x] Dump oficial mapeado no Prisma.
- [x] Migration e seed validados.
- [x] Swagger configurado.
- [x] Health check com status do banco.
- [x] Testes unitários e e2e.
- [x] Docker Compose validado.
- [x] Documentação atualizada.
