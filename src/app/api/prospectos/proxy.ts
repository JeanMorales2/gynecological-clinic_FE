import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const sessionCookieName = "ginecologia_session";
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function forwardProspectosRequest(path: string, init: RequestInit) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });

  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${backendUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, ...init.headers },
    });
  } catch {
    return NextResponse.json({ message: "No se pudo comunicar con la API." }, { status: 502 });
  }

  const body = await backendResponse.text();
  if (!body) return new NextResponse(null, { status: backendResponse.status });

  try {
    return NextResponse.json(JSON.parse(body), { status: backendResponse.status });
  } catch {
    return NextResponse.json({ message: "La API devolvió una respuesta inválida." }, { status: 502 });
  }
}

export async function readJsonObject(request: Request) {
  try {
    const payload: unknown = await request.json();
    return payload !== null && !Array.isArray(payload) && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}
