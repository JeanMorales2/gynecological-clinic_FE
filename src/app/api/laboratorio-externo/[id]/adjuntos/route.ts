import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { forwardLabRequest } from "../../proxy";

const backendUrl = process.env.BACKEND_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
type AttachmentRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: AttachmentRouteContext) {
  const { id } = await context.params;
  return forwardLabRequest(`/api/laboratorio-externo/${encodeURIComponent(id)}/adjuntos${new URL(request.url).search}`, { method: "GET" });
}

export async function POST(request: Request, context: AttachmentRouteContext) {
  if (!backendUrl) return NextResponse.json({ message: "La API no está configurada." }, { status: 500 });
  const token = (await cookies()).get("ginecologia_session")?.value;
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  const { id } = await context.params;
  try {
    const response = await fetch(`${backendUrl}/api/laboratorio-externo/${encodeURIComponent(id)}/adjuntos`, {
      method: "POST",
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      body: await request.formData(),
    });
    const body = await response.text();
    if (!body) return new NextResponse(null, { status: response.status });
    try { return NextResponse.json(JSON.parse(body), { status: response.status }); }
    catch { return new NextResponse(body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "text/plain" } }); }
  } catch { return NextResponse.json({ message: "No se pudo comunicar con la API." }, { status: 502 }); }
}
