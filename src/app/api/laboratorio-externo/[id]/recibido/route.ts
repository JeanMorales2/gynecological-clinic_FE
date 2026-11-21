import { NextResponse } from "next/server";
import { forwardLabRequest, readJsonObject } from "../../proxy";
export async function POST(request: Request, context: RouteContext<"/api/laboratorio-externo/[id]/recibido">) { const payload = await readJsonObject(request); if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); const { id } = await context.params; return forwardLabRequest(`/api/laboratorio-externo/${id}/recibido`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
