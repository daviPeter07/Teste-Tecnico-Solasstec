import { z } from "zod";
import { paginatedSchema } from "@/modules/dashboard/shared/schemas/pagination-schema";
import { isValidCpf } from "@/utils/validators";

export const visitorFormSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome completo.").max(100),
    documentType: z.literal("CPF"),
    document: z
      .string()
      .trim()
      .min(11, "Informe um CPF válido.")
      .max(14, "Informe um CPF válido."),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data de nascimento."),
    hasDisability: z.boolean(),
    photo: z.union([z.literal(""), z.url("Informe uma URL válida.")]),
  })
  .superRefine((data, ctx) => {
    if (!isValidCpf(data.document)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido.",
        path: ["document"],
      });
    }
  });

export type VisitorFormData = z.infer<typeof visitorFormSchema>;

export const visitorSchema = z.object({
  id: z.number(),
  name: z.string(),
  documentType: z.string(),
  document: z.string(),
  birthDate: z.string(),
  hasDisability: z.boolean(),
  photo: z.string().nullable(),
  active: z.boolean(),
  isPriority: z.boolean(),
  priorityType: z.object({
    id: z.number(),
    description: z.string(),
    priorityLevel: z.number(),
  }),
  createdAt: z.string(),
});

export const visitorListSchema = paginatedSchema(visitorSchema);

export type Visitor = z.infer<typeof visitorSchema>;
