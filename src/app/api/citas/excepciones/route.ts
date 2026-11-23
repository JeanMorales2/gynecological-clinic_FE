import { NextResponse } from "next/server";
import { forwardCitasRequest, readJsonObject } from "../proxy";

export async function GET(request: Request) {
  return forwardCitasRequest(`/api/citas/excepciones${new URL(request.url).search}`, { method: "GET" });
}

export async function POST(request: Request) {
  const payload = await readJsonObject(request);
  if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  return forwardCitasRequest("/api/citas/excepciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
