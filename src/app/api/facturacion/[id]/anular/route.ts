import { forwardInvoiceRequest } from "../../proxy";
export async function POST(_request: Request, context: RouteContext<"/api/facturacion/[id]/anular">) { const { id } = await context.params; return forwardInvoiceRequest(`/api/facturacion/${id}/anular`, { method: "POST" }); }
