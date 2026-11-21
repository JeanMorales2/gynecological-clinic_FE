import { NextResponse } from "next/server";
import { forwardInvoiceRequest, readJsonObject } from "./proxy";
export async function GET(request: Request) { return forwardInvoiceRequest(`/api/facturacion${new URL(request.url).search}`, { method: "GET" }); }
export async function POST(request: Request) { const payload = await readJsonObject(request); return payload ? forwardInvoiceRequest("/api/facturacion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
