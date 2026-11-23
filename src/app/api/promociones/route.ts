import { NextResponse } from "next/server";
import { forwardPromotionRequest, readJsonObject } from "./proxy";
export async function GET(request: Request) { return forwardPromotionRequest(`/api/promociones${new URL(request.url).search}`, { method: "GET" }); }
export async function POST(request: Request) { const payload = await readJsonObject(request); return payload ? forwardPromotionRequest("/api/promociones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }) : NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
