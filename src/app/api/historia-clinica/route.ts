import { NextResponse } from "next/server";
import { forwardHistoriaClinicaRequest, readJsonObject } from "./proxy";

export async function GET(request: Request) { return forwardHistoriaClinicaRequest(`/api/historia-clinica${new URL(request.url).search}`, { method: "GET" }); }
export async function POST(request: Request) {
  const payload = await readJsonObject(request);
  if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  return forwardHistoriaClinicaRequest("/api/historia-clinica", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
