import { forwardPermisosRequest } from "./proxy";

export async function GET() {
  return forwardPermisosRequest("/api/permisos", { method: "GET" });
}
