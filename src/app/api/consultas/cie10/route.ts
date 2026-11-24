import { forwardConsultasRequest } from "../proxy";
export async function GET(request: Request) { return forwardConsultasRequest(`/api/consultas/cie10${new URL(request.url).search}`, { method: "GET" }); }
