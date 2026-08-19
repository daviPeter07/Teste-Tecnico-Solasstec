"use client";

import { useRef } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionIconButton } from "@/modules/dashboard/shared/components/action-icon-button";
import { cn } from "@/lib/utils";
import { formatDateOnly } from "@/utils/date-format";
import { useHolidays } from "../services/holidays-service";
import type { Holiday } from "../schemas/holiday-schema";

export interface HolidayCalendarProps {
  month: Date;
  selectedDate?: string | null;
  onMonthChange: (month: Date) => void;
  onCreateHoliday: (date?: string) => void;
  onFocusHolidayDate?: (date: string) => void;
  onEditHoliday?: (holiday: Holiday) => void;
  onDeleteHoliday?: (holiday: Holiday) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, monthIndex) => ({
  value: String(monthIndex),
  label: format(new Date(2026, monthIndex, 1), "MMMM", { locale: ptBR }).toUpperCase(),
}));

const HOLIDAY_TYPE_LABELS: Record<number, string> = {
  1: "Nacional",
  2: "Estadual",
  3: "Municipal",
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getHolidayTypeLabel(type: Holiday["type"]) {
  return type ? HOLIDAY_TYPE_LABELS[type] : "Sem tipo";
}

function getHolidayTone(type: Holiday["type"]) {
  if (type === 1) {
    return "border-red-300 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200";
  }
  if (type === 2) {
    return "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/30 dark:text-sky-200";
  }
  if (type === 3) {
    return "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200";
  }
  return "border-border bg-muted text-foreground";
}

export function HolidayCalendar({
  month,
  selectedDate,
  onMonthChange,
  onCreateHoliday,
  onFocusHolidayDate,
  onEditHoliday,
  onDeleteHoliday,
}: HolidayCalendarProps) {
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const holidays = useHolidays("", 1, 100, true, {
    dateFrom: toDateKey(monthStart),
    dateTo: toDateKey(monthEnd),
  });
  const visibleDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  });
  const currentYear = month.getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);
  const holidaysByDate = new Map(
    holidays.data?.data.map((holiday) => [holiday.date, holiday]) ?? [],
  );
  const monthHolidays = holidays.data?.data ?? [];

  function focusHolidayDate(date: string) {
    onMonthChange(new Date(`${date}T00:00:00`));
    onFocusHolidayDate?.(date);
    requestAnimationFrame(() => {
      dayRefs.current[date]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
      dayRefs.current[date]?.focus({ preventScroll: true });
    });
  }

  function changeMonth(monthIndex: string) {
    onMonthChange(new Date(month.getFullYear(), Number(monthIndex), 1));
  }

  function changeYear(year: string) {
    onMonthChange(new Date(Number(year), month.getMonth(), 1));
  }

  return (
    <section className="overflow-hidden border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="border-b border-border lg:border-r lg:border-b-0">
          <div className="flex flex-col gap-4 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                Agenda de feriados
              </p>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_7rem] gap-2 sm:flex sm:items-center">
                <Select value={String(month.getMonth())} onValueChange={changeMonth}>
                  <SelectTrigger className="h-12 rounded-none border-border bg-background text-base font-semibold uppercase tracking-tight sm:w-56 sm:text-lg" aria-label="Filtrar por mês">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(currentYear)} onValueChange={changeYear}>
                  <SelectTrigger className="h-12 rounded-none border-border bg-background text-base font-semibold sm:w-32 sm:text-lg" aria-label="Filtrar por ano">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">

              <Button
                type="button"
                className="h-10 rounded-none"
                onClick={() => onCreateHoliday()}
              >
                <Plus aria-hidden="true" className="mr-2 size-4" />
                Novo feriado
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-none"
                onClick={() => onMonthChange(new Date())}
              >
                Hoje
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-none"
                aria-label="Mês anterior"
                onClick={() => onMonthChange(addMonths(month, -1))}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-none"
                aria-label="Próximo mês"
                onClick={() => onMonthChange(addMonths(month, 1))}
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>

          {holidays.isPending && <div className="h-[34rem] animate-pulse bg-muted" />}
          {holidays.isError && (
            <div className="flex h-[34rem] items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Não conseguimos carregar o calendário deste mês agora.
            </div>
          )}
          {holidays.data && (
            <div className="p-3 sm:p-5">
              <div className="grid grid-cols-7 border-t border-l border-border">
                {WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    className="border-r border-b border-border bg-muted/50 px-2 py-2 text-center text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                  >
                    {weekday}
                  </div>
                ))}
                {visibleDays.map((day) => {
                  const dateKey = toDateKey(day);
                  const holiday = holidaysByDate.get(dateKey);
                  const isCurrentMonth = isSameMonth(day, month);
                  const isSelected = selectedDate === dateKey;

                  return (
                    <button
                      ref={(element) => {
                        dayRefs.current[dateKey] = element;
                      }}
                      key={dateKey}
                      type="button"
                      disabled={!isCurrentMonth}
                      aria-label={
                        holiday
                          ? `Editar feriado ${holiday.description} em ${formatDateOnly(dateKey, "full")}`
                          : `Cadastrar feriado em ${formatDateOnly(dateKey, "full")}`
                      }
                      className={cn(
                        "group relative flex min-h-24 flex-col border-r border-b border-border p-2 text-left transition sm:min-h-32 sm:p-3",
                        isCurrentMonth
                          ? "bg-background hover:bg-muted/60"
                          : "cursor-not-allowed bg-muted/30 text-muted-foreground opacity-50",
                        holiday && [
                          "z-10 -m-px border p-[calc(--spacing(2)+1px)] sm:p-[calc(--spacing(3)+1px)]",
                          getHolidayTone(holiday.type),
                        ],
                        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                      )}
                      onClick={() => {
                        if (!isCurrentMonth) return;
                        if (holiday) onEditHoliday?.(holiday);
                        else onCreateHoliday(dateKey);
                      }}
                    >
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center border border-transparent text-sm font-semibold",
                          isToday(day) && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {holiday ? (
                        <span className="mt-3 block w-full min-w-0 space-y-1">
                          <span
                            className="line-clamp-3 w-full text-[11px] font-semibold leading-snug break-words sm:text-xs"
                            title={holiday.description}
                          >
                            {holiday.description}
                          </span>
                          <span className="block w-full truncate text-[11px] opacity-75 sm:text-xs">
                            {getHolidayTypeLabel(holiday.type)}
                          </span>
                        </span>
                      ) : (
                        isCurrentMonth && (
                          <span className="mt-auto hidden items-center gap-1 pt-3 text-xs text-muted-foreground opacity-0 transition group-hover:flex group-hover:opacity-100 sm:flex">
                            <Plus aria-hidden="true" className="size-3" />
                            Adicionar
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="flex max-h-[42rem] min-h-0 flex-col bg-muted/20 p-5 lg:max-h-[46rem]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Feriados do mês</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Clique em um dia livre para cadastrar um bloqueio.
              </p>
            </div>
            <Badge variant="secondary" className="rounded-none">
              {monthHolidays.length}
            </Badge>
          </div>

          <div className="mt-5 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-1">
            {[1, 2, 3, null].map((type) => (
              <div
                key={type ?? "none"}
                className={cn(
                  "border px-3 py-2 font-medium",
                  getHolidayTone(type as Holiday["type"]),
                )}
              >
                {getHolidayTypeLabel(type as Holiday["type"])}
              </div>
            ))}
          </div>

          <div className="mt-6 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {holidays.isPending && <div className="h-40 animate-pulse border border-border bg-muted" />}
            {monthHolidays.length === 0 && holidays.data && (
              <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">
                Nenhum feriado ativo neste mês.
              </div>
            )}
            {monthHolidays.map((holiday) => (
              <article
                key={holiday.id}
                className="cursor-pointer border border-border bg-card p-3 transition hover:bg-muted/50"
                onClick={() => focusHolidayDate(holiday.date)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold">{holiday.description}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      {formatDateOnly(holiday.date, "full")}
                    </p>
                  </div>
                  <Badge className={cn("shrink-0 rounded-none border text-[10px]", getHolidayTone(holiday.type))}>
                    {getHolidayTypeLabel(holiday.type)}
                  </Badge>
                </div>
                <div className="mt-3 flex justify-end gap-1 border-t border-border pt-2">
                  <ActionIconButton
                    label="Editar"
                    icon={<Pencil aria-hidden="true" className="size-4" />}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditHoliday?.(holiday);
                    }}
                  />
                  <ActionIconButton
                    label="Inativar"
                    icon={<Trash2 aria-hidden="true" className="size-4" />}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteHoliday?.(holiday);
                    }}
                  />
                </div>
              </article>
            ))}
          </div>

          <Button
            type="button"
            className="mt-6 h-11 rounded-none"
            onClick={() => onCreateHoliday()}
          >
            <Plus aria-hidden="true" className="mr-2 size-4" />
            Novo feriado
          </Button>
        </aside>
      </div>
    </section>
  );
}
