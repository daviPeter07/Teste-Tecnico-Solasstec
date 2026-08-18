"use client";

import { useState } from "react";
import { ConfirmDeleteModal } from "@/modules/dashboard/shared/components/confirm-delete-modal";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { RoomFormModal } from "@/modules/dashboard/salas/components/room-form";
import { VisitorFormModal } from "@/modules/dashboard/visitantes/components/visitor-form";
import { AppointmentFormModal } from "./appointment-form";
import { AppointmentList } from "./appointment-list";
import { useAppointmentModal } from "../hooks/use-appointment-modal";
import { useDeleteAppointment } from "../services/appointments-service";

export function AppointmentsView() {
  const {
    open,
    setOpen,
    selectedAppointment,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    appointmentToDelete,
    openDelete,
  } = useAppointmentModal();
  const deleteAppointment = useDeleteAppointment();
  const [visitorCreateOpen, setVisitorCreateOpen] = useState(false);
  const [roomCreateOpen, setRoomCreateOpen] = useState(false);

  function openRelatedCreate(type: "visitor" | "room") {
    setOpen(false);
    if (type === "visitor") setVisitorCreateOpen(true);
    if (type === "room") setRoomCreateOpen(true);
  }

  function closeRelatedCreate(type: "visitor" | "room", nextOpen: boolean) {
    if (type === "visitor") setVisitorCreateOpen(nextOpen);
    if (type === "room") setRoomCreateOpen(nextOpen);
    if (!nextOpen) setOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Agendamentos"
        description="Acompanhe a ocupação de salas e o fluxo de agendamentos da portaria."
      />
      <AppointmentList
        onEditAppointment={openEdit}
        onCreateAppointment={openCreate}
        onDeleteAppointment={openDelete}
      />
      {open && (
        <AppointmentFormModal
          open={open}
          onOpenChange={setOpen}
          appointmentToEdit={selectedAppointment}
          onCreateVisitor={() => openRelatedCreate("visitor")}
          onCreateRoom={() => openRelatedCreate("room")}
        />
      )}
      {visitorCreateOpen && (
        <VisitorFormModal
          open={visitorCreateOpen}
          onOpenChange={(nextOpen) => closeRelatedCreate("visitor", nextOpen)}
        />
      )}
      {roomCreateOpen && (
        <RoomFormModal
          open={roomCreateOpen}
          onOpenChange={(nextOpen) => closeRelatedCreate("room", nextOpen)}
        />
      )}
      {deleteOpen && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Cancelar agendamento"
          description={`Tem certeza que deseja cancelar o agendamento de "${appointmentToDelete?.visitor.name ?? "este visitante"}"? O histórico será preservado.`}
          isLoading={deleteAppointment.isPending}
          confirmLabel="Confirmar cancelamento"
          loadingLabel="Cancelando..."
          onConfirm={async () => {
            if (!appointmentToDelete) return;
            await deleteAppointment.mutateAsync(appointmentToDelete.id);
            setDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
}
