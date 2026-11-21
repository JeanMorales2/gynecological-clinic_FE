import { forwardLabRequest } from "../../proxy";
export async function POST(_request: Request, context: RouteContext<"/api/laboratorio-externo/[id]/cancelar">) { const { id } = await context.params; return forwardLabRequest(`/api/laboratorio-externo/${id}/cancelar`, { method: "POST" }); }
