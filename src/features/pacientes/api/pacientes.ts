export type Patient = {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono: string;
  email: string | null;
  documentoIdentidad: string | null;
  alergias: string | null;
  antecedentesRelevantes: string | null;
  activo: boolean;
  createdAtUtc: string;
};

export type PagedPatients = {
  items: Patient[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type PatientInput = Omit<Patient, "id" | "activo" | "createdAtUtc">;

export class PacientesApiError extends Error {
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
    throw new PacientesApiError(message, response.status);
  }
  return payload as T;
}

export function listPatients({ search = "", page = 1, pageSize = 10 }: { search?: string; page?: number; pageSize?: number }) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search.trim()) query.set("search", search.trim());
  return request<PagedPatients>(`/api/pacientes?${query.toString()}`);
}

export function createPatient(input: PatientInput) {
  return request<Patient>("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updatePatient(id: string, input: PatientInput) {
  return request<Patient>(`/api/pacientes/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deactivatePatient(id: string) {
  return request<Patient>(`/api/pacientes/${encodeURIComponent(id)}/desactivar`, { method: "POST" });
}
