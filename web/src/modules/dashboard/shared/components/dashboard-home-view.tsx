import Link from "next/link";
import { ArrowUpRight, CalendarDays, DoorOpen, Users } from "lucide-react";
import { PageHeader } from "./page-header";

const areas = [
  {
    href: "/visitantes",
    title: "Visitantes",
    description: "Cadastre pessoas e identifique prioridades automaticamente.",
    icon: Users,
    available: true,
  },
  {
    href: "/salas",
    title: "Salas",
    description: "Organize capacidade, responsáveis e horários de funcionamento.",
    icon: DoorOpen,
    available: true,
  },
  {
    href: "/feriados",
    title: "Feriados",
    description: "Gerencie datas que afetam novas reservas.",
    icon: CalendarDays,
    available: false,
  },
] as const;

export function DashboardHomeView() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Painel operacional"
        title="Visão geral"
        description="Acesse as áreas da portaria sem métricas fictícias. Os indicadores serão adicionados conforme os módulos passarem a fornecer dados reais."
      />

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Áreas do sistema">
        {areas.map((area, index) => {
          const Icon = area.icon;
          return (
            <Link
              key={area.href}
              href={area.href}
              className="group relative min-h-56 overflow-hidden border border-border bg-card p-6 transition-colors hover:border-orange-400 dark:hover:border-orange-700"
            >
              <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
              <div className="mt-9 flex items-start justify-between gap-4">
                <span className="flex size-12 items-center justify-center bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">{area.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {area.description}
              </p>
              {!area.available && (
                <span className="absolute top-5 right-5 bg-muted px-2 py-1 font-mono text-[0.58rem] tracking-wider text-muted-foreground uppercase">
                  Em breve
                </span>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
