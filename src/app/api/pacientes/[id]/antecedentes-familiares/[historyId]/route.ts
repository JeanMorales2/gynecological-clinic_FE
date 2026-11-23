import { forwardPacientesRequest } from "../../../proxy";

type RouteContext = { params: Promise<{ id: string; historyId: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id, historyId } = await params;
  return forwardPacientesRequest(`/api/pacientes/${encodeURIComponent(id)}/antecedentes-familiares/${encodeURIComponent(historyId)}`, { method: "DELETE" });
}
