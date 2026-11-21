import { NextResponse } from "next/server";
import { forwardInvoiceRequest, readJsonObject } from "../../proxy";
export async function POST(request: Request, context: RouteContext<"/api/facturacion/[id]/pagar">) { const payload = await readJsonObject(request); if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); const { id } = await context.params; return forwardInvoiceRequest(`/api/facturacion/${id}/pagar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
