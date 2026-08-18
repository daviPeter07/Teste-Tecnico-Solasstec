"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, UserCheck } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { normalize } from "@/utils/normalize";
import { useVisitors } from "../hooks/use-visitors";
import type { Visitor } from "../schemas/visitor-schema";

export interface VisitorListProps {
  onEditVisitor?: (visitor: Visitor) => void;
  onCreateVisitor?: () => void;
  onDeleteVisitor?: (visitor: Visitor) => void;
}

export function VisitorList({
  onEditVisitor,
  onCreateVisitor,
  onDeleteVisitor,
}: VisitorListProps) {
  const [searchParam, setSearchParam] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [pageParam, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );

  const [inputValue, setInputValue] = useState(searchParam);
  const [prevSearchParam, setPrevSearchParam] = useState(searchParam);

  if (prevSearchParam !== searchParam) {
    setPrevSearchParam(searchParam);
    setInputValue(searchParam);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchParam) {
        setSearchParam(inputValue ? inputValue : null);
        setPageParam(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, searchParam, setSearchParam, setPageParam]);

  const visitors = useVisitors(searchParam.trim(), pageParam);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Buscar por nome ou CPF"
            aria-label="Buscar visitantes"
            className="h-11 rounded-none border-border bg-card pl-10"
          />
        </div>
        {onCreateVisitor && (
          <Button
            type="button"
            onClick={onCreateVisitor}
            className="h-11 rounded-none px-5 shrink-0"
          >
            <Plus aria-hidden="true" className="mr-2 size-4" />
            Novo visitante
          </Button>
        )}
      </div>

      {visitors.isPending && (
        <div className="h-72 animate-pulse border border-border bg-muted" />
      )}
      {visitors.isError && (
        <EmptyVisitors
          title="Não foi possível carregar os visitantes"
          description={visitors.error.message}
          onCreate={onCreateVisitor}
        />
      )}
      {visitors.data?.data.length === 0 && (
        <EmptyVisitors
          title={searchParam ? "Nenhum visitante encontrado" : "Nenhum visitante cadastrado"}
          description={
            searchParam
              ? "Tente buscar por outro nome ou CPF."
              : "Cadastre o primeiro visitante para iniciar a operação."
          }
          onCreate={onCreateVisitor}
        />
      )}
      {visitors.data && visitors.data.data.length > 0 && (
        <>
          <div className="hidden border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitante</TableHead>
                  <TableHead>CPF</TableHead>
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
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {visitors.data.meta.total} visitante(s) ativo(s) · página {visitors.data.meta.page} de{" "}
              {Math.max(visitors.data.meta.totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={pageParam <= 1 || visitors.isFetching}
                onClick={() => setPageParam((current) => Math.max(current - 1, 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={pageParam >= visitors.data.meta.totalPages || visitors.isFetching}
                onClick={() => setPageParam((current) => current + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function VisitorRow({
  visitor,
  onEdit,
  onDelete,
}: {
  visitor: Visitor;
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
}) {
  const isLegacyDocument = visitor.documentType !== "CPF";

  return (
    <TableRow>
      <TableCell className="font-medium">{visitor.name}</TableCell>
      <TableCell>{formatDocument(visitor)}</TableCell>
      <TableCell>{formatDate(visitor.birthDate)}</TableCell>
      <TableCell>
        <PriorityBadge visitor={visitor} />
      </TableCell>
      <TableCell>
        <Badge variant="outline">{normalize.status("Ativo")}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none"
            disabled={isLegacyDocument}
            title={
              isLegacyDocument
                ? "Cadastros legados com documento diferente de CPF não podem ser editados."
                : undefined
            }
            onClick={() => onEdit?.(visitor)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(visitor)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Excluir
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function VisitorCard({
  visitor,
  onEdit,
  onDelete,
}: {
  visitor: Visitor;
  onEdit?: (visitor: Visitor) => void;
  onDelete?: (visitor: Visitor) => void;
}) {
  const isLegacyDocument = visitor.documentType !== "CPF";

  return (
    <article className="border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{visitor.name}</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            CPF · {formatDocument(visitor)}
          </p>
        </div>
        <PriorityBadge visitor={visitor} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>Nascimento: {formatDate(visitor.birthDate)}</p>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none"
            disabled={isLegacyDocument}
            title={
              isLegacyDocument
                ? "Cadastros legados com documento diferente de CPF não podem ser editados."
                : undefined
            }
            onClick={() => onEdit?.(visitor)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Editar
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(visitor)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Excluir
          </Button>
        </div>
      </div>
    </article>
  );
}

function PriorityBadge({ visitor }: { visitor: Visitor }) {
  return visitor.isPriority ? (
    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-200">
      {normalize.status("Prioritário")}
    </Badge>
  ) : (
    <Badge variant="secondary">{normalize.status("Regular")}</Badge>
  );
}

function EmptyVisitors({
  title,
  description,
  onCreate,
}: {
  title: string;
  description: string;
  onCreate?: () => void;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-border bg-card p-8 text-center">
      <UserCheck aria-hidden="true" className="size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {onCreate && (
        <Button type="button" onClick={onCreate} className="mt-6 rounded-none">
          Cadastrar visitante
        </Button>
      )}
    </div>
  );
}

function formatDocument(visitor: Visitor) {
  return visitor.documentType === "CPF" ? normalize.cpf(visitor.document) : visitor.document;
}

function formatDate(isoString: string) {
  if (!isoString) return "";
  const dateOnly = isoString.slice(0, 10);
  const [year, month, day] = dateOnly.split("-");
  if (year && month && day) return `${day}/${month}/${year}`;
  return isoString;
}
