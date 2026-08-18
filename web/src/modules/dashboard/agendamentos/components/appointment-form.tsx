"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CalendarDays, HousePlus, UserPlus } from "lucide-react";
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
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { EntityCombobox } from "@/modules/dashboard/shared/components/entity-combobox";
import { FormDialogLayout } from "@/modules/dashboard/shared/components/form-dialog-layout";
import type { Room } from "@/modules/dashboard/salas/schemas/room-schema";
import { useRooms } from "@/modules/dashboard/salas/services/rooms-service";
import { useVisitors } from "@/modules/dashboard/visitantes/services/visitors-service";
import { formatDateOnly, formatDateTimeInManaus } from "@/utils/date-format";
import { normalize } from "@/utils/normalize";
import {
  appointmentFormSchema,
  type Appointment,
  type AppointmentFormData,
} from "../schemas/appointment-schema";
import {
  useAppointmentSlots,
  useCreateAppointment,
  useUpdateAppointment,
} from "../services/appointments-service";

export interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentToEdit?: Appointment | null;
  defaultRoom?: Room | null;
  onCreateVisitor?: () => void;
  onCreateRoom?: () => void;
}

interface SuggestionDetails {
  suggestion?: { startsAt: string; endsAt: string } | null;
}

function isSuggestionDetails(value: unknown): value is SuggestionDetails {
  if (!value || typeof value !== "object") return false;
  return "suggestion" in value;
}

export function AppointmentFormModal({
  open,
  onOpenChange,
  appointmentToEdit,
  defaultRoom,
  onCreateVisitor,
  onCreateRoom,
}: AppointmentFormModalProps) {
  const isEditing = Boolean(appointmentToEdit);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const visitors = useVisitors("", 1, 100);
  const rooms = useRooms("", 1, 100);
  const [suggestion, setSuggestion] = useState<SuggestionDetails["suggestion"]>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const visitorOptions = useMemo(
    () =>
      visitors.data?.data.map((visitor) => ({
        value: String(visitor.id),
        label: visitor.name,
        description: `${normalize.cpf(visitor.document)} ${visitor.priorityType.description}`,
        details: [
          { label: "CPF", value: normalize.cpf(visitor.document) },
          { value: visitor.priorityType.description },
        ],
      })) ?? [],
    [visitors.data],
  );
  const roomOptions = useMemo(
    () => {
      const options =
        rooms.data?.data.map((room) => ({
          value: String(room.id),
          label: room.name,
          description: `${room.capacity} pessoa(s) · ${room.currentResponsible?.name ?? "sem responsável"}`,
        })) ?? [];

      if (defaultRoom && !options.some((option) => option.value === String(defaultRoom.id))) {
        options.push({
          value: String(defaultRoom.id),
          label: defaultRoom.name,
          description: `${defaultRoom.capacity} pessoa(s) · ${defaultRoom.currentResponsible?.name ?? "sem responsável"}`,
        });
      }

      return options;
    },
    [defaultRoom, rooms.data],
  );

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      visitorId: 0,
      roomId: 0,
      date: "",
      startsAt: "",
    },
  });

  const selectedVisitorId = useWatch({ control: form.control, name: "visitorId" });
  const selectedRoomId = useWatch({ control: form.control, name: "roomId" });
  const selectedDate = useWatch({ control: form.control, name: "date" });
  const selectedStartsAt = useWatch({ control: form.control, name: "startsAt" });
  const slots = useAppointmentSlots(
    selectedRoomId || 0,
    selectedDate || "",
    selectedVisitorId || undefined,
    appointmentToEdit?.id,
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      visitorId: appointmentToEdit?.visitor.id ?? 0,
      roomId: appointmentToEdit?.room.id ?? defaultRoom?.id ?? 0,
      date: appointmentToEdit?.date ?? "",
      startsAt: appointmentToEdit?.startsAt ?? "",
    });
  }, [appointmentToEdit, defaultRoom, form, open]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSuggestion(null);
      setSubmitError(null);
    }
    onOpenChange(nextOpen);
  }

  async function onSubmit(data: AppointmentFormData) {
    setSuggestion(null);
    setSubmitError(null);
    try {
      if (isEditing && appointmentToEdit) {
        await updateAppointment.mutateAsync({ id: appointmentToEdit.id, input: data });
      } else {
        await createAppointment.mutateAsync(data);
      }
      handleOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não conseguimos salvar o agendamento agora.";
      setSubmitError(message);
      if (error instanceof ApiClientError && isSuggestionDetails(error.details)) {
        setSuggestion(error.details.suggestion ?? null);
      }
    }
  }

  return (
    <FormDialogLayout
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Editar agendamento" : "Novo agendamento"}
      description="Selecione visitante, sala e período. A disponibilidade é validada antes da confirmação."
      maxWidthClass="sm:max-w-3xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <Alert variant="destructive" className="rounded-none">
              <AlertTitle>Agendamento não concluído</AlertTitle>
              <AlertDescription className="space-y-2">
                <span className="block">{submitError}</span>
                {suggestion && (
                  <span className="block text-sm">
                    Próxima sugestão: {formatDateTimeInManaus(suggestion.startsAt)} até {formatDateTimeInManaus(suggestion.endsAt)}.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="visitorId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel required>Visitante</FormLabel>
                    {onCreateVisitor && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        title="Criar novo visitante"
                        aria-label="Criar novo visitante"
                        onClick={onCreateVisitor}
                      >
                        <UserPlus aria-hidden="true" className="size-4" />
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <EntityCombobox
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                      options={visitorOptions}
                      placeholder={visitors.isLoading ? "Carregando visitantes..." : "Selecione um visitante"}
                      searchPlaceholder="Buscar visitante..."
                      emptyMessage="Nenhum visitante cadastrado."
                      disabled={visitors.isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel required>Sala</FormLabel>
                    {onCreateRoom && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-none text-muted-foreground hover:bg-primary/10 hover:text-primary"
                        title="Criar nova sala"
                        aria-label="Criar nova sala"
                        onClick={onCreateRoom}
                      >
                        <HousePlus aria-hidden="true" className="size-4" />
                      </Button>
                    )}
                  </div>
                  <FormControl>
                    <EntityCombobox
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                      options={roomOptions}
                      placeholder={rooms.isLoading ? "Carregando salas..." : "Selecione uma sala"}
                      searchPlaceholder="Buscar sala..."
                      emptyMessage="Nenhuma sala cadastrada."
                      disabled={rooms.isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Data</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="h-11 rounded-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startsAt"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel required>Horário de atendimento</FormLabel>
                  <FormControl>
                    <div className="space-y-3 rounded-none border border-border bg-card p-4">
                      {slots.data?.suggestion && (
                        <div className="flex flex-col gap-3 border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-3">
                            <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">A data selecionada é feriado</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Próxima data disponível: {formatDateOnly(slots.data.suggestion.date, "full")}.
                                Atendimento da sala: {slots.data.suggestion.opensAt} às {slots.data.suggestion.closesAt}.
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-10 shrink-0 rounded-none"
                            onClick={() => {
                              form.setValue("date", slots.data.suggestion?.date ?? "", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                              form.setValue("startsAt", slots.data.suggestion?.startsAt ?? "", {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                          >
                            Usar data sugerida
                          </Button>
                        </div>
                      )}
                      {!selectedRoomId || !selectedDate ? (
                        <p className="text-sm text-muted-foreground">
                          Selecione uma sala e uma data para ver os horários.
                        </p>
                      ) : slots.isLoading ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {Array.from({ length: 10 }).map((_, index) => (
                            <span key={index} className="h-10 animate-pulse bg-muted" />
                          ))}
                        </div>
                      ) : slots.data?.slots.length ? (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {slots.data.slots.map((slot) => {
                            const isSelected = selectedStartsAt === slot.startsAt;
                            return (
                              <Button
                                key={`${slot.startsAt}-${slot.endsAt}`}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                  "h-auto min-h-11 rounded-none px-2 py-2 text-xs",
                                  !slot.available &&
                                    "border-muted bg-muted/70 text-muted-foreground opacity-70 hover:bg-muted/70 hover:text-muted-foreground",
                                )}
                                disabled={!slot.available}
                                title={slot.reason ?? "Selecionar horário"}
                                onClick={() => field.onChange(slot.startsAt)}
                              >
                                <span className="flex flex-col items-center leading-tight">
                                  <span className="font-semibold">{slot.startsAt}</span>
                                  <span className="text-[0.65rem] opacity-75">
                                    {slot.available
                                      ? `${slot.occupancy}/${slot.capacity} ocupado(s)`
                                      : slot.reason}
                                  </span>
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          A sala não possui horários de funcionamento nesta data.
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-none"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-none"
              disabled={createAppointment.isPending || updateAppointment.isPending}
            >
              {createAppointment.isPending || updateAppointment.isPending
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Agendar"}
            </Button>
          </div>
        </form>
      </Form>
    </FormDialogLayout>
  );
}
