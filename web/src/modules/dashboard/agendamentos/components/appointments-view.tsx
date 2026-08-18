import { ComingSoon } from "@/modules/dashboard/shared/components/coming-soon";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";

export function AppointmentsView() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operação"
        title="Agendamentos"
        description="Acompanhe a ocupação de salas e o fluxo de agendamentos da portaria."
      />
      <ComingSoon area="Agendamentos" />
    </div>
  );
}
