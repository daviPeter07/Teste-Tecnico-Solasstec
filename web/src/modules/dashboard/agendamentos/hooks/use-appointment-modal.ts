"use client";

import { useState } from "react";
import type { Appointment } from "../schemas/appointment-schema";

export function useAppointmentModal() {
  const [open, setOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  function openCreate() {
    setSelectedAppointment(null);
    setOpen(true);
  }

  function openEdit(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setOpen(true);
  }

  function openDelete(appointment: Appointment) {
    setAppointmentToDelete(appointment);
    setDeleteOpen(true);
  }

  return {
    open,
    setOpen,
    selectedAppointment,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    appointmentToDelete,
    openDelete,
  };
}
