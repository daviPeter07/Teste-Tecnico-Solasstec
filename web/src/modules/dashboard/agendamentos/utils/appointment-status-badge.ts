import { normalize } from "@/utils/normalize";

export function getAppointmentStatusBadge(status: number, label: string) {
  switch (status) {
    case 1:
      return {
        label: normalize.status(label),
        className:
          "border border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
      };
    case 2:
      return {
        label: normalize.status(label),
        className:
          "border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      };
    case 3:
      return {
        label: normalize.status(label),
        className:
          "border border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
      };
    case 4:
      return {
        label: normalize.status(label),
        className:
          "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
      };
    default:
      return {
        label: normalize.status(label || "Desconhecido"),
        className:
          "border border-muted bg-muted text-muted-foreground hover:bg-muted",
      };
  }
}
