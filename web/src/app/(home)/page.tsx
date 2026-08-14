import { Suspense } from "react";
import { Building2, ShieldCheck } from "lucide-react";
import {
  BackendHealthStatus,
  BackendHealthStatusSkeleton,
} from "./_components/backend-health-status";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f3f6f4] text-slate-950">
      <div aria-hidden="true" className="absolute inset-y-0 left-[8%] w-px bg-slate-300/50" />
      <div aria-hidden="true" className="absolute inset-y-0 right-[8%] w-px bg-slate-300/50" />
      <div aria-hidden="true" className="absolute top-[22%] right-0 left-0 h-px bg-slate-300/40" />
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full border-[64px] border-emerald-600/10"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-slate-300/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-slate-950 text-white">
              <Building2 aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.08em] text-slate-950 uppercase">
                Solasstec
              </p>
              <p className="font-mono text-[0.65rem] tracking-[0.17em] text-slate-500 uppercase">
                Portaria corporativa
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-slate-600 sm:flex">
            <ShieldCheck aria-hidden="true" className="size-4 text-emerald-700" />
            Verificação server-side
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center py-14 sm:py-20">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold tracking-[0.2em] text-emerald-800 uppercase">
                Diagnóstico de integração
              </p>
              <h1 className="max-w-3xl text-4xl leading-[0.95] font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
                Estado da conexão
                <span className="block text-slate-400">em tempo real.</span>
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-600 lg:pb-1 lg:text-right">
              A página é renderizada no servidor e consulta diretamente o health check
              da API antes de entregar o HTML.
            </p>
          </div>

          <Suspense fallback={<BackendHealthStatusSkeleton />}>
            <BackendHealthStatus />
          </Suspense>
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-300/80 pt-5 font-mono text-[0.65rem] tracking-[0.12em] text-slate-500 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Ambiente de integração</span>
          <span>Next.js SSR · NestJS · PostgreSQL</span>
        </footer>
      </div>
    </main>
  );
}
