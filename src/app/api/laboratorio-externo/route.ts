import { NextResponse } from "next/server";
import { forwardLabRequest, readJsonObject } from "./proxy";
export async function GET(request: Request) { return forwardLabRequest(`/api/laboratorio-externo${new URL(request.url).search}`, { method: "GET" }); }
export async function POST(request: Request) { const payload = await readJsonObject(request); return payload ? forwardLabRequest("/api/laboratorio-externo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
