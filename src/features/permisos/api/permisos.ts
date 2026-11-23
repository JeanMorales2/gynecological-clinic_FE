export type PermissionDefinition = {
  key: string;
  descripcion: string;
  rolesConAcceso: string[];
};

export class PermisosApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "No se pudo completar la operación.";
    throw new PermisosApiError(message, response.status);
  }

  return payload as T;
}

export function listPermissions() {
  return request<PermissionDefinition[]>("/api/permisos");
}

export function setPermissionGrant(
  role: string,
  permissionKey: string,
  otorgado: boolean,
) {
  return request<void>(`/api/permisos/${role}/${permissionKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otorgado }),
  });
}
