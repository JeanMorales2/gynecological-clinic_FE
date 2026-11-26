import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });

  let payload: { token?: unknown; newPassword?: unknown };
  try { payload = await request.json() as { token?: unknown; newPassword?: unknown }; }
  catch { return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
  if (typeof payload.token !== "string" || typeof payload.newPassword !== "string")
    return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/api/auth/resetear-password`, {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: payload.token, newPassword: payload.newPassword }),
    });
    const body = await response.text();
    if (!body) return new NextResponse(null, { status: response.status });
    try { return NextResponse.json(JSON.parse(body), { status: response.status }); }
    catch { return new NextResponse(body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" } }); }
  } catch { return NextResponse.json({ message: "No se pudo comunicar con la API." }, { status: 502 }); }
}
