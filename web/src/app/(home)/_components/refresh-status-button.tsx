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
      className="h-11 rounded-none border-orange-200 bg-white px-4 text-orange-800 shadow-none hover:bg-orange-50 dark:border-orange-800 dark:bg-zinc-950 dark:text-orange-200 dark:hover:bg-orange-950"
    >
      <RefreshCw
        aria-hidden="true"
        className={isRefreshing ? "animate-spin" : undefined}
      />
      {isRefreshing ? "Verificando" : "Verificar novamente"}
    </Button>
  );
}
