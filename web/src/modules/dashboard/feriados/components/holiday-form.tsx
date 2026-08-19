"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialogLayout } from "@/modules/dashboard/shared/components/form-dialog-layout";
import { useCreateHoliday, useUpdateHoliday } from "../services/holidays-service";
import {
  holidayFormSchema,
  type Holiday,
  type HolidayFormData,
} from "../schemas/holiday-schema";

export interface HolidayFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holidayToEdit?: Holiday | null;
  initialDate?: string | null;
}

const HOLIDAY_SAVE_ERROR_MESSAGE =
  "Não conseguimos salvar o feriado agora. Verifique os dados e tente novamente.";

export function HolidayFormModal({
  open,
  onOpenChange,
  holidayToEdit,
  initialDate,
}: HolidayFormModalProps) {
  const isEditing = Boolean(holidayToEdit);
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();

  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      date: "",
      description: "",
      type: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      date: holidayToEdit?.date ?? initialDate ?? "",
      description: holidayToEdit?.description ?? "",
      type: holidayToEdit?.type ?? null,
    });
  }, [form, holidayToEdit, initialDate, open]);

  async function onSubmit(data: HolidayFormData) {
    try {
      if (isEditing && holidayToEdit) {
        await updateHoliday.mutateAsync({ id: holidayToEdit.id, input: data });
      } else {
        await createHoliday.mutateAsync(data);
      }
      onOpenChange(false);
    } catch {
      // Mutation state handles error rendering.
    }
  }

  return (
    <FormDialogLayout
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar feriado" : "Novo feriado"}
      description="Cadastre datas que devem bloquear novos agendamentos futuros."
      maxWidthClass="sm:max-w-xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {(createHoliday.isError || updateHoliday.isError) && (
            <Alert variant="destructive" className="rounded-none">
              <AlertTitle>Operação não concluída</AlertTitle>
              <AlertDescription>{HOLIDAY_SAVE_ERROR_MESSAGE}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : "none"}
                    onValueChange={(value) => {
                      field.onChange(value === "none" ? null : Number(value));
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-none">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Sem tipo</SelectItem>
                      <SelectItem value="1">Nacional</SelectItem>
                      <SelectItem value="2">Estadual</SelectItem>
                      <SelectItem value="3">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel required>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Natal"
                      className="h-11 rounded-none"
                    />
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
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-11 rounded-none"
              disabled={createHoliday.isPending || updateHoliday.isPending}
            >
              {createHoliday.isPending || updateHoliday.isPending
                ? "Salvando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Cadastrar feriado"}
            </Button>
          </div>
        </form>
      </Form>
    </FormDialogLayout>
  );
}
