import { NextResponse } from "next/server";
import { forwardProspectosRequest, readJsonObject } from "../../proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  const payload = await readJsonObject(request);
  if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });

  const { id } = await params;
  return forwardProspectosRequest(`/api/prospectos/${encodeURIComponent(id)}/convertir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
