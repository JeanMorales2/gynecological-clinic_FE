import { forwardConsultasRequest } from "../../proxy";
type Context = { params: Promise<{ id: string }> };
export async function POST(_request: Request, context: Context) { const { id } = await context.params; return forwardConsultasRequest(`/api/consultas/${encodeURIComponent(id)}/finalizar`, { method: "POST" }); }
