import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getBackendHealth } from "./get-backend-health";

describe("getBackendHealth", () => {
  const originalApiUrl = process.env.API_URL;

  afterEach(() => {
    vi.unstubAllGlobals();

    if (originalApiUrl === undefined) {
      delete process.env.API_URL;
    } else {
      process.env.API_URL = originalApiUrl;
    }
  });

  it("returns a connected result for a healthy backend", async () => {
    process.env.API_URL = "http://api.test/api/v1";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          service: "solasstec-portaria-api",
          timestamp: "2026-08-14T20:00:00.000Z",
          uptimeSeconds: 120,
          checks: {
            database: { status: "up", latencyMs: 8 },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getBackendHealth()).resolves.toMatchObject({
      connected: true,
      databaseLatencyMs: 8,
      service: "solasstec-portaria-api",
      uptimeSeconds: 120,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/health",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns a disconnected result without exposing network errors", async () => {
    process.env.API_URL = "http://api.test/api/v1";
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new Error("ECONNREFUSED")));

    await expect(getBackendHealth()).resolves.toMatchObject({
      connected: false,
      reason: "Não foi possível estabelecer comunicação com a API.",
    });
  });

  it("returns a disconnected result for an unhealthy HTTP response", async () => {
    process.env.API_URL = "http://api.test/api/v1";
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(getBackendHealth()).resolves.toMatchObject({
      connected: false,
      reason: "A API respondeu, mas não está disponível para operação.",
    });
  });

  it("returns a disconnected result for an invalid health response", async () => {
    process.env.API_URL = "http://api.test/api/v1";
    vi.stubGlobal(
      "fetch",
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 })),
    );

    await expect(getBackendHealth()).resolves.toMatchObject({
      connected: false,
      reason: "A API respondeu em um formato inesperado.",
    });
  });

  it("returns a disconnected result when API_URL is missing", async () => {
    delete process.env.API_URL;

    await expect(getBackendHealth()).resolves.toMatchObject({
      connected: false,
      reason: "A URL interna da API não foi configurada.",
    });
  });
});
