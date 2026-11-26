import { forwardRolesRequest } from "../proxy";

type RouteContext = { params: Promise<{ nombre: string }> };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { nombre } = await params;

  return forwardRolesRequest(`/api/roles/${encodeURIComponent(nombre)}`, { method: "DELETE" });
}
