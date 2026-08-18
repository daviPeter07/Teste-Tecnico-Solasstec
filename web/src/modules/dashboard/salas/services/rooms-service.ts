"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildListParams, getApiUrl, readApiResponse } from "@/lib/api-client";
import {
  roomFormSchema,
  roomListSchema,
  roomSchema,
  type RoomFormData,
} from "../schemas/room-schema";

export function useRooms(search: string, page: number, limit = 20) {
  return useQuery({
    queryKey: ["rooms", { search, page, limit }],
    queryFn: async () => {
      const params = buildListParams({ search, page, limit });
      const response = await fetch(getApiUrl(`/rooms?${params.toString()}`));
      return roomListSchema.parse(await readApiResponse(response));
    },
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rooms"] }),
  });
}
