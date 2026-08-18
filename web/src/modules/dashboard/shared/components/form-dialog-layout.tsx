import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface FormDialogLayoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function FormDialogLayout({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidthClass = "sm:max-w-2xl",
}: FormDialogLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] w-full overflow-y-auto rounded-none border border-border bg-card p-6 sm:p-8 ${maxWidthClass}`}
      >
        <DialogHeader className="mb-4 space-y-1 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
