import { NextResponse } from "next/server"; import { forwardInventoryRequest, readInventoryJson } from "../proxy";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) { const { id } = await params; return forwardInventoryRequest(`/api/inventario/${id}`, { method: "GET" }); }
export async function PUT(request: Request, { params }: Context) { const { id } = await params; const body = await readInventoryJson(request); return body ? forwardInventoryRequest(`/api/inventario/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
