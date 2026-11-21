import { NextResponse } from "next/server";
import { forwardNotificationRequest } from "../proxy";

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
  if (payload === null || Array.isArray(payload) || typeof payload !== "object") return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });
  return forwardNotificationRequest("/api/notificaciones/probar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
