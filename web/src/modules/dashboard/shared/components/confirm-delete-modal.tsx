"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  confirmLabel = "Confirmar exclusão",
  loadingLabel = "Excluindo...",
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-none bg-popover p-6 shadow-lg">
        <DialogHeader className="flex flex-col items-start gap-3">
          <span className="flex size-11 items-center justify-center bg-destructive/10 text-destructive">
            <AlertTriangle aria-hidden="true" className="size-5" />
          </span>
          <div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-none"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-none"
            disabled={isLoading}
            onClick={() => {
              void onConfirm();
            }}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
