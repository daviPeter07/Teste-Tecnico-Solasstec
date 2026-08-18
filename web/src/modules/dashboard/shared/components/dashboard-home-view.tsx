"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CalendarClock,
  DoorOpen,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppointments } from "@/modules/dashboard/agendamentos/services/appointments-service";
import { useHolidays } from "@/modules/dashboard/feriados/services/holidays-service";
import { useRooms } from "@/modules/dashboard/salas/services/rooms-service";
import { useVisitors } from "@/modules/dashboard/visitantes/services/visitors-service";
import {
  addDaysDateOnly,
  daysBetweenDateOnly,
  formatDateOnly,
  getDateOnlyInTimeZone,
} from "@/utils/date-format";
import { PageHeader } from "./page-header";

export function DashboardHomeView() {
  const visitors = useVisitors("", 1, 1);
  const rooms = useRooms("", 1, 1);
  const holidays = useHolidays("", 1, 100);
  const today = getDateOnlyInTimeZone();
  const nextSevenDays = addDaysDateOnly(today, 7);
  const confirmedAppointments = useAppointments("", 1, {
    limit: 1,
    status: 2,
    startsFrom: today,
    startsTo: nextSevenDays,
  });
  const nextHoliday = holidays.data?.data.find((holiday) => holiday.active && holiday.date >= today);
  const nextHolidayDays = nextHoliday ? daysBetweenDateOnly(today, nextHoliday.date) : null;
  const isLoadingKpis = visitors.isLoading || rooms.isLoading || confirmedAppointments.isLoading || holidays.isLoading;

  const kpis = [
    {
      label: "Visitantes ativos",
      value: visitors.data?.meta.total,
      hint: "Pessoas que podem ser recebidas",
      icon: Users,
      className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
    },
    {
      label: "Salas disponíveis",
      value: rooms.data?.meta.total,
      hint: "Ambientes disponíveis para uso",
      icon: DoorOpen,
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    },
    {
      label: "Confirmados em 7 dias",
      value: confirmedAppointments.data?.meta.total,
      hint: "Agenda confirmada da semana",
      icon: CalendarClock,
      className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    },
    {
      label: "Feriados ativos",
      value: holidays.data?.meta.total,
      hint: "Dias sem novos horários",
      icon: CalendarDays,
      className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
    },
  ] as const;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Resumo do dia"
        title="Visão geral"
        description="Veja rapidamente como estão visitantes, salas, agendamentos e próximos feriados."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principais">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article key={kpi.label} className="border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <span className={`flex size-10 items-center justify-center ${kpi.className}`}>
                  <Icon aria-hidden="true" className="size-5" />
                </span>
              </div>
              <p className="mt-6 text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-4xl font-semibold tracking-tight">
                {isLoadingKpis ? "..." : (kpi.value ?? 0)}
              </p>
              <p className="mt-3 text-sm leading-5 text-muted-foreground">{kpi.hint}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]" aria-label="Alertas operacionais">
        <article className="relative overflow-hidden border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/35">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                <AlertTriangle aria-hidden="true" className="size-6" />
              </span>
              <div>
                <p className="font-mono text-xs tracking-wider text-amber-800 uppercase dark:text-amber-200">
                  Próximo feriado
                </p>
                {holidays.isLoading ? (
                  <div className="mt-3 h-16 w-72 animate-pulse bg-amber-200/70 dark:bg-amber-900/70" />
                ) : nextHoliday ? (
                  <>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950 dark:text-amber-50">
                      {nextHoliday.description}
                    </h2>
                    <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-100/80">
                      {formatDateOnly(nextHoliday.date, "full")} · {nextHolidayDays === 0 ? "hoje" : `em ${nextHolidayDays} dia(s)`}
                    </p>
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-amber-900/75 dark:text-amber-100/75">
                      Nessa data não será possível criar novos agendamentos. Ao escolher esse dia, o sistema mostra a próxima data disponível da sala.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-amber-950 dark:text-amber-50">
                      Nenhum feriado futuro cadastrado
                    </h2>
                    <p className="mt-2 text-sm text-amber-900/80 dark:text-amber-100/80">
                      Cadastre feriados para evitar agendamentos em dias sem atendimento.
                    </p>
                  </>
                )}
              </div>
            </div>
            <Button asChild variant="outline" className="rounded-none border-amber-300 bg-transparent text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-100 dark:hover:bg-amber-900/50">
              <Link href="/feriados">Ver feriados</Link>
            </Button>
          </div>
        </article>

        <article className="border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Ações rápidas</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Comece pelas tarefas mais usadas no atendimento.
          </p>
          <div className="mt-5 grid gap-2">
            <Button asChild className="h-11 justify-start rounded-none">
              <Link href="/agendamentos">
                <CalendarClock aria-hidden="true" className="mr-2 size-4" />
                Fazer agendamento
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 justify-start rounded-none">
              <Link href="/visitantes">
                <Users aria-hidden="true" className="mr-2 size-4" />
                Registrar visitante
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11 justify-start rounded-none">
              <Link href="/salas">
                <DoorOpen aria-hidden="true" className="mr-2 size-4" />
                Cadastrar sala
              </Link>
            </Button>
          </div>
        </article>
      </section>
    </div>
  );
}
