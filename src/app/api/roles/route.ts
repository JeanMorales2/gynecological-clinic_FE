import { forwardRolesRequest } from "./proxy";

export async function GET() {
  return forwardRolesRequest("/api/roles", { method: "GET" });
}

export async function POST(request: Request) {
  return forwardRolesRequest("/api/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
}
