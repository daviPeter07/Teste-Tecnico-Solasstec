"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiUrl, readApiResponse } from "@/lib/api-client";
import {
  roomFormSchema,
  roomListSchema,
  roomSchema,
  type RoomFormData,
} from "../schemas/room-schema";

export function useRooms(search: string, page: number) {
  return useQuery({
    queryKey: ["rooms", { search, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
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
