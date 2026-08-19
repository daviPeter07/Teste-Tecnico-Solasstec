"use client";

import { toast } from "sonner";

export function notifyError(error: Error) {
  toast.error(
    error instanceof Error
      ? error.message
      : "Não foi possível concluir a operação.",
  );
}