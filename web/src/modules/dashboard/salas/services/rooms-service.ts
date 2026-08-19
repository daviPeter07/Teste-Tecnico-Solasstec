"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildListParams, getApiUrl, readApiResponse } from "@/lib/api-client";
import { notifyError } from "@/lib/notify";
import {
  roomFormSchema,
  roomListSchema,
  roomSchema,
  type RoomFormData,
} from "../schemas/room-schema";

export function useRooms(search: string, page: number, limit = 15, active = true) {
  return useQuery({
    queryKey: ["rooms", { search, page, limit, active }],
    queryFn: async () => {
      const params = buildListParams({ search, page, limit, active });
      const response = await fetch(getApiUrl(`/rooms?${params.toString()}`));
      return roomListSchema.parse(await readApiResponse(response));
    },
  });
}

export function useDeleteInactiveRooms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const response = await fetch(getApiUrl("/rooms/inactive"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: ids?.length ? JSON.stringify({ ids }) : undefined,
      });
      await readApiResponse(response);
    },
    onSuccess: () => {
      toast.success("Salas inativas excluídas com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: notifyError,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoomFormData) => {
      const parsed = roomFormSchema.parse(input);
      const response = await fetch(getApiUrl("/rooms"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      return roomSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      toast.success("Sala cadastrada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: notifyError,
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: RoomFormData }) => {
      const parsed = roomFormSchema.parse(input);
      const response = await fetch(getApiUrl(`/rooms/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      return roomSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      toast.success("Sala atualizada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: notifyError,
  });
}

export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(getApiUrl(`/rooms/${id}`), {
        method: "DELETE",
      });
      await readApiResponse(response);
    },
    onSuccess: () => {
      toast.success("Sala inativada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: notifyError,
  });
}
