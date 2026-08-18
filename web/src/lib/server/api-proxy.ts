import "server-only";

import { NextResponse } from "next/server";

const MAX_REQUEST_BODY_BYTES = 64 * 1024;

export async function proxyApiRequest(
  request: Request,
  path: string,
): Promise<NextResponse> {
  const apiUrl = process.env.API_URL?.replace(/\/$/, "");

  if (!apiUrl) {
    return NextResponse.json(
      { message: "A API interna não está configurada." },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const targetUrl = `${apiUrl}${path}${requestUrl.search}`;

  try {
    const requestBody =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await readLimitedBody(request);

    if (requestBody === null) {
      return NextResponse.json(
        { message: "O corpo da requisição excede o limite permitido." },
        { status: 413 },
      );
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: requestBody,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    const responseBody = await response.text();
    return new NextResponse(responseBody || null, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível comunicar com a API." },
      { status: 503 },
    );
  }
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BODY_BYTES) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_REQUEST_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}
