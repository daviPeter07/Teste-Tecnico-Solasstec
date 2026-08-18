import { z } from "zod";
import { paginatedSchema } from "@/modules/dashboard/shared/schemas/pagination-schema";
import { isValidDateOnly } from "@/utils/date-format";

export const appointmentStatusSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);

export const appointmentFormSchema = z
  .object({
    visitorId: z.number().int().min(1, "Selecione um visitante."),
    roomId: z.number().int().min(1, "Selecione uma sala."),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data do agendamento.")
      .refine(isValidDateOnly, "Informe uma data válida."),
    startsAt: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Selecione um horário."),
  });

export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

export const appointmentSchema = z.object({
  id: z.number(),
  visitor: z.object({
    id: z.number(),
    name: z.string(),
    document: z.string(),
    priority: z.string(),
  }),
  room: z.object({
    id: z.number(),
    name: z.string(),
    capacity: z.number(),
  }),
  date: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  status: appointmentStatusSchema,
  statusLabel: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
});

export const appointmentListSchema = paginatedSchema(appointmentSchema);

export const appointmentSlotSchema = z.object({
  startsAt: z.string(),
  endsAt: z.string(),
  available: z.boolean(),
  occupancy: z.number(),
  capacity: z.number(),
  reason: z.string().optional(),
});

export const appointmentSlotsSchema = z.object({
  date: z.string(),
  slots: z.array(appointmentSlotSchema),
  suggestion: z
    .object({
      date: z.string(),
      opensAt: z.string(),
      closesAt: z.string(),
      startsAt: z.string(),
      endsAt: z.string(),
    })
    .nullable()
    .optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentSlot = z.infer<typeof appointmentSlotSchema>;
