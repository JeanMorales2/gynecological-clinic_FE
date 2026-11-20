import { NextResponse } from "next/server";
import { forwardProspectosRequest, readJsonObject } from "./proxy";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return forwardProspectosRequest(`/api/prospectos${query}`, { method: "GET" });
}

export async function POST(request: Request) {
  const payload = await readJsonObject(request);
  if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });

  return forwardProspectosRequest("/api/prospectos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
