"use client";

import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { DashboardListToolbar } from "@/modules/dashboard/shared/components/dashboard-list-toolbar";
import { PaginationFooter } from "@/modules/dashboard/shared/components/pagination-footer";
import { useDashboardListState } from "@/modules/dashboard/shared/hooks/use-dashboard-list-state";
import { formatDateOnly } from "@/utils/date-format";
import { normalize } from "@/utils/normalize";
import { useHolidays } from "../services/holidays-service";
import type { Holiday } from "../schemas/holiday-schema";

export interface HolidayListProps {
  onEditHoliday?: (holiday: Holiday) => void;
  onCreateHoliday?: () => void;
  onDeleteHoliday?: (holiday: Holiday) => void;
}

const HOLIDAY_TYPE_LABELS: Record<number, string> = {
  1: "Nacional",
  2: "Estadual",
  3: "Municipal",
};

const HOLIDAY_LOAD_ERROR_MESSAGE =
  "Não conseguimos buscar os feriados agora. Tente novamente em instantes.";

function getHolidayTypeLabel(type: Holiday["type"]): string {
  return type ? HOLIDAY_TYPE_LABELS[type] : "Sem tipo";
}

export function HolidayList({
  onEditHoliday,
  onCreateHoliday,
  onDeleteHoliday,
}: HolidayListProps) {
  const { searchParam, pageParam, inputValue, onSearchChange, setPageParam } =
    useDashboardListState();

  const holidays = useHolidays(searchParam.trim(), pageParam);

  return (
    <section className="space-y-5">
      <DashboardListToolbar
        inputValue={inputValue}
        onSearchChange={onSearchChange}
        placeholder="Buscar por descrição ou data"
        ariaLabel="Buscar feriados"
        createLabel="Novo feriado"
        onCreate={onCreateHoliday}
      />

      {holidays.isPending && <div className="h-72 animate-pulse border border-border bg-muted" />}
      {holidays.isError && (
        <DashboardEmptyState
          icon={CalendarDays}
          title="Não foi possível carregar os feriados"
          description={HOLIDAY_LOAD_ERROR_MESSAGE}
          actionLabel="Cadastrar feriado"
          onAction={onCreateHoliday}
        />
      )}
      {holidays.data?.data.length === 0 && (
        <DashboardEmptyState
          icon={CalendarDays}
          title={searchParam ? "Nenhum feriado encontrado" : "Nenhum feriado cadastrado"}
          description={
            searchParam
              ? "Tente buscar por outra descrição ou data no formato AAAA-MM-DD."
              : "Cadastre datas que devem bloquear novos agendamentos."
          }
          actionLabel="Cadastrar feriado"
          onAction={onCreateHoliday}
        />
      )}
      {holidays.data && holidays.data.data.length > 0 && (
        <>
          <div className="hidden border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.data.data.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">
                      {formatDateOnly(holiday.date)}
                    </TableCell>
                    <TableCell>{holiday.description}</TableCell>
                    <TableCell>{getHolidayTypeLabel(holiday.type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{normalize.status("Ativo")}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-none"
                          onClick={() => onEditHoliday?.(holiday)}
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDeleteHoliday?.(holiday)}
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {holidays.data.data.map((holiday) => (
              <article key={holiday.id} className="border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{holiday.description}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                      {formatDateOnly(holiday.date)}
                    </p>
                  </div>
                  <Badge variant="outline">{normalize.status("Ativo")}</Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Tipo: {getHolidayTypeLabel(holiday.type)}
                </p>
                <div className="mt-5 flex items-center justify-end gap-1 border-t border-border pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-none"
                    onClick={() => onEditHoliday?.(holiday)}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDeleteHoliday?.(holiday)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    Excluir
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <PaginationFooter
            meta={holidays.data.meta}
            summaryLabel="feriado(s) ativo(s)"
            isFetching={holidays.isFetching}
            onPageChange={(page) => setPageParam(page)}
          />
        </>
      )}
    </section>
  );
}
