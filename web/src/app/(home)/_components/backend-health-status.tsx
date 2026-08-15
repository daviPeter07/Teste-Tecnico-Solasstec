import { CircleCheck, CircleX } from "lucide-react";
import { getBackendHealth } from "../_services/get-backend-health";
import { RefreshStatusButton } from "./refresh-status-button";

export async function BackendHealthStatus() {
  const health = await getBackendHealth();

  return (
    <section
      aria-live="polite"
      className="overflow-hidden border border-border bg-card text-card-foreground shadow-[0_24px_70px_-34px_rgba(124,45,18,0.32)] dark:shadow-[0_24px_70px_-34px_rgba(249,115,22,0.2)]"
    >
      <div className="relative p-7 sm:p-10 lg:p-14">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1.5 bg-orange-600 dark:bg-orange-500"
        />

        <div className="max-w-3xl">
          <div
            className={`mb-6 flex size-14 items-center justify-center rounded-2xl ${
              health.connected
                ? "bg-orange-600 text-white dark:bg-orange-500 dark:text-zinc-950"
                : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
            }`}
          >
            {health.connected ? (
              <CircleCheck aria-hidden="true" className="size-7" />
            ) : (
              <CircleX aria-hidden="true" className="size-7" />
            )}
          </div>

          <h2 className="max-w-xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-card-foreground sm:text-5xl">
            {health.message}
          </h2>
        </div>

        <div className="mt-9">
          <RefreshStatusButton />
        </div>
      </div>
    </section>
  );
}

export function BackendHealthStatusSkeleton() {
  return (
    <div className="min-h-72 animate-pulse border border-border bg-card p-10 lg:p-14">
      <div className="h-14 w-14 rounded-2xl bg-orange-200 dark:bg-orange-950" />
      <div className="mt-8 h-12 max-w-xl rounded bg-muted" />
      <div className="mt-9 h-11 w-48 rounded bg-muted" />
    </div>
  );
}
