import { z } from "zod";

export const roomAvailabilitySchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  opensAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido."),
  closesAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido."),
});

export const roomFormSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome da sala.").max(100),
    capacity: z.coerce.number().int().min(1, "A capacidade deve ser maior que zero."),
    responsibleName: z.string().trim().min(2, "Informe o responsável.").max(150),
    availability: z.array(roomAvailabilitySchema).min(1, "Adicione pelo menos um horário."),
  })
  .superRefine((room, context) => {
    room.availability.forEach((period, index) => {
      if (period.opensAt >= period.closesAt) {
        context.addIssue({
          code: "custom",
          path: ["availability", index, "closesAt"],
          message: "O fechamento deve ocorrer depois da abertura.",
        });
      }
      const overlapsAnotherPeriod = room.availability.some(
        (other, otherIndex) =>
          otherIndex < index &&
          other.dayOfWeek === period.dayOfWeek &&
          other.opensAt < period.closesAt &&
          period.opensAt < other.closesAt,
      );
      if (overlapsAnotherPeriod) {
        context.addIssue({
          code: "custom",
          path: ["availability", index, "opensAt"],
          message: "Existem horários sobrepostos no mesmo dia.",
        });
      }
    });
  });

export type RoomFormData = z.input<typeof roomFormSchema>;

export const roomSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
  availability: z.array(roomAvailabilitySchema),
  currentResponsible: z
    .object({ id: z.number(), name: z.string(), validFrom: z.string() })
    .nullable(),
  active: z.boolean(),
  createdAt: z.string(),
});

export const roomListSchema = z.object({
  data: z.array(roomSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type Room = z.infer<typeof roomSchema>;
