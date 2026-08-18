"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAppointmentStatusBadge } from "@/modules/dashboard/agendamentos/utils/appointment-status-badge";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { PaginationFooter } from "@/modules/dashboard/shared/components/pagination-footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateOnly } from "@/utils/date-format";
import { useRoomAppointmentHistory } from "@/modules/dashboard/agendamentos/services/appointments-service";
import { getVisitorDocumentLabel } from "@/modules/dashboard/visitantes/utils/visitor-document";
import type { Room } from "../schemas/room-schema";

export interface RoomAppointmentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  onCreateAppointment?: (room: Room) => void;
}

export function RoomAppointmentHistoryModal({
  open,
  onOpenChange,
  room,
  onCreateAppointment,
}: RoomAppointmentHistoryModalProps) {
  const [page, setPage] = useState(1);
  const appointments = useRoomAppointmentHistory(room.id, page);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-none border border-border bg-card p-6 sm:max-w-3xl sm:p-8">
        <DialogHeader className="mb-4 space-y-1 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Histórico de agendamentos
          </DialogTitle>
          <DialogDescription>
            Agendamentos já registrados para {room.name}, incluindo cancelados.
          </DialogDescription>
        </DialogHeader>

        {appointments.isPending && (
          <div className="h-56 animate-pulse border border-border bg-muted" />
        )}

        {appointments.isError && (
          <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Não conseguimos carregar o histórico desta sala agora.
          </div>
        )}

        {appointments.data?.data.length === 0 && (
          <DashboardEmptyState
            icon={CalendarClock}
            title="Nenhum agendamento registrado"
            description="Esta sala ainda não possui histórico de agendamentos."
            actionLabel="Criar agendamento para esta sala"
            onAction={onCreateAppointment ? () => onCreateAppointment(room) : undefined}
            className="min-h-56 bg-transparent"
          />
        )}

        {appointments.data && appointments.data.data.length > 0 && (
          <div className="space-y-4">
            <div className="divide-y divide-border border border-border">
              {appointments.data.data.map((appointment) => {
                const statusBadge = getAppointmentStatusBadge(
                  appointment.status,
                  appointment.statusLabel,
                );

                return (
                  <article
                    key={appointment.id}
                    className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{appointment.visitor.name}</h3>
                      <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getVisitorDocumentLabel(
                        appointment.visitor.documentType,
                        appointment.visitor.document,
                      )} · {appointment.visitor.priority}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium">{formatDateOnly(appointment.date)}</p>
                    <p className="text-sm text-muted-foreground">{appointment.startsAt}</p>
                  </div>
                </article>
                );
              })}
            </div>

            <PaginationFooter
              meta={appointments.data.meta}
              summaryLabel="registro(s)"
              isFetching={appointments.isFetching}
              onPageChange={setPage}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
