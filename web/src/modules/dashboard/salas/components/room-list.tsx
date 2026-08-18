"use client";

import { useEffect, useState } from "react";
import { Clock3, DoorOpen, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
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
import { formatRoomSchedule, normalize } from "@/utils/normalize";
import { useRooms } from "../hooks/use-rooms";
import type { Room } from "../schemas/room-schema";

export interface RoomListProps {
  onEditRoom?: (room: Room) => void;
  onCreateRoom?: () => void;
  onDeleteRoom?: (room: Room) => void;
}

export function RoomList({
  onEditRoom,
  onCreateRoom,
  onDeleteRoom,
}: RoomListProps) {
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

  const rooms = useRooms(searchParam.trim(), pageParam);

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
            placeholder="Buscar por sala ou responsável"
            aria-label="Buscar salas"
            className="h-11 rounded-none border-border bg-card pl-10"
          />
        </div>
        {onCreateRoom && (
          <Button
            type="button"
            onClick={onCreateRoom}
            className="h-11 rounded-none px-5 shrink-0"
          >
            <Plus aria-hidden="true" className="mr-2 size-4" />
            Nova sala
          </Button>
        )}
      </div>

      {rooms.isPending && <div className="h-72 animate-pulse border border-border bg-muted" />}
      {rooms.isError && (
        <EmptyRooms
          title="Não foi possível carregar as salas"
          description={rooms.error.message}
          onCreate={onCreateRoom}
        />
      )}
      {rooms.data?.data.length === 0 && (
        <EmptyRooms
          title={searchParam ? "Nenhuma sala encontrada" : "Nenhuma sala cadastrada"}
          description={
            searchParam
              ? "Tente buscar por outro nome ou responsável."
              : "Cadastre a primeira sala e seus horários de funcionamento."
          }
          onCreate={onCreateRoom}
        />
      )}
      {rooms.data && rooms.data.data.length > 0 && (
        <>
          <div className="hidden border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sala</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Funcionamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.data.data.map((room) => {
                  const scheduleGroups = formatRoomSchedule(room.availability);

                  return (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.currentResponsible?.name ?? "Sem responsável"}</TableCell>
                      <TableCell>{room.capacity} pessoas</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-col gap-1 text-xs">
                          {scheduleGroups.map((group, idx) => (
                            <div key={idx} className="whitespace-normal break-words">
                              <span className="font-bold text-foreground">
                                {group.daysLabel}:
                              </span>{" "}
                              <span className="text-muted-foreground">{group.timeLabel}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{normalize.status("Ativa")}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none"
                            onClick={() => onEditRoom?.(room)}
                          >
                            <Pencil aria-hidden="true" className="size-4" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDeleteRoom?.(room)}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rooms.data.data.map((room) => {
              const scheduleGroups = formatRoomSchedule(room.availability);

              return (
                <article key={room.id} className="border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">{room.name}</h2>
                    <Badge variant="outline">{normalize.status("Ativa")}</Badge>
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Users aria-hidden="true" className="size-4 text-primary" />
                      {room.capacity} pessoas
                    </p>
                    <p className="flex items-center gap-2">
                      <DoorOpen aria-hidden="true" className="size-4 text-primary" />
                      {room.currentResponsible?.name ?? "Sem responsável"}
                    </p>
                    <div className="flex items-start gap-2">
                      <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="flex flex-col gap-0.5 text-xs">
                        {scheduleGroups.map((group, idx) => (
                          <div key={idx} className="whitespace-normal break-words">
                            <span className="font-bold text-foreground">
                              {group.daysLabel}:
                            </span>{" "}
                            <span>{group.timeLabel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-1 border-t border-border pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-none"
                      onClick={() => onEditRoom?.(room)}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDeleteRoom?.(room)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      Excluir
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              {rooms.data.meta.total} sala(s) ativa(s) · página {rooms.data.meta.page} de{" "}
              {Math.max(rooms.data.meta.totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={pageParam <= 1 || rooms.isFetching}
                onClick={() => setPageParam((current) => Math.max(current - 1, 1))}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={pageParam >= rooms.data.meta.totalPages || rooms.isFetching}
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

function EmptyRooms({
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
      <DoorOpen aria-hidden="true" className="size-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {onCreate && (
        <Button type="button" onClick={onCreate} className="mt-6 rounded-none">
          Cadastrar sala
        </Button>
      )}
    </div>
  );
}
