# Ajustes de gestão do dashboard e registros inativos

## Contexto

Este PR consolida ajustes de operação do dashboard após a entrega de agendamentos. A entrega amplia os dados de seed, corrige paginação e filtros booleanos, restaura o suporte a RG para visitantes, melhora a responsividade mobile e cria uma área única para gerenciar registros inativos.

## Principais alterações

- Seed ampliado com visitantes, salas, feriados e agendamentos para demonstração completa do fluxo.
- Visitantes de seed agora incluem documentos `CPF` e `RG`.
- Paginação padrão ajustada para 15 registros na API e no frontend.
- Correção da conversão de query params booleanos como `active=false`.
- Endpoints para exclusão definitiva de registros inativos em visitantes, salas, feriados e agendamentos.
- Tela `/inativos` com tabela única para consultar e excluir definitivamente registros inativos.
- Suporte a documento `CPF` ou `RG` no cadastro, edição, listagem e busca de visitantes.
- Exibição de documento CPF/RG padronizada em visitantes, agendamentos, histórico de sala e inativos.
- Ações de tabela trocadas para botões apenas com ícones e tooltip neutro.
- Navegação mobile por dock inferior, mantendo a sidebar para desktop.
- Tabelas com cabeçalho destacado, zebra rows e sem hover laranja no header.
- Badge compartilhada para status ativo/inativo com texto derivado do booleano `active`.
- Ações de status de agendamento para confirmar pendentes e finalizar confirmados.
- KPI de salas ajustado para salas disponíveis.
- KPI de agendamentos ajustado para confirmados nos próximos 7 dias.
- Correção de scroll por wheel/touch no combobox de entidades.
- Arquivo `requests.http` adicionado com exemplos de chamadas manuais para a API.

## Backend

### Visitantes

- `DOCUMENT_TYPES` passa a aceitar `CPF` e `RG`.
- CPF continua com validação matemática.
- RG é normalizado para maiúsculas alfanuméricas e validado entre 7 e 14 caracteres.
- A mensagem de documento inválido foi generalizada para documento, não apenas CPF.
- Edição de visitante com RG volta a ser suportada.
- Busca por documento normaliza CPF/RG antes de consultar.

### Inativos

| Método | Rota | Descrição |
| --- | --- | --- |
| `DELETE` | `/api/v1/visitors/inactive` | Exclui definitivamente visitantes inativos |
| `DELETE` | `/api/v1/rooms/inactive` | Exclui definitivamente salas inativas |
| `DELETE` | `/api/v1/holidays/inactive` | Exclui definitivamente feriados inativos |
| `DELETE` | `/api/v1/appointments/inactive` | Exclui definitivamente agendamentos inativos |

As rotas aceitam body opcional no formato:

```json
{
  "ids": [1, 2, 3]
}
```

Quando `ids` não é enviado, a API tenta excluir todos os registros inativos daquele domínio.

### Agendamentos

- Listagem passa a aceitar `status`, `startsFrom`, `startsTo`, `active` e `includeInactive`.
- Resposta de agendamento inclui `visitor.documentType` para o frontend formatar CPF/RG corretamente.
- Status pode ser atualizado por `PATCH /api/v1/appointments/:id/status`.
- Cancelamento continua preservando histórico por soft delete.

## Frontend

### Visitantes

- Formulário usa controle segmentado para escolher entre `CPF` e `RG`, sem select.
- Máscara, placeholder e validação mudam conforme o tipo selecionado.
- Listagem usa coluna `Documento` e mostra `CPF` ou `RG` antes do valor formatado.
- Busca informa que aceita nome ou documento.

### Inativos

- Nova rota `/inativos` adicionada ao dashboard.
- Tabela única agrega visitantes, salas, feriados e agendamentos inativos.
- Permite selecionar registros individualmente.
- Permite excluir definitivamente registros selecionados ou todos os inativos disponíveis.

### Interface

- `ActionIconButton` centraliza ações por ícone com tooltip neutro e `aria-label`.
- `ActiveStatusBadge` centraliza badge baseada em `active`.
- Navegação mobile usa dock inferior com os módulos principais.
- Tabelas compartilham cabeçalho mais forte e linhas alternadas.
- Combobox de entidades aceita scroll por mouse e toque dentro do popover.

## Validações executadas

- `pnpm --filter api lint`
- `pnpm --filter api test -- --runInBand`
- `pnpm --filter api test:e2e -- --runInBand`
- `pnpm --filter api build`
- `pnpm --filter web lint`
- `pnpm --filter web test -- --run`
- `pnpm --filter web build`
- `pnpm --filter api prisma:seed`
- `docker compose up -d --build api`
- `GET http://localhost:3333/api/v1/health`
- `GET http://localhost:3333/api/v1/visitors?search=RG&limit=10`
- Criação real de visitante com `RG`, seguida de soft delete e exclusão definitiva do registro de teste.

## Checklist

- [x] Seed idempotente ampliado.
- [x] Visitantes com CPF e RG suportados.
- [x] Paginação padrão ajustada para 15.
- [x] Query `active=false` corrigida.
- [x] Inativos centralizados em tela própria.
- [x] Exclusão definitiva de inativos implementada.
- [x] Ações de tabela exibidas apenas por ícone.
- [x] Tooltips de ação sem fundo laranja.
- [x] Navegação mobile ajustada.
- [x] KPIs revisados.
- [x] Combobox com scroll corrigido.
- [x] Testes, lint, build e Docker validados.
