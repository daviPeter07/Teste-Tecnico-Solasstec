import { Suspense } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BackendHealthStatus,
  BackendHealthStatusSkeleton,
} from "./_components/backend-health-status";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="absolute inset-y-0 left-[8%] w-px bg-border/60" />
      <div aria-hidden="true" className="absolute inset-y-0 right-[8%] w-px bg-border/60" />
      <div aria-hidden="true" className="absolute top-[22%] right-0 left-0 h-px bg-border/50" />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full border-[64px] border-orange-500/10 dark:border-orange-500/15"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-orange-600 text-white dark:bg-orange-500 dark:text-zinc-950">
              <Building2 aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.08em] text-foreground uppercase">
                Solasstec
              </p>
              <p className="font-mono text-[0.65rem] tracking-[0.17em] text-muted-foreground uppercase">
                Portaria corporativa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex">
              <ShieldCheck aria-hidden="true" className="size-4 text-orange-600 dark:text-orange-400" />
              Verificação server-side
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center py-14 sm:py-20">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-orange-700 uppercase dark:text-orange-400">
                Diagnóstico de integração
              </p>
              <h1 className="max-w-3xl text-4xl leading-[0.95] font-semibold tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
                Estado da conexão
                <span className="block text-orange-600 dark:text-orange-400">em tempo real.</span>
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground lg:pb-1 lg:text-right">
              A página é renderizada no servidor e consulta diretamente o health check
              da API antes de entregar o HTML.
            </p>
          </div>

          <Suspense fallback={<BackendHealthStatusSkeleton />}>
            <BackendHealthStatus />
          </Suspense>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border pt-5 font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Ambiente de integração</span>
          <span>Next.js SSR · NestJS · PostgreSQL</span>
        </footer>
      </div>
    </main>
  );
}
