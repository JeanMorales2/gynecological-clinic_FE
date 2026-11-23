import { forwardCitasRequest } from "../../proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardCitasRequest(`/api/citas/excepciones/${encodeURIComponent(id)}`, { method: "DELETE" });
}
