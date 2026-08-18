"use client";

import { ConfirmDeleteModal } from "@/modules/dashboard/shared/components/confirm-delete-modal";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";
import { useVisitorModal } from "../hooks/use-visitor-modal";
import { useDeleteVisitor } from "../services/visitors-service";
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
          title="Excluir visitante"
          description={`Tem certeza que deseja excluir o cadastro de "${visitorToDelete?.name ?? "este visitante"}"? Esta ação não poderá ser desfeita.`}
          isLoading={deleteVisitor.isPending}
          onConfirm={async () => {
            if (!visitorToDelete) return;
            await deleteVisitor.mutateAsync(visitorToDelete.id);
            setDeleteOpen(false);
          }}
        />
      )}
    </div>
  );
}
