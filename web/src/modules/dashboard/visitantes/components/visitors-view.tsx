"use client";

import { ConfirmDeleteModal } from "@/modules/dashboard/shared/components/confirm-delete-modal";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { useVisitorModal } from "../hooks/use-visitor-modal";
import { useDeleteVisitor } from "../services/visitors-service";
import { VisitorAppointmentHistoryModal } from "./visitor-appointment-history-modal";
import { VisitorFormModal } from "./visitor-form";
import { VisitorList } from "./visitor-list";

export function VisitorsView() {
  const {
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
  } = useVisitorModal();
  const deleteVisitor = useDeleteVisitor();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cadastros"
        title="Visitantes"
        description="Consulte pessoas cadastradas e acompanhe a classificação automática de prioridade."
      />
      <VisitorList
        onEditVisitor={openEdit}
        onCreateVisitor={openCreate}
        onDeleteVisitor={openDelete}
        onShowHistory={openHistory}
      />
      {open && (
        <VisitorFormModal
          open={open}
          onOpenChange={setOpen}
          visitorToEdit={selectedVisitor}
        />
      )}
      {deleteOpen && (
        <ConfirmDeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Inativar visitante"
          description={`Tem certeza que deseja inativar o cadastro de "${visitorToDelete?.name ?? "este visitante"}"? O registro sairá da lista principal e ficará disponível em Inativos.`}
          isLoading={deleteVisitor.isPending}
          confirmLabel="Confirmar inativação"
          loadingLabel="Inativando..."
          onConfirm={async () => {
            if (!visitorToDelete) return;
            await deleteVisitor.mutateAsync(visitorToDelete.id);
            setDeleteOpen(false);
          }}
        />
      )}
      {historyOpen && visitorToShowHistory && (
        <VisitorAppointmentHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          visitor={visitorToShowHistory}
        />
      )}
    </div>
  );
}
