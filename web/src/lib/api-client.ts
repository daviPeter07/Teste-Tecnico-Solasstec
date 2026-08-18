export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = (
    process.env.API_URL ||
    "http://localhost:3333/api/v1"
  ).replace(/\/$/, "");
  return `${baseUrl}${normalizedPath}`;
}

export function buildListParams({
  search,
  page,
  limit,
}: {
  search?: string;
  page: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  return params;
}

export async function readApiResponse(response: Response): Promise<unknown> {
  const body = (await response.json().catch(() => null)) as { message?: string; details?: unknown } | null;
  if (!response.ok) {
    throw new ApiClientError(
      body?.message ?? "Não foi possível concluir a operação.",
      response.status,
      body?.details,
    );
  }
  return body;
}
