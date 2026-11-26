export type Patient = {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono: string;
  email: string | null;
  documentoIdentidad: string | null;
  alergias: string | null;
  antecedentesPatologicosPersonales: string | null;
  antecedentesPatologicosFamiliares: string | null;
  antecedentesQuirurgicos: string | null;
  menarca: string | null;
  ciclos: string | null;
  ivsa: string | null;
  fum: string | null;
  mpf: string | null;
  pap: string | null;
  complicaciones: string | null;
  tipoSangre: string | null;
  gestas: number | null;
  partos: number | null;
  cesareas: number | null;
  abortos: number | null;
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

export type FamilyMedicalHistory = {
  id: string;
  patientId: string;
  condicion: string;
  parentesco: string;
  createdAtUtc: string;
};

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

export function getPatient(id: string) {
  return request<Patient>(`/api/pacientes/${encodeURIComponent(id)}`);
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

export function reactivatePatient(id: string) {
  return request<Patient>(`/api/pacientes/${encodeURIComponent(id)}/reactivar`, { method: "POST" });
}

export function listFamilyMedicalHistory(patientId: string) {
  return request<FamilyMedicalHistory[]>(`/api/pacientes/${encodeURIComponent(patientId)}/antecedentes-familiares`);
}

export function addFamilyMedicalHistory(patientId: string, input: { condicion: string; parentesco: string }) {
  return request<FamilyMedicalHistory>(`/api/pacientes/${encodeURIComponent(patientId)}/antecedentes-familiares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function removeFamilyMedicalHistory(patientId: string, id: string) {
  return request<void>(`/api/pacientes/${encodeURIComponent(patientId)}/antecedentes-familiares/${encodeURIComponent(id)}`, { method: "DELETE" });
}
