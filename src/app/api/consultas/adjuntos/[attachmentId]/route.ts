import { forwardConsultasRequest } from "../../proxy";
type Context = { params: Promise<{ attachmentId: string }> };
export async function DELETE(_request: Request, context: Context) { const { attachmentId } = await context.params; return forwardConsultasRequest(`/api/consultas/adjuntos/${encodeURIComponent(attachmentId)}`, { method: "DELETE" }); }
