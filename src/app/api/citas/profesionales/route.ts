import { forwardCitasRequest } from "../proxy";

export async function GET() { return forwardCitasRequest("/api/citas/profesionales", { method: "GET" }); }
