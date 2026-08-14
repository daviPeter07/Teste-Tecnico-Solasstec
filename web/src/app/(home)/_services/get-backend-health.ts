import "server-only";

import { z } from "zod";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string(),
  uptimeSeconds: z.number(),
  checks: z.object({
    database: z.object({
      status: z.literal("up"),
      latencyMs: z.number(),
    }),
  }),
});

export type BackendHealthResult =
  | {
    connected: true;
    checkedAt: string;
    databaseLatencyMs: number;
    service: string;
    uptimeSeconds: number;
  }
  | {
    connected: false;
    checkedAt: string;
    reason: string;
  };

export async function getBackendHealth(): Promise<BackendHealthResult> {
  const checkedAt = new Date().toISOString();
  const apiUrl = process.env.API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    return {
      connected: false,
      checkedAt,
      reason: "A URL interna da API não foi configurada.",
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
        checkedAt,
        reason: "A API respondeu, mas não está disponível para operação.",
      };
    }

    const parsedHealth = healthResponseSchema.safeParse(await response.json());

    if (!parsedHealth.success) {
      return {
        connected: false,
        checkedAt,
        reason: "A API respondeu em um formato inesperado.",
      };
    }

    return {
      connected: true,
      checkedAt,
      databaseLatencyMs: parsedHealth.data.checks.database.latencyMs,
      service: parsedHealth.data.service,
      uptimeSeconds: parsedHealth.data.uptimeSeconds,
    };
  } catch {
    return {
      connected: false,
      checkedAt,
      reason: "Não foi possível estabelecer comunicação com a API.",
    };
  }
}
