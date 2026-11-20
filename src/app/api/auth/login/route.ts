import { NextResponse } from "next/server";

const sessionCookieName = "ginecologia_session";
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

type BackendLoginResponse = { accessToken: string; expiresAtUtc: string; user: { id: string; email: string; role: string } };

export async function POST(request: Request) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });

  let credentials: { email?: unknown; password?: unknown };
  try { credentials = await request.json() as { email?: unknown; password?: unknown }; }
  catch { return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 }); }
  if (typeof credentials.email !== "string" || typeof credentials.password !== "string") return NextResponse.json({ message: "Solicitud inválida." }, { status: 400 });

  const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: credentials.email, password: credentials.password }), cache: "no-store",
  });
  if (backendResponse.status === 401) return NextResponse.json({ message: "Credenciales inválidas." }, { status: 401 });
  if (!backendResponse.ok) return NextResponse.json({ message: "No se pudo iniciar sesión." }, { status: 502 });

  const payload = await backendResponse.json() as BackendLoginResponse;
  const expiresAtUtc = new Date(payload.expiresAtUtc);
  if (!payload.accessToken || Number.isNaN(expiresAtUtc.getTime())) return NextResponse.json({ message: "La API devolvió una sesión inválida." }, { status: 502 });

  const response = NextResponse.json({ user: payload.user });
  response.cookies.set(sessionCookieName, payload.accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAtUtc, path: "/" });
  return response;
}