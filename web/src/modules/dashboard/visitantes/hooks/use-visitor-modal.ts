"use client";

import { useState } from "react";
import type { Visitor } from "../schemas/visitor-schema";

export function useVisitorModal() {
  const [open, setOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [visitorToDelete, setVisitorToDelete] = useState<Visitor | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [visitorToShowHistory, setVisitorToShowHistory] =
    useState<Visitor | null>(null);

  function openCreate() {
    setSelectedVisitor(null);
    setOpen(true);
  }

  function openEdit(visitor: Visitor) {
    setSelectedVisitor(visitor);
    setOpen(true);
  }

  function openDelete(visitor: Visitor) {
    setVisitorToDelete(visitor);
    setDeleteOpen(true);
  }

  function openHistory(visitor: Visitor) {
    setVisitorToShowHistory(visitor);
    setHistoryOpen(true);
  }

  return {
    open,
    setOpen,
    selectedVisitor,
    openCreate,
    openEdit,
    deleteOpen,
    setDeleteOpen,
    visitorToDelete,
    openDelete,
    historyOpen,
    setHistoryOpen,
    visitorToShowHistory,
    openHistory,
  };
}
