import { NextResponse } from "next/server";
import { forwardConsultasRequest, readJsonObject } from "../proxy";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, context: Context) { const { id } = await context.params; return forwardConsultasRequest(`/api/consultas/${encodeURIComponent(id)}`, { method: "GET" }); }
export async function PUT(request: Request, context: Context) { const { id } = await context.params; const payload = await readJsonObject(request); return payload ? forwardConsultasRequest(`/api/consultas/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
