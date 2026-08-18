"use client";

import { CalendarClock, CheckCircle2, CircleCheckBig, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionIconButton } from "@/modules/dashboard/shared/components/action-icon-button";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { DashboardListToolbar } from "@/modules/dashboard/shared/components/dashboard-list-toolbar";
import { PaginationFooter } from "@/modules/dashboard/shared/components/pagination-footer";
import { useDashboardListState } from "@/modules/dashboard/shared/hooks/use-dashboard-list-state";
import { formatDateOnly } from "@/utils/date-format";
import type { Appointment } from "../schemas/appointment-schema";
import { useAppointments, useUpdateAppointmentStatus } from "../services/appointments-service";
import { getAppointmentStatusBadge } from "../utils/appointment-status-badge";

export interface AppointmentListProps {
  onEditAppointment?: (appointment: Appointment) => void;
  onCreateAppointment?: () => void;
  onDeleteAppointment?: (appointment: Appointment) => void;
}

export function AppointmentList({
  onEditAppointment,
  onCreateAppointment,
  onDeleteAppointment,
}: AppointmentListProps) {
  const { searchParam, pageParam, inputValue, onSearchChange, setPageParam } =
    useDashboardListState();

  const appointments = useAppointments(searchParam.trim(), pageParam);
  const updateStatus = useUpdateAppointmentStatus();

  function updateAppointmentStatus(appointment: Appointment, status: number) {
    updateStatus.mutate({ id: appointment.id, status });
  }

  return (
    <section className="space-y-5">
      <DashboardListToolbar
        inputValue={inputValue}
        onSearchChange={onSearchChange}
        placeholder="Buscar por visitante, documento ou sala"
        ariaLabel="Buscar agendamentos"
        createLabel="Novo agendamento"
        onCreate={onCreateAppointment}
      />

      {appointments.isPending && <div className="h-72 animate-pulse border border-border bg-muted" />}
      {appointments.isError && (
        <DashboardEmptyState
          icon={CalendarClock}
          title="Não foi possível carregar os agendamentos"
          description="Tente novamente em instantes."
          actionLabel="Novo agendamento"
          onAction={onCreateAppointment}
        />
      )}
      {appointments.data?.data.length === 0 && (
        <DashboardEmptyState
          icon={CalendarClock}
          title={searchParam ? "Nenhum agendamento encontrado" : "Nenhum agendamento cadastrado"}
          description={
            searchParam
              ? "Tente buscar por outro visitante, documento ou sala."
              : "Crie o primeiro agendamento validando sala, feriados e conflitos automaticamente."
          }
          actionLabel="Novo agendamento"
          onAction={onCreateAppointment}
        />
      )}
      {appointments.data && appointments.data.data.length > 0 && (
        <>
          <div className="hidden border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitante</TableHead>
                  <TableHead>Sala</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.data.data.map((appointment) => {
                  const statusBadge = getAppointmentStatusBadge(
                    appointment.status,
                    appointment.statusLabel,
                  );

                  return (
                    <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="font-medium">{appointment.visitor.name}</div>
                    </TableCell>
                    <TableCell>{appointment.room.name}</TableCell>
                    <TableCell>{formatDateOnly(appointment.date)}</TableCell>
                    <TableCell>{appointment.startsAt}</TableCell>
                    <TableCell>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {appointment.status === 1 && (
                            <ActionIconButton
                              label="Confirmar"
                              icon={<CheckCircle2 aria-hidden="true" className="size-4" />}
                              className="rounded-none text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                              disabled={updateStatus.isPending}
                              onClick={() => updateAppointmentStatus(appointment, 2)}
                            />
                          )}
                          {appointment.status === 2 && (
                            <ActionIconButton
                              label="Finalizar"
                              icon={<CircleCheckBig aria-hidden="true" className="size-4" />}
                              className="rounded-none text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
                              disabled={updateStatus.isPending}
                              onClick={() => updateAppointmentStatus(appointment, 4)}
                            />
                          )}
                          <ActionIconButton
                            label="Editar"
                            icon={<Pencil aria-hidden="true" className="size-4" />}
                            onClick={() => onEditAppointment?.(appointment)}
                          />
                        <ActionIconButton
                          label="Cancelar"
                          icon={<Trash2 aria-hidden="true" className="size-4" />}
                          className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDeleteAppointment?.(appointment)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {appointments.data.data.map((appointment) => {
              const statusBadge = getAppointmentStatusBadge(
                appointment.status,
                appointment.statusLabel,
              );

              return (
                <article key={appointment.id} className="border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{appointment.visitor.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{appointment.room.name}</p>
                  </div>
                  <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock aria-hidden="true" className="size-4 text-primary" />
                  {formatDateOnly(appointment.date)} · {appointment.startsAt}
                </p>
                <div className="mt-5 flex items-center justify-end gap-1 border-t border-border pt-3">
                  {appointment.status === 1 && (
                    <ActionIconButton
                      label="Confirmar"
                      icon={<CheckCircle2 aria-hidden="true" className="size-4" />}
                      className="rounded-none text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                      disabled={updateStatus.isPending}
                      onClick={() => updateAppointmentStatus(appointment, 2)}
                    />
                  )}
                  {appointment.status === 2 && (
                    <ActionIconButton
                      label="Finalizar"
                      icon={<CircleCheckBig aria-hidden="true" className="size-4" />}
                      className="rounded-none text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:text-sky-300 dark:hover:bg-sky-950/40"
                      disabled={updateStatus.isPending}
                      onClick={() => updateAppointmentStatus(appointment, 4)}
                    />
                  )}
                  <ActionIconButton
                    label="Editar"
                    icon={<Pencil aria-hidden="true" className="size-4" />}
                    onClick={() => onEditAppointment?.(appointment)}
                  />
                  <ActionIconButton
                    label="Cancelar"
                    icon={<Trash2 aria-hidden="true" className="size-4" />}
                    className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDeleteAppointment?.(appointment)}
                  />
                </div>
              </article>
              );
            })}
          </div>

          <PaginationFooter
            meta={appointments.data.meta}
            summaryLabel="agendamento(s) ativo(s)"
            isFetching={appointments.isFetching}
            onPageChange={(page) => setPageParam(page)}
          />
        </>
      )}
    </section>
  );
}
