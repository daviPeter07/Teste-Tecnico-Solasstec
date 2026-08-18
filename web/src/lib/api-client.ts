export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (typeof window !== "undefined") return `/api${normalizedPath}`;

  const baseUrl = (
    process.env.API_URL || "http://localhost:3333/api/v1"
  ).replace(/\/$/, "");
  return `${baseUrl}${normalizedPath}`;
}

export async function readApiResponse(response: Response): Promise<unknown> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new ApiClientError(body?.message ?? "Não foi possível concluir a operação.", response.status);
  }
  return body;
}
