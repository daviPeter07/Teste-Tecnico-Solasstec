"use client";

import { useState } from "react";
import type { Holiday } from "../schemas/holiday-schema";

export function useHolidayModal() {
  const [open, setOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [initialDate, setInitialDate] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

  function openCreate(date?: string) {
    setSelectedHoliday(null);
    setInitialDate(date ?? null);
    setOpen(true);
  }

  function openEdit(holiday: Holiday) {
    setSelectedHoliday(holiday);
    setInitialDate(null);
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
    initialDate,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    holidayToDelete,
    openDelete,
  };
}
