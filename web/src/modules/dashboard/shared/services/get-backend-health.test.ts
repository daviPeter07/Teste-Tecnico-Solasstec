import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getBackendHealth } from "./get-backend-health";

describe("getBackendHealth", () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.API_URL;
    } else {
      process.env.API_URL = originalApiUrl;
    }
  });

  it("returns a connected result for a healthy backend", async () => {
    process.env.API_URL = "http://api.test/api/v1";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Sistema operando normalmente.",
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getBackendHealth()).resolves.toEqual({
      connected: true,
      message: "Sistema operando normalmente.",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/v1/health",
      { cache: "no-store" },
    );
  });

  it("returns a disconnected result for HTTP error responses", async () => {
    process.env.API_URL = "http://api.test/api/v1";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
      }),
    );

    await expect(getBackendHealth()).resolves.toEqual({
      connected: false,
      message: "Sistema indisponível temporariamente.",
    });
  });

  it("returns a disconnected result when payload schema fails", async () => {
    process.env.API_URL = "http://api.test/api/v1";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          status: "error",
        }),
      }),
    );

    await expect(getBackendHealth()).resolves.toEqual({
      connected: false,
      message: "Sistema indisponível temporariamente.",
    });
  });

  it("returns a disconnected result when network fetch throws", async () => {
    process.env.API_URL = "http://api.test/api/v1";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    await expect(getBackendHealth()).resolves.toEqual({
      connected: false,
      message: "Sistema indisponível temporariamente.",
    });
  });

  it("returns a disconnected result when API_URL is missing", async () => {
    delete process.env.API_URL;

    await expect(getBackendHealth()).resolves.toEqual({
      connected: false,
      message: "Sistema indisponível temporariamente.",
    });
  });
});
