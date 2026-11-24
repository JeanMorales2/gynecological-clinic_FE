import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
type Context = { params: Promise<{ attachmentId: string }> };
export async function GET(_request: Request, context: Context) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });
  const token = (await cookies()).get("ginecologia_session")?.value; if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  const { attachmentId } = await context.params;
  try { const response = await fetch(`${backendUrl}/api/consultas/adjuntos/${encodeURIComponent(attachmentId)}/contenido`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } }); const headers = new Headers(); for (const name of ["Content-Type", "Content-Disposition"]) { const value = response.headers.get(name); if (value) headers.set(name, value); } return new Response(response.body, { status: response.status, headers }); }
  catch { return NextResponse.json({ message: "No se pudo comunicar con la API." }, { status: 502 }); }
}
