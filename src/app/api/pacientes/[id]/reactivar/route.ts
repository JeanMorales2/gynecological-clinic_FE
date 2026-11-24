import { forwardPacientesRequest } from "../../proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardPacientesRequest(`/api/pacientes/${encodeURIComponent(id)}/reactivar`, { method: "POST" });
}
