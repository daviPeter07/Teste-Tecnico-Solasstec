"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRefreshBackendStatus } from "../_hooks/use-refresh-backend-status";

export function RefreshStatusButton() {
  const { isRefreshing, refresh } = useRefreshBackendStatus();

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={refresh}
      disabled={isRefreshing}
      className="h-11 border-slate-300 bg-white/70 px-4 text-slate-800 shadow-sm backdrop-blur hover:bg-white"
    >
      <RefreshCw
        aria-hidden="true"
        className={isRefreshing ? "animate-spin" : undefined}
      />
      {isRefreshing ? "Verificando" : "Verificar novamente"}
    </Button>
  );
}
