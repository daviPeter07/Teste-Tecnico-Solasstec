import { Construction } from "lucide-react";

export function ComingSoon({ area }: { area: string }) {
  return (
    <section className="flex min-h-[55vh] items-center justify-center">
      <div className="max-w-lg border border-border bg-card p-10 text-center shadow-sm sm:p-16">
        <span className="mx-auto flex size-14 items-center justify-center bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
          <Construction aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-7 font-mono text-xs tracking-[0.18em] text-primary uppercase">
          {area}
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em]">Em breve</h1>
      </div>
    </section>
  );
}
