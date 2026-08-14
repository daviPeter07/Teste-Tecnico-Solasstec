"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function useRefreshBackendStatus() {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  function refresh() {
    startTransition(() => router.refresh());
  }

  return { isRefreshing, refresh };
}
