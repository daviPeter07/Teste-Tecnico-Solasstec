"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormDialogLayout } from "@/modules/dashboard/shared/components/form-dialog-layout";
import { cn } from "@/lib/utils";
import { useCreateRoom, useRooms, useUpdateRoom } from "../services/rooms-service";
import {
  createRoomFormSchema,
  type Room,
  type RoomFormData,
} from "../schemas/room-schema";

const ALL_WEEKDAYS = [
  { day: 1, short: "Seg", label: "Segunda-feira" },
  { day: 2, short: "Ter", label: "Terça-feira" },
  { day: 3, short: "Qua", label: "Quarta-feira" },
  { day: 4, short: "Qui", label: "Quinta-feira" },
  { day: 5, short: "Sex", label: "Sexta-feira" },
  { day: 6, short: "Sáb", label: "Sábado" },
  { day: 0, short: "Dom", label: "Domingo" },
] as const;

const WEEKDAY_SORT_ORDER: Record<number, number> = {
  1: 1, // Seg
  2: 2, // Ter
  3: 3, // Qua
  4: 4, // Qui
  5: 5, // Sex
  6: 6, // Sáb
  0: 7, // Dom (Domingo no final da semana)
};

export interface ScheduleGroup {
  id: string;
  days: number[];
  opensAt: string;
  closesAt: string;
}

export interface RoomFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomToEdit?: Room | null;
}

function flattenGroupsToAvailability(groups: ScheduleGroup[]) {
  const result: { dayOfWeek: number; opensAt: string; closesAt: string }[] = [];
  for (const group of groups) {
    const sortedDays = group.days
      .slice()
      .sort(
        (a, b) => (WEEKDAY_SORT_ORDER[a] ?? 0) - (WEEKDAY_SORT_ORDER[b] ?? 0),
      );

    for (const day of sortedDays) {
      result.push({
        dayOfWeek: day,
        opensAt: group.opensAt || "08:00",
        closesAt: group.closesAt || "18:00",
      });
    }
  }
  return result;
}

function groupAvailabilityFromRoom(
  availability: { dayOfWeek: unknown; opensAt: string; closesAt: string }[],
): ScheduleGroup[] {
  if (!availability || availability.length === 0) return [];

  const groupsList: {
    key: string;
    days: number[];
    opensAt: string;
    closesAt: string;
  }[] = [];
  const map = new Map<
    string,
    { days: number[]; opensAt: string; closesAt: string }
  >();

  for (const item of availability) {
    const dayNumber = Number(item.dayOfWeek);
    const key = `${item.opensAt}-${item.closesAt}`;
    if (!map.has(key)) {
      const newGroup = {
        days: [dayNumber],
        opensAt: item.opensAt,
        closesAt: item.closesAt,
      };
      map.set(key, newGroup);
      groupsList.push({ key, ...newGroup });
    } else {
      map.get(key)!.days.push(dayNumber);
    }
  }

  return groupsList.map((g, index) => ({
    id: `group-${index + 1}`,
    days: g.days.sort(
      (a, b) => (WEEKDAY_SORT_ORDER[a] ?? 0) - (WEEKDAY_SORT_ORDER[b] ?? 0),
    ),
    opensAt: g.opensAt,
    closesAt: g.closesAt,
  }));
}

export function RoomFormModal({
  open,
  onOpenChange,
  roomToEdit,
}: RoomFormModalProps) {
  const isEditing = Boolean(roomToEdit);
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const activeRooms = useRooms("", 1, 100, true);

  const takenNames = useMemo(() => {
    return (
      activeRooms.data?.data
        .filter((room) => room.id !== roomToEdit?.id)
        .map((room) => room.name) ?? []
    );
  }, [activeRooms.data, roomToEdit]);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(createRoomFormSchema(takenNames)),
    defaultValues: {
      name: "",
      capacity: 1,
      responsibleName: "",
      availability: [
        { dayOfWeek: 1, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 2, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 3, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 4, opensAt: "08:00", closesAt: "18:00" },
        { dayOfWeek: 5, opensAt: "08:00", closesAt: "18:00" },
      ],
    },
  });

  const rawAvailability = useWatch({
    control: form.control,
    name: "availability",
  });

  const scheduleGroups = useMemo(() => {
    return groupAvailabilityFromRoom(rawAvailability ?? []);
  }, [rawAvailability]);

  useEffect(() => {
    if (open) {
      if (roomToEdit) {
        form.reset({
          name: roomToEdit.name,
          capacity: roomToEdit.capacity,
          responsibleName: roomToEdit.currentResponsible?.name ?? "",
          availability: roomToEdit.availability,
        });
      } else {
        const defaultGroups: ScheduleGroup[] = [
          {
            id: "group-1",
            days: [1, 2, 3, 4, 5],
            opensAt: "08:00",
            closesAt: "18:00",
          },
        ];
        form.reset({
          name: "",
          capacity: 1,
          responsibleName: "",
          availability: flattenGroupsToAvailability(defaultGroups),
        });
      }
    }
  }, [open, roomToEdit, form]);

  function toggleDayInGroup(groupId: string, day: number) {
    const currentGroups = groupAvailabilityFromRoom(form.getValues("availability") ?? []);

    const updated = currentGroups.map((group) => {
      if (group.id === groupId) {
        const hasDay = group.days.includes(day);
        if (hasDay && group.days.length === 1) {
          return group;
        }
        const newDays = hasDay
          ? group.days.filter((d) => d !== day)
          : [...group.days, day].sort(
              (a, b) => (WEEKDAY_SORT_ORDER[a] ?? 0) - (WEEKDAY_SORT_ORDER[b] ?? 0),
            );
        return { ...group, days: newDays };
      } else {
        return { ...group, days: group.days.filter((d) => d !== day) };
      }
    });

    form.setValue("availability", flattenGroupsToAvailability(updated), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleGroupTimeChange(
    groupId: string,
    field: "opensAt" | "closesAt",
    value: string,
  ) {
    const currentGroups = groupAvailabilityFromRoom(form.getValues("availability") ?? []);

    const updated = currentGroups.map((group) => {
      if (group.id === groupId) {
        return { ...group, [field]: value };
      }
      return group;
    });

    form.setValue("availability", flattenGroupsToAvailability(updated), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleAddScheduleGroup() {
    const currentGroups = groupAvailabilityFromRoom(form.getValues("availability") ?? []);
    const assignedDays = new Set(currentGroups.flatMap((g) => g.days));
    const unassigned = ALL_WEEKDAYS.map((w) => w.day).filter(
      (d) => !assignedDays.has(d),
    );

    const newGroup: ScheduleGroup = {
      id: `group-${Date.now()}`,
      days: unassigned.length > 0 ? [unassigned[0]] : [6],
      opensAt: "09:00",
      closesAt: "17:00",
    };

    form.setValue(
      "availability",
      flattenGroupsToAvailability([...currentGroups, newGroup]),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  function handleRemoveScheduleGroup(groupId: string) {
    const currentGroups = groupAvailabilityFromRoom(form.getValues("availability") ?? []);
    if (currentGroups.length <= 1) return;

    const updated = currentGroups.filter((g) => g.id !== groupId);
    form.setValue("availability", flattenGroupsToAvailability(updated), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  async function onSubmit(data: RoomFormData) {
    try {
      if (isEditing && roomToEdit) {
        await updateRoom.mutateAsync({ id: roomToEdit.id, input: data });
        onOpenChange(false);
      } else {
        await createRoom.mutateAsync(data);
        onOpenChange(false);
      }
    } catch {
      // Mutation state handles error rendering
    }
  }

  return (
    <FormDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar sala" : "Nova sala"}
      description={
        isEditing
          ? "Atualize a capacidade, responsável ou horários da sala selecionada."
          : "Defina capacidade, responsável e horários de funcionamento da sala."
      }
      maxWidthClass="sm:max-w-2xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {(createRoom.isError || updateRoom.isError) && (
            <Alert variant="destructive" className="rounded-none">
              <AlertTitle>Operação não concluída</AlertTitle>
              <AlertDescription>
                {createRoom.error?.message ?? updateRoom.error?.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome da sala</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Sala de Reunião Alpha"
                      className="h-11 rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => {
                const currentVal = Number(field.value) || 1;

                return (
                  <FormItem>
                    <FormLabel required>Capacidade</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-11 shrink-0 rounded-none border-input"
                          disabled={currentVal <= 1}
                          onClick={() => field.onChange(Math.max(1, currentVal - 1))}
                          title="Diminuir 1"
                          aria-label="Diminuir 1"
                        >
                          <Minus className="size-4" />
                        </Button>

                        <Input
                          {...field}
                          type="number"
                          min={1}
                          max={500}
                          value={currentVal}
                          onChange={(e) =>
                            field.onChange(Math.max(1, e.target.valueAsNumber || 1))
                          }
                          className="h-11 rounded-none text-center font-bold text-base text-foreground appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 w-11 shrink-0 rounded-none border-input"
                          onClick={() => field.onChange(currentVal + 1)}
                          title="Adicionar 1"
                          aria-label="Adicionar 1"
                        >
                          <Plus className="size-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          className="h-11 px-3 shrink-0 rounded-none font-semibold text-xs"
                          onClick={() => field.onChange(currentVal + 5)}
                          title="Adicionar 5"
                        >
                          +5
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          className="h-11 px-3 shrink-0 rounded-none font-semibold text-xs"
                          onClick={() => field.onChange(currentVal + 10)}
                          title="Adicionar 10"
                        >
                          +10
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="responsibleName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel required>Responsável atual</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Mariana Souza"
                      className="h-11 rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t border-border pt-6 space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-foreground">
                  Horário de funcionamento
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Crie grupos de dias com horários específicos (ex: Seg/Qua/Sex um horário, Ter/Qui outro).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-none shrink-0"
                onClick={handleAddScheduleGroup}
              >
                <Plus className="mr-1.5 size-4" />
                Adicionar outro horário
              </Button>
            </div>

            <div className="space-y-4">
              {scheduleGroups.map((group) => (
                <div
                  key={group.id}
                  className="border border-border bg-card p-5 space-y-4 shadow-xs"
                >
                  {scheduleGroups.length > 1 && (
                    <div className="flex justify-end border-b border-border/50 pb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-none"
                        onClick={() => handleRemoveScheduleGroup(group.id)}
                      >
                        <Trash2 className="mr-1 size-3.5" />
                        Remover horário
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <FormLabel required>Dias com este horário</FormLabel>
                    <div className="flex flex-wrap items-center gap-2">
                      {ALL_WEEKDAYS.map(({ day, short }) => {
                        const isSelectedInThisGroup = group.days.includes(day);

                        return (
                          <Button
                            key={day}
                            type="button"
                            variant={isSelectedInThisGroup ? "default" : "outline"}
                            aria-pressed={isSelectedInThisGroup}
                            className={cn(
                              "h-10 min-w-13 rounded-none font-semibold transition-all select-none text-xs",
                              isSelectedInThisGroup
                                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                            onClick={() => toggleDayInGroup(group.id, day)}
                          >
                            {short}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-1">
                    <FormItem>
                      <FormLabel required className="text-xs text-muted-foreground">
                        Horário de abertura
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={group.opensAt}
                          onChange={(e) =>
                            handleGroupTimeChange(group.id, "opensAt", e.target.value)
                          }
                          className="h-10 rounded-none"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem>
                      <FormLabel required className="text-xs text-muted-foreground">
                        Horário de fechamento
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={group.closesAt}
                          onChange={(e) =>
                            handleGroupTimeChange(group.id, "closesAt", e.target.value)
                          }
                          className="h-10 rounded-none"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>
              ))}
            </div>

            {form.formState.errors.availability && (
              <p className="text-xs font-medium text-destructive">
                {form.formState.errors.availability.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-none"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-none"
              disabled={createRoom.isPending || updateRoom.isPending}
            >
              {createRoom.isPending || updateRoom.isPending
                ? "Salvando..."
                : isEditing
                ? "Salvar alterações"
                : "Cadastrar sala"}
            </Button>
          </div>
        </form>
      </Form>
    </FormDialogLayout>
  );
}

export { RoomFormModal as RoomForm };
