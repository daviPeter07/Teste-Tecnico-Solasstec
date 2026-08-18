"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildListParams, getApiUrl, readApiResponse } from "@/lib/api-client";
import {
  visitorFormSchema,
  visitorListSchema,
  visitorSchema,
  type VisitorFormData,
} from "../schemas/visitor-schema";

export function useVisitors(search: string, page: number, limit = 15, active = true) {
  return useQuery({
    queryKey: ["visitors", { search, page, limit, active }],
    queryFn: async () => {
      const params = buildListParams({ search, page, limit, active });
      const response = await fetch(getApiUrl(`/visitors?${params.toString()}`));
      return visitorListSchema.parse(await readApiResponse(response));
    },
  });
}

export function useDeleteInactiveVisitors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const response = await fetch(getApiUrl("/visitors/inactive"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: ids?.length ? JSON.stringify({ ids }) : undefined,
      });
      await readApiResponse(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
}

export function useCreateVisitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: VisitorFormData) => {
      const parsed = visitorFormSchema.parse(input);
      const response = await fetch(getApiUrl("/visitors"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
          photo: parsed.photo || undefined,
        }),
      });
      return visitorSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
}

export function useUpdateVisitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: VisitorFormData }) => {
      const parsed = visitorFormSchema.parse(input);
      const response = await fetch(getApiUrl(`/visitors/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
          photo: parsed.photo || undefined,
        }),
      });
      return visitorSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
}

export function useDeleteVisitor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(getApiUrl(`/visitors/${id}`), {
        method: "DELETE",
      });
      await readApiResponse(response);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["visitors"] }),
  });
}
