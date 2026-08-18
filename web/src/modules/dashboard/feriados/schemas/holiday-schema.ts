import { z } from "zod";
import { paginatedSchema } from "@/modules/dashboard/shared/schemas/pagination-schema";
import { isValidDateOnly } from "@/utils/date-format";

export const holidayTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.null(),
]);

export const holidayFormSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data no formato AAAA-MM-DD.")
    .refine(isValidDateOnly, "Informe uma data válida."),
  description: z
    .string()
    .trim()
    .min(2, "Informe a descrição do feriado.")
    .max(150, "A descrição deve ter no máximo 150 caracteres."),
  type: holidayTypeSchema,
});

export type HolidayFormData = z.infer<typeof holidayFormSchema>;

export const holidaySchema = z.object({
  id: z.number(),
  date: z.string(),
  description: z.string(),
  type: holidayTypeSchema,
  active: z.boolean(),
  createdAt: z.string(),
});

export const holidayListSchema = paginatedSchema(holidaySchema);

export type Holiday = z.infer<typeof holidaySchema>;
