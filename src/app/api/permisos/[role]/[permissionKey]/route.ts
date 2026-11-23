import { forwardPermisosRequest } from "../../proxy";

type RouteContext = { params: Promise<{ role: string; permissionKey: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const { role, permissionKey } = await params;

  return forwardPermisosRequest(
    `/api/permisos/${encodeURIComponent(role)}/${encodeURIComponent(permissionKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
    },
  );
}
