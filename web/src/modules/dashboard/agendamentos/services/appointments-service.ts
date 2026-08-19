"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildListParams, getApiUrl, readApiResponse } from "@/lib/api-client";
import {
  appointmentFormSchema,
  appointmentListSchema,
  appointmentSchema,
  appointmentSlotsSchema,
  type AppointmentFormData,
} from "../schemas/appointment-schema";

export interface AppointmentListOptions {
  limit?: number;
  active?: boolean;
  status?: number;
  startsFrom?: string;
  startsTo?: string;
  includeInactive?: boolean;
}

export function useAppointments(search: string, page: number, options: AppointmentListOptions = {}) {
  const { limit = 15, active = true, status, startsFrom, startsTo, includeInactive } = options;
  return useQuery({
    queryKey: ["appointments", { search, page, limit, active, status, startsFrom, startsTo, includeInactive }],
    queryFn: async () => {
      const params = buildListParams({
        search,
        page,
        limit,
        active,
        status,
        startsFrom,
        startsTo,
        includeInactive,
      });
      const response = await fetch(getApiUrl(`/appointments?${params.toString()}`));
      return appointmentListSchema.parse(await readApiResponse(response));
    },
  });
}

export function useRoomAppointmentHistory(roomId: number, page: number) {
  return useQuery({
    queryKey: ["room-appointment-history", { roomId, page }],
    enabled: roomId > 0,
    queryFn: async () => {
      const params = new URLSearchParams({
        roomId: String(roomId),
        page: String(page),
        limit: "15",
        includeInactive: "true",
      });
      const response = await fetch(getApiUrl(`/appointments?${params.toString()}`));
      return appointmentListSchema.parse(await readApiResponse(response));
    },
  });
}

export function useVisitorAppointmentHistory(visitorId: number, page: number) {
  return useQuery({
    queryKey: ["visitor-appointment-history", { visitorId, page }],
    enabled: visitorId > 0,
    queryFn: async () => {
      const params = new URLSearchParams({
        visitorId: String(visitorId),
        page: String(page),
        limit: "15",
        includeInactive: "true",
      });
      const response = await fetch(getApiUrl(`/appointments?${params.toString()}`));
      return appointmentListSchema.parse(await readApiResponse(response));
    },
  });
}

export function useAppointmentSlots(
  roomId: number,
  date: string,
  visitorId?: number,
  appointmentId?: number,
) {
  return useQuery({
    queryKey: ["appointment-slots", { roomId, date, visitorId, appointmentId }],
    enabled: roomId > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date),
    queryFn: async () => {
      const params = new URLSearchParams({ roomId: String(roomId), date });
      if (visitorId) params.set("visitorId", String(visitorId));
      if (appointmentId) params.set("appointmentId", String(appointmentId));
      const response = await fetch(getApiUrl(`/appointments/availability?${params.toString()}`));
      return appointmentSlotsSchema.parse(await readApiResponse(response));
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AppointmentFormData) => {
      const parsed = appointmentFormSchema.parse(input);
      const response = await fetch(getApiUrl("/appointments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      return appointmentSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["room-appointment-history"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-appointment-history"] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: AppointmentFormData }) => {
      const parsed = appointmentFormSchema.parse(input);
      const response = await fetch(getApiUrl(`/appointments/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      return appointmentSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["room-appointment-history"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-appointment-history"] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(getApiUrl(`/appointments/${id}`), {
        method: "DELETE",
      });
      await readApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["room-appointment-history"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-appointment-history"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: number }) => {
      const response = await fetch(getApiUrl(`/appointments/${id}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return appointmentSchema.parse(await readApiResponse(response));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["room-appointment-history"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-appointment-history"] });
    },
  });
}

export function useDeleteInactiveAppointments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids?: number[]) => {
      const response = await fetch(getApiUrl("/appointments/inactive"), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: ids?.length ? JSON.stringify({ ids }) : undefined,
      });
      await readApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["room-appointment-history"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-appointment-history"] });
    },
  });
}
