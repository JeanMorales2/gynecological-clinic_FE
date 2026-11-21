import { NextResponse } from "next/server"; import { forwardInventoryRequest, readInventoryJson } from "./proxy";
export async function GET(request: Request) { return forwardInventoryRequest(`/api/inventario${new URL(request.url).search}`, { method: "GET" }); }
export async function POST(request: Request) { const body = await readInventoryJson(request); return body ? forwardInventoryRequest("/api/inventario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
