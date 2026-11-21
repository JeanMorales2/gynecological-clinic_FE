import { NextResponse } from "next/server";
import { forwardHistoriaClinicaRequest, readJsonObject } from "../proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardHistoriaClinicaRequest(`/api/historia-clinica/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const payload = await readJsonObject(request);
  if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  const { id } = await params;
  return forwardHistoriaClinicaRequest(`/api/historia-clinica/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
