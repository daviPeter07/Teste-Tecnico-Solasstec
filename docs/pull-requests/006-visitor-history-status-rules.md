# Histórico por visitante e regras de status

## Contexto

Este PR alinha o dashboard a pontos explícitos da especificação original do desafio. A entrega adiciona consulta de histórico completo por visitante, melhora textos de busca por CPF/RG e endurece as transições de status de agendamentos para impedir mudanças inválidas.

## Principais alterações

- Histórico completo de agendamentos por visitante na tela de visitantes.
- Ação `Histórico` adicionada aos registros de visitantes, seguindo o padrão de ícone com tooltip neutro.
- Hook `useVisitorAppointmentHistory` reaproveitando `GET /api/v1/appointments` com `visitorId` e `includeInactive=true`.
- Busca de visitantes ajustada para informar nome, CPF ou RG.
- Busca de agendamentos ajustada para informar visitante, CPF, RG ou sala.
- Transições de status de agendamento passam a ser validadas no backend.
- Cancelamento por `DELETE /api/v1/appointments/:id` passa pelo mesmo fluxo de transição para status cancelado.
- Agendamentos finalizados não podem ser editados ou cancelados.
- Ações inválidas deixam de aparecer para agendamentos finalizados no frontend.
- Textos de inativação nas listas principais foram alinhados ao fluxo de soft delete e à tela de Inativos.
- README atualizado com CPF/RG, histórico por visitante ou sala, inativos e transições controladas de status.
- `requests.http` atualizado com exemplos de histórico por visitante/sala e transição inválida de status.

## Backend

### Histórico por visitante

O endpoint existente de agendamentos passa a ser usado também como consulta de histórico por visitante:

```http
GET /api/v1/appointments?visitorId=1&includeInactive=true&limit=15&page=1
```

Com `includeInactive=true`, a consulta inclui registros cancelados/inativos, atendendo ao histórico completo exigido pela especificação.

### Transições de status

As mudanças permitidas são:

| Status atual | Próximos status permitidos |
| --- | --- |
| Pendente | Confirmado, Cancelado |
| Confirmado | Finalizado, Cancelado |
| Cancelado | Nenhum |
| Finalizado | Nenhum |

Tentativas inválidas retornam `400` com o código `INVALID_APPOINTMENT_STATUS_TRANSITION`.

Quando o status passa para `Cancelado`, o agendamento também é marcado como inativo para sair da lista principal e permanecer nos históricos.

## Frontend

### Visitantes

- A tabela e os cards de visitantes agora têm ação de histórico.
- O modal exibe agendamentos do visitante com sala, capacidade, data, horário e status.
- O documento do visitante aparece no cabeçalho do modal usando CPF/RG formatado.
- A busca deixa claro que aceita nome, CPF ou RG.

### Agendamentos

- Agendamentos pendentes mostram ações para confirmar, editar e cancelar.
- Agendamentos confirmados mostram ações para finalizar, editar e cancelar.
- Agendamentos finalizados não exibem ações de edição ou cancelamento.
- A busca deixa claro que aceita visitante, CPF, RG ou sala.

### Soft delete

- Modais de visitantes, salas e feriados usam `Inativar` em vez de `Excluir`.
- As descrições informam que o registro sairá da lista principal e ficará disponível em Inativos.
- Exclusão definitiva continua restrita à tela `/inativos`.

## Validações executadas

- `pnpm --filter api lint`
- `pnpm --filter api test -- --runInBand`
- `pnpm --filter api test:e2e -- --runInBand`
- `pnpm --filter api build`
- `pnpm --filter web lint`
- `pnpm --filter web test -- --run`
- `pnpm --filter web build`

## Checklist

- [x] Histórico por visitante implementado.
- [x] Consulta inclui registros cancelados/inativos.
- [x] Transições de status validadas no backend.
- [x] Cancelamento usa a mesma regra de status.
- [x] Agendamento finalizado não pode ser editado ou cancelado.
- [x] Textos de busca ajustados para CPF/RG.
- [x] Textos de soft delete ajustados.
- [x] README atualizado.
- [x] Testes, lint e build aprovados.
