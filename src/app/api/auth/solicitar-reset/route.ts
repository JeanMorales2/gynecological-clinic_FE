import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });

  let payload: { email?: unknown };
  try { payload = await request.json() as { email?: unknown }; }
  catch { return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
  if (typeof payload.email !== "string") return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });

  try {
    const response = await fetch(`${backendUrl}/api/auth/solicitar-reset`, {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email }),
    });
    return new NextResponse(null, { status: response.status });
  } catch { return NextResponse.json({ message: "No se pudo comunicar con la API." }, { status: 502 }); }
}
