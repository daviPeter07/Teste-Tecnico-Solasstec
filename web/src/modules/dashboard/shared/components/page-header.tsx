import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 font-mono text-[0.7rem] font-semibold tracking-[0.18em] text-primary uppercase">
          {eyebrow}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-0.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
