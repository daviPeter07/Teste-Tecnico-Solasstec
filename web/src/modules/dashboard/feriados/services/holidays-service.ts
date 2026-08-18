"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl, readApiResponse } from "@/lib/api-client";
import {
  holidayFormSchema,
  holidayListSchema,
  holidaySchema,
  type HolidayFormData,
} from "../schemas/holiday-schema";

export function useHolidays(search: string, page: number) {
  return useQuery({
    queryKey: ["holidays", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      const response = await fetch(getApiUrl(`/holidays?${params.toString()}`));
      return holidayListSchema.parse(await readApiResponse(response));
    },
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holidays"] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holidays"] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holidays"] }),
  });
}
