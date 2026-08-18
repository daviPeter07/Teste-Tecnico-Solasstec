import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActiveStatusBadgeProps {
  active: boolean;
  className?: string;
}

export function ActiveStatusBadge({ active, className }: ActiveStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
        className,
      )}
    >
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}
