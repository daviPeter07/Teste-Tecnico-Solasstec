"use client";

import { useState } from "react";
import { AppointmentFormModal } from "@/modules/dashboard/agendamentos/components/appointment-form";
import { ConfirmDeleteModal } from "@/modules/dashboard/shared/components/confirm-delete-modal";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { VisitorFormModal } from "@/modules/dashboard/visitantes/components/visitor-form";
import { useRoomModal } from "../hooks/use-room-modal";
import { useDeleteRoom } from "../services/rooms-service";
import type { Room } from "../schemas/room-schema";
import { RoomAppointmentHistoryModal } from "./room-appointment-history-modal";
import { RoomFormModal } from "./room-form";
import { RoomList } from "./room-list";

export function RoomsView() {
  const {
    open,
    setOpen,
    selectedRoom,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    roomToDelete,
    openDelete,
    historyOpen,
    setHistoryOpen,
    roomToShowHistory,
    openHistory,
  } = useRoomModal();
  const deleteRoom = useDeleteRoom();
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentRoom, setAppointmentRoom] = useState<Room | null>(null);
  const [visitorCreateOpen, setVisitorCreateOpen] = useState(false);

  function openAppointmentForRoom(room: Room) {
    setHistoryOpen(false);
    setAppointmentRoom(room);
    setAppointmentOpen(true);
  }

  function openVisitorCreate() {
    setAppointmentOpen(false);
    setVisitorCreateOpen(true);
  }

  function closeVisitorCreate(nextOpen: boolean) {
    setVisitorCreateOpen(nextOpen);
    if (!nextOpen) setAppointmentOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Estrutura"
        title="Salas"
        description="Consulte capacidade, responsável atual e horários disponíveis de cada ambiente."
      />
      <RoomList
        onEditRoom={openEdit}
        onCreateRoom={openCreate}
        onDeleteRoom={openDelete}
        onShowHistory={openHistory}
      />
      {open && (
        <RoomFormModal
          open={open}
          onOpenChange={setOpen}
          roomToEdit={selectedRoom}
        />
      )}
      {deleteOpen && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Excluir sala"
          description={`Tem certeza que deseja excluir a sala "${roomToDelete?.name ?? "esta sala"}"? Esta ação não poderá ser desfeita.`}
          isLoading={deleteRoom.isPending}
          onConfirm={async () => {
            if (!roomToDelete) return;
            await deleteRoom.mutateAsync(roomToDelete.id);
            setDeleteOpen(false);
          }}
        />
      )}
      {historyOpen && roomToShowHistory && (
        <RoomAppointmentHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          room={roomToShowHistory}
          onCreateAppointment={openAppointmentForRoom}
        />
      )}
      {appointmentOpen && appointmentRoom && (
        <AppointmentFormModal
          open={appointmentOpen}
          onOpenChange={setAppointmentOpen}
          defaultRoom={appointmentRoom}
          onCreateVisitor={openVisitorCreate}
        />
      )}
      {visitorCreateOpen && (
        <VisitorFormModal
          open={visitorCreateOpen}
          onOpenChange={closeVisitorCreate}
        />
      )}
    </div>
  );
}
