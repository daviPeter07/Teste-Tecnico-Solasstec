import { cn } from "@/lib/utils";

export interface RequiredAsteriskProps {
  className?: string;
}

export function RequiredAsterisk({ className }: RequiredAsteriskProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("ml-0.5 font-bold text-destructive select-none", className)}
      title="Campo obrigatório"
    >
      *
    </span>
  );
}
