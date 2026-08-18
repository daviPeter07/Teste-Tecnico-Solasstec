import { z } from "zod";

/**
 * Valida matematicamente um CPF (Módulo 11 da Receita Federal).
 */
export function isValidCpf(cpf: string): boolean {
  const digits = cpf ? cpf.replace(/\D/g, "") : "";
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i), 10) * (10 - i);
  }
  let rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i), 10) * (11 - i);
  }
  rev = (sum * 10) % 11;
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(digits.charAt(10), 10)) return false;

  return true;
}

/**
 * Schemas Zod prontos para reuso em formulários.
 */
export const zodCpfSchema = z
  .string()
  .trim()
  .min(1, "Informe o CPF.")
  .refine(isValidCpf, "CPF inválido.");
