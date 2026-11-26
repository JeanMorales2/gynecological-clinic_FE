export type Rol = {
  nombre: string;
  esProtegido: boolean;
};

export class RolesApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : "No se pudo completar la operación. Intentá de nuevo.";
    throw new RolesApiError(message, response.status);
  }
  return payload as T;
}

export function listRoles() {
  return request<Rol[]>("/api/roles");
}

export function createRole(nombre: string) {
  return request<Rol>("/api/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
}

export function deleteRole(nombre: string) {
  return request<void>(`/api/roles/${encodeURIComponent(nombre)}`, { method: "DELETE" });
}
