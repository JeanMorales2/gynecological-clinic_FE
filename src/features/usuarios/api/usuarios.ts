export type StaffRole = "Admin" | "Recepcionista" | "Ginecologa";

export type StaffUser = {
  id: string;
  nombreCompleto: string;
  telefono: string | null;
  role: StaffRole;
  activo: boolean;
  createdAtUtc: string;
};

export type CreateStaffInput = {
  email: string;
  password: string;
  nombreCompleto: string;
  telefono: string | null;
  role: StaffRole;
};

export type UpdateStaffInput = Omit<CreateStaffInput, "email" | "password">;

export class UsuariosApiError extends Error {
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
    throw new UsuariosApiError(message, response.status);
  }

  return payload as T;
}

export function listStaff() {
  return request<StaffUser[]>("/api/usuarios");
}

export function createStaff(input: CreateStaffInput) {
  return request<StaffUser>("/api/usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateStaff(id: string, input: UpdateStaffInput) {
  return request<StaffUser>(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deactivateStaff(id: string) {
  return request<StaffUser>(`/api/usuarios/${encodeURIComponent(id)}/desactivar`, { method: "POST" });
}
