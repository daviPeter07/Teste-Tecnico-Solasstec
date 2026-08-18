"use client";

import { useMemo, useState } from "react";
import { ArchiveX, Trash2 } from "lucide-react";
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
import { useAppointments, useDeleteInactiveAppointments } from "@/modules/dashboard/agendamentos/services/appointments-service";
import { useDeleteInactiveHolidays, useHolidays } from "@/modules/dashboard/feriados/services/holidays-service";
import { useDeleteInactiveRooms, useRooms } from "@/modules/dashboard/salas/services/rooms-service";
import { ActiveStatusBadge } from "@/modules/dashboard/shared/components/active-status-badge";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { useDeleteInactiveVisitors, useVisitors } from "@/modules/dashboard/visitantes/services/visitors-service";
import { getVisitorDocumentLabel } from "@/modules/dashboard/visitantes/utils/visitor-document";
import { formatDateOnly } from "@/utils/date-format";
import { formatRoomSchedule } from "@/utils/normalize";

type InactiveRecordType = "visitor" | "room" | "holiday" | "appointment";

interface InactiveRecordRow {
  key: string;
  id: number;
  type: InactiveRecordType;
  origin: string;
  title: string;
  detail: string;
  date: string;
  active: boolean;
}

const typeBadgeClassNames: Record<InactiveRecordType, string> = {
  visitor: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300",
  room: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
  holiday: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300",
  appointment: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
};

export function InactiveRecordsView() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const visitors = useVisitors("", 1, 100, false);
  const rooms = useRooms("", 1, 100, false);
  const holidays = useHolidays("", 1, 100, false);
  const appointments = useAppointments("", 1, { limit: 100, active: false });
  const deleteVisitors = useDeleteInactiveVisitors();
  const deleteRooms = useDeleteInactiveRooms();
  const deleteHolidays = useDeleteInactiveHolidays();
  const deleteAppointments = useDeleteInactiveAppointments();

  const records = useMemo<InactiveRecordRow[]>(() => {
    const visitorRows =
      visitors.data?.data.map((visitor) => ({
        key: `visitor-${visitor.id}`,
        id: visitor.id,
        type: "visitor" as const,
        origin: "Visitante",
        title: visitor.name,
        detail: getVisitorDocumentLabel(visitor.documentType, visitor.document),
        date: formatDateOnly(visitor.createdAt, "short"),
        active: visitor.active,
      })) ?? [];

    const roomRows =
      rooms.data?.data.map((room) => ({
        key: `room-${room.id}`,
        id: room.id,
        type: "room" as const,
        origin: "Sala",
        title: room.name,
        detail: `${room.capacity} pessoas · ${formatRoomSchedule(room.availability)[0]?.timeLabel ?? "Sem horário"}`,
        date: formatDateOnly(room.createdAt, "short"),
        active: room.active,
      })) ?? [];

    const holidayRows =
      holidays.data?.data.map((holiday) => ({
        key: `holiday-${holiday.id}`,
        id: holiday.id,
        type: "holiday" as const,
        origin: "Feriado",
        title: holiday.description,
        detail: formatDateOnly(holiday.date),
        date: formatDateOnly(holiday.createdAt, "short"),
        active: holiday.active,
      })) ?? [];

    const appointmentRows =
      appointments.data?.data.map((appointment) => ({
        key: `appointment-${appointment.id}`,
        id: appointment.id,
        type: "appointment" as const,
        origin: "Agendamento",
        title: appointment.visitor.name,
        detail: `${appointment.room.name} · ${formatDateOnly(appointment.date)} · ${appointment.startsAt}`,
        date: formatDateOnly(appointment.createdAt, "short"),
        active: appointment.active,
      })) ?? [];

    return [...visitorRows, ...roomRows, ...holidayRows, ...appointmentRows];
  }, [appointments.data?.data, holidays.data?.data, rooms.data?.data, visitors.data?.data]);

  const selectedRecords = records.filter((record) => selectedKeys.includes(record.key));
  const allSelected = records.length > 0 && selectedKeys.length === records.length;
  const isLoading = visitors.isPending || rooms.isPending || holidays.isPending || appointments.isPending;
  const isDeleting =
    deleteVisitors.isPending ||
    deleteRooms.isPending ||
    deleteHolidays.isPending ||
    deleteAppointments.isPending;

  function toggleAll() {
    setSelectedKeys(allSelected ? [] : records.map((record) => record.key));
  }

  function toggleRecord(key: string) {
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((selectedKey) => selectedKey !== key) : [...current, key],
    );
  }

  async function deleteSelected() {
    if (selectedRecords.length === 0) return;
    if (!window.confirm("Excluir definitivamente os registros selecionados?")) return;
    await deleteGroupedRecords(selectedRecords);
    setSelectedKeys([]);
  }

  async function deleteAll() {
    if (records.length === 0) return;
    if (!window.confirm("Excluir definitivamente todos os registros inativos?")) return;
    await Promise.all([
      visitors.data?.data.length ? deleteVisitors.mutateAsync(undefined) : Promise.resolve(),
      rooms.data?.data.length ? deleteRooms.mutateAsync(undefined) : Promise.resolve(),
      holidays.data?.data.length ? deleteHolidays.mutateAsync(undefined) : Promise.resolve(),
      appointments.data?.data.length ? deleteAppointments.mutateAsync(undefined) : Promise.resolve(),
    ]);
    setSelectedKeys([]);
  }

  async function deleteGroupedRecords(rows: InactiveRecordRow[]) {
    const idsByType = rows.reduce<Record<InactiveRecordType, number[]>>(
      (groups, row) => {
        groups[row.type].push(row.id);
        return groups;
      },
      { visitor: [], room: [], holiday: [], appointment: [] },
    );

    await Promise.all([
      idsByType.visitor.length ? deleteVisitors.mutateAsync(idsByType.visitor) : Promise.resolve(),
      idsByType.room.length ? deleteRooms.mutateAsync(idsByType.room) : Promise.resolve(),
      idsByType.holiday.length ? deleteHolidays.mutateAsync(idsByType.holiday) : Promise.resolve(),
      idsByType.appointment.length ? deleteAppointments.mutateAsync(idsByType.appointment) : Promise.resolve(),
    ]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lixeira"
        title="Registros inativos"
        description="Veja tudo que saiu das listas principais e exclua definitivamente quando não houver mais necessidade de manter o registro."
      />

      <section className="space-y-4 border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Tabela única de inativos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visitantes, salas, feriados e agendamentos inativos aparecem juntos aqui.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              disabled={selectedRecords.length === 0 || isDeleting}
              onClick={deleteSelected}
            >
              <Trash2 aria-hidden="true" className="mr-2 size-4" />
              Excluir selecionados
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-none"
              disabled={records.length === 0 || isDeleting}
              onClick={deleteAll}
            >
              Excluir todos
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-72 animate-pulse bg-muted" />
        ) : records.length > 0 ? (
          <div className="overflow-hidden border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Detalhe</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.key}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${record.title}`}
                        checked={selectedKeys.includes(record.key)}
                        onChange={() => toggleRecord(record.key)}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge className={typeBadgeClassNames[record.type]}>{record.origin}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>{record.detail}</TableCell>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>
                      <ActiveStatusBadge active={record.active} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <DashboardEmptyState
            icon={ArchiveX}
            title="Nenhum registro inativo"
            description="Quando algo for removido das listas principais, aparecerá aqui antes da exclusão definitiva."
          />
        )}
      </section>
    </div>
  );
}
