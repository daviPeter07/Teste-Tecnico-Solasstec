"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildListParams, getApiUrl, readApiResponse } from "@/lib/api-client";
import { notifyError } from "@/lib/notify";
import {
  holidayFormSchema,
  holidayListSchema,
  holidaySchema,
  type HolidayFormData,
} from "../schemas/holiday-schema";

export interface HolidayListOptions {
  dateFrom?: string;
  dateTo?: string;
}

export function useHolidays(
  search: string,
  page: number,
  limit = 15,
  active = true,
  options: HolidayListOptions = {},
) {
  return useQuery({
    queryKey: ["holidays", { search, page, limit, active, ...options }],
    queryFn: async () => {
      const params = buildListParams({ search, page, limit, active, ...options });
      const response = await fetch(getApiUrl(`/holidays?${params.toString()}`));
      return holidayListSchema.parse(await readApiResponse(response));
    },
  });
}

export function useDeleteInactiveHolidays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const response = await fetch(getApiUrl("/holidays/inactive"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: ids?.length ? JSON.stringify({ ids }) : undefined,
      });
      await readApiResponse(response);
    },
    onSuccess: () => {
      toast.success("Feriados inativos excluídos com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: notifyError,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HolidayFormData) => {
      const parsed = holidayFormSchema.parse(input);
      const response = await fetch(getApiUrl("/holidays"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      return holidaySchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      toast.success("Feriado cadastrado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: notifyError,
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: HolidayFormData }) => {
      const parsed = holidayFormSchema.parse(input);
      const response = await fetch(getApiUrl(`/holidays/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      return holidaySchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      toast.success("Feriado atualizado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: notifyError,
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(getApiUrl(`/holidays/${id}`), {
        method: "DELETE",
      });
      await readApiResponse(response);
    },
    onSuccess: () => {
      toast.success("Feriado inativado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
    onError: notifyError,
  });
}
