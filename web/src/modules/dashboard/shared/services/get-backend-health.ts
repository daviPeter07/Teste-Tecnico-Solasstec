import { z } from "zod";

const healthResponseSchema = z.object({
  message: z.literal("Sistema operando normalmente."),
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
      message: "Sistema indisponível temporariamente.",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        connected: false,
        message: "Sistema indisponível temporariamente.",
      };
    }

    const payload = await response.json();
    const parsed = healthResponseSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        connected: false,
        message: "Sistema indisponível temporariamente.",
      };
    }

    return {
      connected: true,
      message: parsed.data.message,
    };
  } catch {
    return {
      connected: false,
      message: "Sistema indisponível temporariamente.",
    };
  }
}
