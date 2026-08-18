"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-72 flex-col items-center justify-center border border-dashed border-border bg-card p-8 text-center",
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction} className="mt-6 rounded-none">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
