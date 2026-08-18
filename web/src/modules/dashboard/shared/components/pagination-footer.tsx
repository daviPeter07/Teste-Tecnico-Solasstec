"use client";

import { Button } from "@/components/ui/button";

export interface PaginationMeta {
  page: number;
  total: number;
  totalPages: number;
}

export interface PaginationFooterProps {
  meta: PaginationMeta;
  summaryLabel: string;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationFooter({
  meta,
  summaryLabel,
  isFetching,
  onPageChange,
}: PaginationFooterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-xs text-muted-foreground">
        {meta.total} {summaryLabel} · página {meta.page} de {Math.max(meta.totalPages, 1)}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          disabled={meta.page <= 1 || isFetching}
          onClick={() => onPageChange(Math.max(meta.page - 1, 1))}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-none"
          disabled={meta.page >= meta.totalPages || isFetching}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
