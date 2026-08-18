import { proxyApiRequest } from "@/lib/server/api-proxy";

export async function GET(request: Request) {
  return proxyApiRequest(request, "/rooms");
}

export async function POST(request: Request) {
  return proxyApiRequest(request, "/rooms");
}
