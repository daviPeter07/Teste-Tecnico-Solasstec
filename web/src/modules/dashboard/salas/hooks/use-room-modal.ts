"use client";

import { useState } from "react";
import type { Room } from "../schemas/room-schema";

export function useRoomModal() {
  const [open, setOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  function openCreate() {
    setSelectedRoom(null);
    setOpen(true);
  }

  function openEdit(room: Room) {
    setSelectedRoom(room);
    setOpen(true);
  }

  function openDelete(room: Room) {
    setRoomToDelete(room);
    setDeleteOpen(true);
  }

  return {
    open,
    setOpen,
    selectedRoom,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    roomToDelete,
    openDelete,
  };
}
