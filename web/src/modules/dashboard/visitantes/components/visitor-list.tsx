"use client";

import { CalendarClock, Pencil, Trash2, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionIconButton } from "@/modules/dashboard/shared/components/action-icon-button";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { DashboardListToolbar } from "@/modules/dashboard/shared/components/dashboard-list-toolbar";
import { ActiveStatusBadge } from "@/modules/dashboard/shared/components/active-status-badge";
import { PaginationFooter } from "@/modules/dashboard/shared/components/pagination-footer";
import { useDashboardListState } from "@/modules/dashboard/shared/hooks/use-dashboard-list-state";
import { formatDateOnly } from "@/utils/date-format";
import { normalize } from "@/utils/normalize";
import { useVisitors } from "../services/visitors-service";
import type { Visitor } from "../schemas/visitor-schema";
import { formatVisitorDocument } from "../utils/visitor-document";

export interface VisitorListProps {
  onEditVisitor?: (visitor: Visitor) => void;
  onCreateVisitor?: () => void;
  onDeleteVisitor?: (visitor: Visitor) => void;
  onShowHistory?: (visitor: Visitor) => void;
}

export function VisitorList({
  onEditVisitor,
  onCreateVisitor,
  onDeleteVisitor,
  onShowHistory,
}: VisitorListProps) {
  const { searchParam, pageParam, inputValue, onSearchChange, setPageParam } =
    useDashboardListState();

  const visitors = useVisitors(searchParam.trim(), pageParam);

  return (
    <section className="space-y-5">
      <DashboardListToolbar
        inputValue={inputValue}
        onSearchChange={onSearchChange}
        placeholder="Buscar por nome, CPF ou RG"
        ariaLabel="Buscar visitantes"
        createLabel="Novo visitante"
        onCreate={onCreateVisitor}
      />

      {visitors.isPending && (
        <div className="h-72 animate-pulse border border-border bg-muted" />
      )}
      {visitors.isError && (
        <DashboardEmptyState
          icon={UserCheck}
          title="Não foi possível carregar os visitantes"
          description={visitors.error.message}
          actionLabel="Cadastrar visitante"
          onAction={onCreateVisitor}
        />
      )}
      {visitors.data?.data.length === 0 && (
        <DashboardEmptyState
          icon={UserCheck}
          title={searchParam ? "Nenhum visitante encontrado" : "Nenhum visitante cadastrado"}
          description={
            searchParam
              ? "Tente buscar por outro nome, CPF ou RG."
              : "Cadastre o primeiro visitante para iniciar a operação."
          }
          actionLabel="Cadastrar visitante"
          onAction={onCreateVisitor}
        />
      )}
      {visitors.data && visitors.data.data.length > 0 && (
        <>
          <div className="hidden border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitante</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.data.data.map((visitor) => (
                  <VisitorRow
                    key={visitor.id}
                    visitor={visitor}
                    onEdit={onEditVisitor}
                    onDelete={onDeleteVisitor}
                    onShowHistory={onShowHistory}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {visitors.data.data.map((visitor) => (
              <VisitorCard
                key={visitor.id}
                visitor={visitor}
                onEdit={onEditVisitor}
                onDelete={onDeleteVisitor}
                onShowHistory={onShowHistory}
              />
            ))}
          </div>
          <PaginationFooter
            meta={visitors.data.meta}
            summaryLabel="visitante(s) ativo(s)"
            isFetching={visitors.isFetching}
            onPageChange={(page) => setPageParam(page)}
          />
        </>
      )}
    </section>
  );
}

function VisitorRow({
  visitor,
  onEdit,
  onDelete,
  onShowHistory,
}: {
  visitor: Visitor;
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
  onShowHistory?: (visitor: Visitor) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{visitor.name}</TableCell>
      <TableCell>
        {visitor.documentType} · {formatVisitorDocument(visitor.documentType, visitor.document)}
      </TableCell>
      <TableCell>{formatDate(visitor.birthDate)}</TableCell>
      <TableCell>
        <PriorityBadge visitor={visitor} />
      </TableCell>
      <TableCell>
        <ActiveStatusBadge active={visitor.active} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <ActionIconButton
            label="Histórico"
            icon={<CalendarClock aria-hidden="true" className="size-4" />}
            onClick={() => onShowHistory?.(visitor)}
          />
          <ActionIconButton
            label="Editar"
            icon={<Pencil aria-hidden="true" className="size-4" />}
            onClick={() => onEdit?.(visitor)}
          />
          <ActionIconButton
            label="Inativar"
            icon={<Trash2 aria-hidden="true" className="size-4" />}
            className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(visitor)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function VisitorCard({
  visitor,
  onEdit,
  onDelete,
  onShowHistory,
}: {
  visitor: Visitor;
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
  onShowHistory?: (visitor: Visitor) => void;
}) {
  return (
    <article className="border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{visitor.name}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {visitor.documentType} · {formatVisitorDocument(visitor.documentType, visitor.document)}
          </p>
        </div>
        <PriorityBadge visitor={visitor} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>Nascimento: {formatDate(visitor.birthDate)}</p>
        <div className="flex items-center gap-1">
          <ActionIconButton
            label="Histórico"
            icon={<CalendarClock aria-hidden="true" className="size-4" />}
            onClick={() => onShowHistory?.(visitor)}
          />
          <ActionIconButton
            label="Editar"
            icon={<Pencil aria-hidden="true" className="size-4" />}
            onClick={() => onEdit?.(visitor)}
          />
          <ActionIconButton
            label="Inativar"
            icon={<Trash2 aria-hidden="true" className="size-4" />}
            className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(visitor)}
          />
        </div>
      </div>
    </article>
  );
}

function PriorityBadge({ visitor }: { visitor: Visitor }) {
  const priority = getPriorityBadge(visitor.priorityType.priorityLevel);

  return <Badge className={priority.className}>{priority.label}</Badge>;
}

function getPriorityBadge(priorityLevel: number) {
  switch (priorityLevel) {
    case 1:
      return {
        label: normalize.status("Idoso 60+"),
        className:
          "border border-sky-200 bg-sky-100 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
      };
    case 2:
      return {
        label: normalize.status("PCD"),
        className:
          "border border-violet-200 bg-violet-100 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200",
      };
    case 3:
      return {
        label: normalize.status("Idoso + PCD"),
        className:
          "border border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
      };
    default:
      return {
        label: normalize.status("Regular"),
        className:
          "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
      };
  }
}

function formatDate(isoString: string) {
  return isoString ? formatDateOnly(isoString, "short") : "";
}
