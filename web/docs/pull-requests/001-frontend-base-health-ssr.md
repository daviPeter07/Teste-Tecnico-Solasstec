# Estrutura base do frontend com health check SSR

## Contexto

Este PR estabelece a fundação do frontend do Sistema de Portaria Solasstec. A implementação substitui o template inicial do Next.js por uma primeira fatia vertical, define o padrão de organização dos próximos módulos e valida a comunicação entre frontend, API e PostgreSQL.

A página inicial permanece renderizada no servidor. O navegador não recebe a URL interna da API nem executa diretamente o health check do banco de dados.

## Principais alterações

- Organização da rota inicial como módulo vertical com `components`, `hooks`, `services` e `page.tsx`.
- Pastas privadas do App Router identificadas pelo prefixo `_`.
- Health check consultado em Server Component com renderização dinâmica e cache desabilitado.
- Resposta visual reduzida à mensagem de conexão do banco de dados.
- Atualização manual do estado por `router.refresh()`, sem transferir o fetch para o navegador.
- Validação da resposta da API com Zod.
- `API_URL` restrita ao runtime do servidor Next.js.
- TanStack Query configurado globalmente com cliente isolado no servidor e cache estável no navegador.
- Tema claro como padrão, paleta branca e laranja e modo escuro opcional.
- Toggle de tema acessível, persistente e compatível com hidratação SSR.
- Metadata e idioma da aplicação atualizados.
- Testes unitários para o service SSR, provider do React Query e toggle de tema.
- Docker Compose atualizado para frontend em `3001` e backend em `3333`.
- Imagem standalone do Next.js corrigida para incluir os helpers SWC necessários em runtime.
- Documentação principal atualizada com arquitetura, scripts, ambientes e portas.

## Estrutura principal

```text
web/src/
|-- app/
|   |-- (home)/
|   |   |-- _components/
|   |   |-- _hooks/
|   |   |-- _services/
|   |   `-- page.tsx
|   |-- globals.css
|   `-- layout.tsx
|-- components/
|   |-- ui/
|   |-- theme-provider.tsx
|   `-- theme-toggle.tsx
|-- lib/
`-- providers/
    `-- query-provider.tsx
```

## Integração implementada

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/health` | Verifica a conexão com o PostgreSQL |

Quando o banco está disponível, o endpoint responde `200`:

```json
{
  "message": "Banco de dados conectado."
}
```

Quando a conexão falha, responde `503` com o código `DATABASE_UNAVAILABLE` e a mensagem `Banco de dados não conectado.`.

## Tema e interface

- Paleta principal branca e laranja, sem gradientes.
- Tema claro usado quando ainda não existe preferência salva.
- Tema escuro em tons de carvão e laranja.
- Preferência armazenada pelo `next-themes` no navegador.
- Estado do toggle informado por `aria-pressed`.
- Layout validado em desktop e mobile nos dois temas.
- Componentes interativos isolados com `use client`; página e health permanecem Server Components.

## React Query

- `QueryClientProvider` disponível globalmente no layout raiz.
- Novo `QueryClient` criado por renderização no servidor.
- Instância única mantida durante a sessão no navegador.
- Queries consideradas atualizadas por 60 segundos.
- Cache inativo removido após 5 minutos.
- Uma nova tentativa automática para queries.
- Mutations não são repetidas automaticamente.
- Refetch ao focar a janela desabilitado.

## Segurança e configuração

- `API_URL` não usa o prefixo `NEXT_PUBLIC_` e não é incorporada ao JavaScript do navegador.
- O frontend acessa a API por `http://api:3333/api/v1` dentro da rede do Docker Compose.
- Falhas de rede são convertidas em mensagem genérica, sem exposição de detalhes internos.
- O fetch SSR possui timeout e usa `cache: "no-store"`.
- Arquivos `.env` locais permanecem ignorados pelo Git.

## Validações executadas

- `pnpm lint`
- `pnpm --filter web test`
- `pnpm --filter web build`
- `pnpm --filter api test -- --runInBand src/v1/modules/health/test/unit/health.service.spec.ts src/v1/modules/health/test/unit/health.controller.spec.ts`
- `pnpm --filter api test:e2e -- --runInBand src/v1/modules/health/test/e2e/health.e2e-spec.ts`
- `docker compose config --quiet`
- `docker compose up -d --build`

Resultado atual:

- 3 suítes e 8 testes do frontend aprovados.
- 2 suítes e 3 testes unitários direcionados do health aprovados.
- 1 suíte e 2 testes e2e direcionados do health aprovados.
- Lint global e build do frontend aprovados.
- API, frontend e PostgreSQL saudáveis no Docker Compose.
- Frontend respondendo em `http://localhost:3001`.
- Backend respondendo em `http://localhost:3333`.

## Commits

- `feat(web): add SSR backend health page`
- `docs(web): document frontend base structure`
- `fix(infra): align service ports and web runtime`
- `refactor(health): return database connection message`
- `feat(web): add orange theme and dark mode toggle`
- `feat(web): configure TanStack Query provider`

## Checklist

- [x] Estrutura modular por rota.
- [x] Server Components preservados por padrão.
- [x] Health check integrado por SSR.
- [x] URL interna da API protegida no servidor.
- [x] Validação da resposta com Zod.
- [x] TanStack Query configurado.
- [x] Tema claro e escuro implementados.
- [x] Toggle de tema acessível e persistente.
- [x] Layout responsivo e sem gradientes.
- [x] Testes unitários e e2e aprovados.
- [x] Docker Compose validado.
- [x] Documentação atualizada.
