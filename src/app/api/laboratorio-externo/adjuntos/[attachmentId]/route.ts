import { forwardLabRequest } from "../../proxy";
type AttachmentRouteContext = { params: Promise<{ attachmentId: string }> };

export async function DELETE(_request: Request, context: AttachmentRouteContext) {
  const { attachmentId } = await context.params;
  return forwardLabRequest(`/api/laboratorio-externo/adjuntos/${encodeURIComponent(attachmentId)}`, { method: "DELETE" });
}
