"use client";

import { ConfirmDeleteModal } from "@/modules/dashboard/shared/components/confirm-delete-modal";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { HolidayFormModal } from "./holiday-form";
import { HolidayList } from "./holiday-list";
import { useHolidayModal } from "../hooks/use-holiday-modal";
import { useDeleteHoliday } from "../services/holidays-service";

export function HolidaysView() {
  const {
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
  } = useHolidayModal();
  const deleteHoliday = useDeleteHoliday();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendário"
        title="Feriados"
        description="Gerencie feriados e datas de exceção que afetam agendamentos."
      />
      <HolidayList
        onEditHoliday={openEdit}
        onCreateHoliday={openCreate}
        onDeleteHoliday={openDelete}
      />
      {open && (
        <HolidayFormModal
          open={open}
          onOpenChange={setOpen}
          holidayToEdit={selectedHoliday}
          initialDate={initialDate}
        />
      )}
      {deleteOpen && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Inativar feriado"
          description={`Tem certeza que deseja inativar o feriado "${holidayToDelete?.description ?? "este feriado"}"? Esta data deixará de bloquear novos agendamentos e ficará disponível em Inativos.`}
          isLoading={deleteHoliday.isPending}
          confirmLabel="Confirmar inativação"
          loadingLabel="Inativando..."
          onConfirm={async () => {
            if (!holidayToDelete) return;
            await deleteHoliday.mutateAsync(holidayToDelete.id);
            setDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
}
