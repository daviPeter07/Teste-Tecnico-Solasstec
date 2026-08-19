"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAppointmentStatusBadge } from "@/modules/dashboard/agendamentos/utils/appointment-status-badge";
import { useVisitorAppointmentHistory } from "@/modules/dashboard/agendamentos/services/appointments-service";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { PaginationFooter } from "@/modules/dashboard/shared/components/pagination-footer";
import { formatDateOnly } from "@/utils/date-format";
import type { Visitor } from "../schemas/visitor-schema";
import { getVisitorDocumentLabel } from "../utils/visitor-document";

export interface VisitorAppointmentHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visitor: Visitor;
}

export function VisitorAppointmentHistoryModal({
  open,
  onOpenChange,
  visitor,
}: VisitorAppointmentHistoryModalProps) {
  const [page, setPage] = useState(1);
  const appointments = useVisitorAppointmentHistory(visitor.id, page);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-none border border-border bg-card p-6 sm:max-w-3xl sm:p-8">
        <DialogHeader className="mb-4 space-y-1 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Histórico de agendamentos
          </DialogTitle>
          <DialogDescription>
            Registros de {visitor.name}, incluindo cancelados e finalizados.
          </DialogDescription>
        </DialogHeader>

        <div className="border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">{visitor.name}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {getVisitorDocumentLabel(visitor.documentType, visitor.document)}
          </p>
        </div>

        {appointments.isPending && (
          <div className="h-56 animate-pulse border border-border bg-muted" />
        )}

        {appointments.isError && (
          <div className="border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Não conseguimos carregar o histórico deste visitante agora.
          </div>
        )}

        {appointments.data?.data.length === 0 && (
          <DashboardEmptyState
            icon={CalendarClock}
            title="Nenhum agendamento registrado"
            description="Este visitante ainda não possui histórico de agendamentos."
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
                        <h3 className="font-semibold">{appointment.room.name}</h3>
                        <Badge className={statusBadge.className}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Capacidade: {appointment.room.capacity} pessoa(s)
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium">
                        {formatDateOnly(appointment.date)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.startsAt}
                      </p>
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
