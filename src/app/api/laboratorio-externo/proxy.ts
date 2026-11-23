import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
export async function forwardLabRequest(path: string, init: RequestInit) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });
  const token = (await cookies()).get("ginecologia_session")?.value;
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  try { const response = await fetch(`${backendUrl}${path}`, { ...init, cache: "no-store", headers: { Authorization: `Bearer ${token}`, ...init.headers } }); const body = await response.text(); if (!body) return new NextResponse(null, { status: response.status }); try { return NextResponse.json(JSON.parse(body), { status: response.status }); } catch { return new NextResponse(body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" } }); } }
  catch { return NextResponse.json({ message: "No se pudo comunicar con la API." }, { status: 502 }); }
}
export async function readJsonObject(request: Request) { try { const payload: unknown = await request.json(); return payload !== null && !Array.isArray(payload) && typeof payload === "object" ? payload : null; } catch { return null; } }
