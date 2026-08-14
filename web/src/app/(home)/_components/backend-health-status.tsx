import {
  Activity,
  CircleCheck,
  CircleX,
  Clock3,
  Database,
  Radio,
  Server,
} from "lucide-react";
import { getBackendHealth } from "../_services/get-backend-health";
import { RefreshStatusButton } from "./refresh-status-button";

export async function BackendHealthStatus() {
  const health = await getBackendHealth();
  const checkedAt = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(health.checkedAt));

  return (
    <section
      aria-live="polite"
      className="overflow-hidden border border-slate-200 bg-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.45)]"
    >
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative p-7 sm:p-10 lg:p-12">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1.5 bg-slate-900"
          />

          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold tracking-[0.14em] uppercase ${
                health.connected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <span className="relative flex size-2">
                {health.connected && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                )}
                <span
                  className={`relative inline-flex size-2 rounded-full ${health.connected ? "bg-emerald-600" : "bg-rose-600"}`}
                />
              </span>
              {health.connected ? "Sistema operacional" : "Atenção necessária"}
            </div>

            <span className="inline-flex items-center gap-2 font-mono text-xs text-slate-500">
              <Clock3 aria-hidden="true" className="size-3.5" />
              leitura SSR às {checkedAt} · Brasília
            </span>
          </div>

          <div className="max-w-2xl">
            <div
              className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${
                health.connected
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
              }`}
            >
              {health.connected ? (
                <CircleCheck aria-hidden="true" className="size-7" />
              ) : (
                <CircleX aria-hidden="true" className="size-7" />
              )}
            </div>

            <p className="mb-2 font-mono text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Canal web → API
            </p>
            <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              {health.connected
                ? "Backend conectado com sucesso."
                : "Backend indisponível no momento."}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              {health.connected
                ? "A API e o PostgreSQL responderam ao health check. A portaria está pronta para receber operações."
                : health.reason}
            </p>
          </div>

          <div className="mt-9">
            <RefreshStatusButton />
          </div>
        </div>

        <aside className="border-t border-slate-200 bg-slate-950 p-7 text-slate-100 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
          <div className="flex items-center gap-3 text-slate-400">
            <Radio aria-hidden="true" className="size-4" />
            <span className="font-mono text-xs tracking-[0.18em] uppercase">
              telemetria
            </span>
          </div>

          <div className="mt-10 space-y-4">
            <StatusMetric
              icon={Server}
              label="Serviço"
              value={health.connected ? health.service : "sem resposta"}
            />
            <StatusMetric
              icon={Database}
              label="PostgreSQL"
              value={
                health.connected
                  ? `${health.databaseLatencyMs} ms`
                  : "não verificado"
              }
            />
            <StatusMetric
              icon={Activity}
              label="Uptime da API"
              value={
                health.connected
                  ? formatUptime(health.uptimeSeconds)
                  : "não verificado"
              }
            />
          </div>

          <div className="mt-10 border-t border-white/10 pt-7">
            <p className="text-sm leading-6 text-slate-400">
              Esta leitura acontece no servidor Next.js. A topologia interna da API
              não é enviada ao navegador.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function BackendHealthStatusSkeleton() {
  return (
    <div className="grid min-h-[520px] animate-pulse border border-slate-200 bg-white lg:grid-cols-[1.2fr_0.8fr]">
      <div className="p-10 lg:p-12">
        <div className="h-7 w-44 rounded-full bg-slate-200" />
        <div className="mt-14 h-14 w-14 rounded-2xl bg-slate-200" />
        <div className="mt-8 h-5 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-12 max-w-xl rounded bg-slate-200" />
        <div className="mt-3 h-12 max-w-md rounded bg-slate-100" />
      </div>
      <div className="bg-slate-900 p-10 lg:p-12">
        <div className="h-5 w-28 rounded bg-white/10" />
        <div className="mt-12 space-y-4">
          <div className="h-20 rounded-xl bg-white/5" />
          <div className="h-20 rounded-xl bg-white/5" />
          <div className="h-20 rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function StatusMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Server;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 border border-white/10 bg-white/[0.04] p-4">
      <div className="flex size-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-emerald-400">
        <Icon aria-hidden="true" className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[0.65rem] tracking-[0.16em] text-slate-500 uppercase">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-medium text-slate-100">{value}</p>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)} segundos`;
  if (seconds < 3_600) return `${Math.floor(seconds / 60)} minutos`;
  return `${Math.floor(seconds / 3_600)} horas`;
}
