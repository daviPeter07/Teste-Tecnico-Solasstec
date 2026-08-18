"use client";

import { ConfirmDeleteModal } from "@/modules/dashboard/shared/components/confirm-delete-modal";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { useRoomModal } from "../hooks/use-room-modal";
import { useDeleteRoom } from "../hooks/use-rooms";
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
  } = useRoomModal();
  const deleteRoom = useDeleteRoom();

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
      />
      <RoomFormModal
        open={open}
        onOpenChange={setOpen}
        roomToEdit={selectedRoom}
      />
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
    </div>
  );
}
