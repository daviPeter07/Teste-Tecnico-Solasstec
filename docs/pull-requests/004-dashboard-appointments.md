# Dashboard com gerenciamento de agendamentos

## Contexto

Este PR implementa o gerenciamento de agendamentos previsto na especificação do desafio. A entrega mantém o padrão modular usado em visitantes, salas e feriados, com regras de negócio concentradas no backend e UI integrada ao dashboard administrativo.

## Principais alterações

- Módulo backend `appointments` com controller, DTOs, service, repository abstrato e implementação Prisma.
- Endpoints REST para listar, consultar, criar, editar, alterar status e cancelar agendamentos.
- Validação de visitante e sala ativos antes de salvar.
- Bloqueio de novos agendamentos em feriados ativos.
- Validação de dias e horários de funcionamento da sala.
- Validação de conflito do mesmo visitante em outra sala no mesmo horário.
- Validação de capacidade máxima da sala por período.
- Migration removendo a constraint de sobreposição por sala para permitir múltiplos agendamentos simultâneos até a capacidade da sala.
- Sugestão automática do próximo horário disponível em erros de disponibilidade.
- Card de sugestão ao selecionar uma data de feriado, permitindo aplicar a próxima data disponível.
- Tela `/agendamentos` substituindo o placeholder por CRUD integrado.
- Seleção de horário por slots disponíveis/ocupados, sem exigir preenchimento manual de horário final.
- Botão `Histórico` nas ações de salas exibindo os agendamentos já registrados para aquela sala.
- Estado vazio do histórico de sala com ação para criar agendamento já deixando a sala selecionada.
- Combobox de visitante e sala usando `Command` + `Popover` no padrão shadcn/ui.
- Combobox de visitantes exibindo nome, CPF mascarado e prioridade em linhas separadas.
- Botão contextual para cadastrar visitante ou sala quando a lista estiver vazia, retornando ao dialog de agendamento ao fechar o cadastro.
- `ApiClientError` preserva `details` para exibir a sugestão retornada pela API.
- Visão geral com indicadores reais, próximo feriado e ações rápidas.
- Badges com cores por prioridade de visitante, capacidade de sala e status de agendamento.
- Refatoração de componentes compartilhados para busca, paginação, estado vazio, datas e schemas paginados.
- Testes unitários e e2e do backend para regras de agendamento.
- Teste de schema do frontend para período e campos obrigatórios.
- README atualizado com endpoints e regras de agendamento.

## Backend

### Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/appointments` | Lista agendamentos com busca, filtros e paginação |
| `GET` | `/api/v1/appointments/availability` | Lista slots disponíveis e ocupados para sala/data |
| `GET` | `/api/v1/appointments/:id` | Busca agendamento por ID |
| `POST` | `/api/v1/appointments` | Cadastra agendamento |
| `PATCH` | `/api/v1/appointments/:id` | Atualiza agendamento |
| `PATCH` | `/api/v1/appointments/:id/status` | Atualiza status |
| `DELETE` | `/api/v1/appointments/:id` | Cancela agendamento |

### Regras implementadas

- Visitante e sala precisam existir e estar ativos.
- `startsAt` deve ser anterior a `endsAt`.
- Quando o cliente envia apenas `startsAt`, a API infere uma duração técnica padrão de 1 hora para validações de conflito/capacidade.
- A data não pode ser feriado ativo.
- A sala precisa funcionar no dia e horário solicitado.
- O visitante não pode ter outro agendamento ativo e pendente/confirmado no mesmo período.
- A quantidade de agendamentos simultâneos da sala não pode ultrapassar sua capacidade.
- Quando a disponibilidade falha, a API responde `422` com `details.suggestion` quando encontra próximo horário possível.

## Frontend

### Tela de agendamentos

A rota `/agendamentos` agora possui:

- listagem responsiva em tabela/cards;
- busca por visitante, CPF ou sala;
- paginação via query string;
- formulário de criação e edição;
- cancelamento com confirmação;
- exibição da sugestão automática retornada pela API;
- combobox pesquisável para visitante e sala.
- seleção visual de horário de atendimento em slots, com horários indisponíveis em cinza.
- card de sugestão de próxima data disponível quando a data selecionada for feriado.

### Visão geral e salas

- A tela inicial mostra totais reais de visitantes, salas, agendamentos e feriados.
- O próximo feriado ativo aparece em destaque com acesso direto à tela de feriados.
- O card de ações rápidas permite ir para agendamento, visitante ou sala.
- A tabela de salas mostra capacidade em badge verde com ícone de pessoas.
- O histórico de sala preserva registros cancelados e sugere criar agendamento quando não há histórico.

### Refatoração frontend

- `useDashboardListState` centraliza busca com debounce e paginação por query string.
- `DashboardListToolbar`, `PaginationFooter` e `DashboardEmptyState` removem repetição das listas.
- `formatDateOnly` e `formatDateTimeInManaus` centralizam formatação de datas.
- `paginatedSchema` centraliza o formato de resposta paginada.
- `buildListParams` centraliza a montagem de query string para listagens.

### Combobox

Foi adicionado `cmdk` e o componente local `Command` para compor comboboxes com `Popover`, preservando o padrão shadcn/ui do projeto.

## Validações executadas

- `pnpm --filter api lint`
- `pnpm --filter api test -- appointments --runInBand`
- `pnpm --filter api test -- --runInBand`
- `pnpm --filter api test:e2e -- appointments.e2e --runInBand`
- `pnpm --filter api test:e2e -- --runInBand`
- `pnpm --filter api build`
- `pnpm --filter web lint`
- `pnpm --filter web test -- appointment-schema --run`
- `pnpm --filter web test -- --run`
- `pnpm --filter web build`
- `docker compose up -d --build api`
- `GET http://localhost:3333/api/v1/appointments?page=1`
- `GET http://localhost:3333/api/v1/appointments?roomId=3&includeInactive=true&page=1`
- Query PostgreSQL confirmando que `agendamento_sala_sem_conflito` foi removida e `agendamento_visitante_sem_conflito` permanece ativa.

## Checklist

- [x] CRUD de agendamentos no backend.
- [x] CRUD de agendamentos no frontend.
- [x] Regras de feriado, expediente, conflito e capacidade implementadas.
- [x] Sugestão automática de próximo horário disponível.
- [x] Combobox de visitante e sala usando shadcn/ui.
- [x] Fluxo contextual para cadastrar visitante ou sala quando não houver opções.
- [x] Testes unitários e e2e adicionados.
- [x] README atualizado.
