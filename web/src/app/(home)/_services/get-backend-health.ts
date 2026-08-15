import "server-only";

import { z } from "zod";

const healthResponseSchema = z.object({
  message: z.literal("Banco de dados conectado."),
});

export interface BackendHealthResult {
  connected: boolean;
  message: string;
}

export async function getBackendHealth(): Promise<BackendHealthResult> {
  const apiUrl = process.env.API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    return {
      connected: false,
      message: "Banco de dados não conectado.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3_500),
    });

    if (!response.ok) {
      return {
        connected: false,
        message: "Banco de dados não conectado.",
      };
    }

    const parsedHealth = healthResponseSchema.safeParse(await response.json());

    if (!parsedHealth.success) {
      return {
        connected: false,
        message: "Banco de dados não conectado.",
      };
    }

    return {
      connected: true,
      message: parsedHealth.data.message,
    };
  } catch {
    return {
      connected: false,
      message: "Banco de dados não conectado.",
    };
  }
}
