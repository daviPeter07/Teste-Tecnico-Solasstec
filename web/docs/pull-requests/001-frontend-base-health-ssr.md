# feat(web): cria estrutura modular e health check SSR

## Contexto

O frontend ainda utilizava a página inicial padrão do Next.js e não validava a comunicação com a API. Este PR cria a primeira fatia vertical da aplicação e estabelece o padrão arquitetural para os próximos módulos.

## Alterações

- Organiza a rota inicial como um módulo vertical com `components`, `hooks`, `services` e `page.tsx`.
- Substitui o template inicial por uma tela responsiva de diagnóstico da integração.
- Consulta `GET /api/v1/health` em um Server Component com renderização dinâmica e sem cache.
- Mantém `API_URL` restrita ao servidor e usa a rede interna do Docker Compose em produção.
- Padroniza o frontend na porta `3001` e o backend na porta `3333`.
- Corrige a imagem standalone do Next.js para incluir os helpers SWC exigidos em runtime.
- Exibe somente a mensagem que confirma se o banco de dados está conectado.
- Adota paleta branca e laranja com tema escuro opcional e tema claro como padrão.
- Adiciona toggle acessível com persistência da preferência de tema.
- Configura o TanStack Query globalmente com cache estável no navegador e defaults de atualização.
- Permite solicitar uma nova leitura por `router.refresh()` sem mover o acesso à API para o navegador.
- Adiciona testes unitários para sucesso, falha de rede e configuração ausente.
- Atualiza a documentação de arquitetura, ambiente e scripts do frontend.

## Validação

- `pnpm --filter web lint`
- `pnpm --filter web test`
- `pnpm --filter web build`
- `docker compose config --quiet`
