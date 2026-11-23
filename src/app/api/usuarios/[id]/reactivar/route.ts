import { forwardUsuariosRequest } from "../../proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardUsuariosRequest(`/api/usuarios/${encodeURIComponent(id)}/reactivar`, { method: "POST" });
}
