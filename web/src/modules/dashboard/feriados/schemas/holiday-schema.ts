import { z } from "zod";

export const holidayTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.null(),
]);

function isValidDateOnly(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

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

export const holidayListSchema = z.object({
  data: z.array(holidaySchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type Holiday = z.infer<typeof holidaySchema>;
