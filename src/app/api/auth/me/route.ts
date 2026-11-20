import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const sessionCookieName = "ginecologia_session";
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });
  const token = (await cookies()).get(sessionCookieName)?.value;
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const backendResponse = await fetch(`${backendUrl}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (backendResponse.status === 401) return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  if (!backendResponse.ok) return NextResponse.json({ message: "No se pudo obtener la sesión." }, { status: 502 });
  return NextResponse.json(await backendResponse.json());
}