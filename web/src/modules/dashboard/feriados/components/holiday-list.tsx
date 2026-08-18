"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function formatHolidayDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

function getHolidayTypeLabel(type: Holiday["type"]): string {
  return type ? HOLIDAY_TYPE_LABELS[type] : "Sem tipo";
}

export function HolidayList({
  onEditHoliday,
  onCreateHoliday,
  onDeleteHoliday,
}: HolidayListProps) {
  const [searchParam, setSearchParam] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [pageParam, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );

  const [inputState, setInputState] = useState({
    value: searchParam,
    source: searchParam,
  });
  const inputValue = inputState.source === searchParam ? inputState.value : searchParam;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchParam) {
        setSearchParam(inputValue ? inputValue : null);
        setPageParam(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, searchParam, setSearchParam, setPageParam]);

  const holidays = useHolidays(searchParam.trim(), pageParam);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={inputValue}
            onChange={(event) =>
              setInputState({ value: event.target.value, source: searchParam })
            }
            placeholder="Buscar por descrição ou data"
            aria-label="Buscar feriados"
            className="h-11 rounded-none border-border bg-card pl-10"
          />
        </div>
        {onCreateHoliday && (
          <Button
            type="button"
            onClick={onCreateHoliday}
            className="h-11 rounded-none px-5 shrink-0"
          >
            <Plus aria-hidden="true" className="mr-2 size-4" />
            Novo feriado
          </Button>
        )}
      </div>

      {holidays.isPending && <div className="h-72 animate-pulse border border-border bg-muted" />}
      {holidays.isError && (
        <EmptyHolidays
          title="Não foi possível carregar os feriados"
          description={HOLIDAY_LOAD_ERROR_MESSAGE}
          onCreate={onCreateHoliday}
        />
      )}
      {holidays.data?.data.length === 0 && (
        <EmptyHolidays
          title={searchParam ? "Nenhum feriado encontrado" : "Nenhum feriado cadastrado"}
          description={
            searchParam
              ? "Tente buscar por outra descrição ou data no formato AAAA-MM-DD."
              : "Cadastre datas que devem bloquear novos agendamentos."
          }
          onCreate={onCreateHoliday}
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
                      {formatHolidayDate(holiday.date)}
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
                      {formatHolidayDate(holiday.date)}
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {holidays.data.meta.total} feriado(s) ativo(s) · página {holidays.data.meta.page} de{" "}
              {Math.max(holidays.data.meta.totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={pageParam <= 1 || holidays.isFetching}
                onClick={() => setPageParam((current) => Math.max(current - 1, 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={pageParam >= holidays.data.meta.totalPages || holidays.isFetching}
                onClick={() => setPageParam((current) => current + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function EmptyHolidays({
  title,
  description,
  onCreate,
}: {
  title: string;
  description: string;
  onCreate?: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-border bg-card p-8 text-center">
      <CalendarDays aria-hidden="true" className="size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {onCreate && (
        <Button type="button" onClick={onCreate} className="mt-6 rounded-none">
          Cadastrar feriado
        </Button>
      )}
    </div>
  );
}
