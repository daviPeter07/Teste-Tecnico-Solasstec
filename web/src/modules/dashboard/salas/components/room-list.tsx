"use client";

import { CalendarClock, Clock3, DoorOpen, Pencil, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardEmptyState } from "@/modules/dashboard/shared/components/dashboard-empty-state";
import { DashboardListToolbar } from "@/modules/dashboard/shared/components/dashboard-list-toolbar";
import { PaginationFooter } from "@/modules/dashboard/shared/components/pagination-footer";
import { useDashboardListState } from "@/modules/dashboard/shared/hooks/use-dashboard-list-state";
import { formatRoomSchedule, normalize } from "@/utils/normalize";
import { useRooms } from "../services/rooms-service";
import type { Room } from "../schemas/room-schema";

export interface RoomListProps {
  onEditRoom?: (room: Room) => void;
  onCreateRoom?: () => void;
  onDeleteRoom?: (room: Room) => void;
  onShowHistory?: (room: Room) => void;
}

export function RoomList({
  onEditRoom,
  onCreateRoom,
  onDeleteRoom,
  onShowHistory,
}: RoomListProps) {
  const { searchParam, pageParam, inputValue, onSearchChange, setPageParam } =
    useDashboardListState();

  const rooms = useRooms(searchParam.trim(), pageParam);

  return (
    <section className="space-y-5">
      <DashboardListToolbar
        inputValue={inputValue}
        onSearchChange={onSearchChange}
        placeholder="Buscar por sala ou responsável"
        ariaLabel="Buscar salas"
        createLabel="Nova sala"
        onCreate={onCreateRoom}
      />

      {rooms.isPending && <div className="h-72 animate-pulse border border-border bg-muted" />}
      {rooms.isError && (
        <DashboardEmptyState
          icon={DoorOpen}
          title="Não foi possível carregar as salas"
          description={rooms.error.message}
          actionLabel="Cadastrar sala"
          onAction={onCreateRoom}
        />
      )}
      {rooms.data?.data.length === 0 && (
        <DashboardEmptyState
          icon={DoorOpen}
          title={searchParam ? "Nenhuma sala encontrada" : "Nenhuma sala cadastrada"}
          description={
            searchParam
              ? "Tente buscar por outro nome ou responsável."
              : "Cadastre a primeira sala e seus horários de funcionamento."
          }
          actionLabel="Cadastrar sala"
          onAction={onCreateRoom}
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
                      <TableCell>
                        <Badge className="gap-1.5 border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                          <Users aria-hidden="true" className="size-3.5" />
                          {room.capacity}
                        </Badge>
                      </TableCell>
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
                            onClick={() => onShowHistory?.(room)}
                          >
                            <CalendarClock aria-hidden="true" className="size-4" />
                            Histórico
                          </Button>
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
                      onClick={() => onShowHistory?.(room)}
                    >
                      <CalendarClock aria-hidden="true" className="size-4" />
                      Histórico
                    </Button>
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
          <PaginationFooter
            meta={rooms.data.meta}
            summaryLabel="sala(s) ativa(s)"
            isFetching={rooms.isFetching}
            onPageChange={(page) => setPageParam(page)}
          />
        </>
      )}
    </section>
  );
}
