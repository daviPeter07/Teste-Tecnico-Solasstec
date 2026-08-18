import { ComingSoon } from "@/modules/dashboard/shared/components/coming-soon";
import { PageHeader } from "@/modules/dashboard/shared/components/page-header";

export function HolidaysView() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendário"
        title="Feriados"
        description="Gerencie feriados e datas de exceção que afetam agendamentos."
      />
      <ComingSoon area="Feriados" />
    </div>
  );
}
