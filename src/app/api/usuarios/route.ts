import { NextResponse } from "next/server";
import { forwardUsuariosRequest, readJsonObject } from "./proxy";

export async function GET() {
  return forwardUsuariosRequest("/api/usuarios", { method: "GET" });
}

export async function POST(request: Request) {
  const payload = await readJsonObject(request);
  if (!payload) return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });

  return forwardUsuariosRequest("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
