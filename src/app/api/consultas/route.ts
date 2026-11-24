import { NextResponse } from "next/server";
import { forwardConsultasRequest, readJsonObject } from "./proxy";
export async function GET(request: Request) { return forwardConsultasRequest(`/api/consultas${new URL(request.url).search}`, { method: "GET" }); }
export async function POST(request: Request) { const payload = await readJsonObject(request); return payload ? forwardConsultasRequest("/api/consultas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
