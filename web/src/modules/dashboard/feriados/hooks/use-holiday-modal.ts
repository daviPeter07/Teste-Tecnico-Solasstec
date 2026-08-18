"use client";

import { useState } from "react";
import type { Holiday } from "../schemas/holiday-schema";

export function useHolidayModal() {
  const [open, setOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

  function openCreate() {
    setSelectedHoliday(null);
    setOpen(true);
  }

  function openEdit(holiday: Holiday) {
    setSelectedHoliday(holiday);
    setOpen(true);
  }

  function openDelete(holiday: Holiday) {
    setHolidayToDelete(holiday);
    setDeleteOpen(true);
  }

  return {
    open,
    setOpen,
    selectedHoliday,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    holidayToDelete,
    openDelete,
  };
}
