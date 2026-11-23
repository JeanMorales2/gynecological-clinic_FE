import { forwardProspectosRequest } from "../../proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  return forwardProspectosRequest(`/api/prospectos/${encodeURIComponent(id)}/invitar`, { method: "POST" });
}
