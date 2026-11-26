export type ClinicalEntryType = "Consulta" | "ControlPrenatal" | "Citologia" | "Ecografia" | "Laboratorio";

export type ClinicalEntry = {
  id: string;
  patientId: string;
  tipo: ClinicalEntryType;
  fecha: string;
  motivo: string;
  hallazgos: string;
  diagnostico: string | null;
  indicaciones: string | null;
  tratamiento: string | null;
  medicamentos: string | null;
  examenes: string | null;
  pesoKg: number | null;
  alturaCm: number | null;
  citaSeguimiento: string | null;
  registradoPorId: string;
  createdAtUtc: string;
};

export type ClinicalEntryInput = {
  patientId: string;
  tipo: ClinicalEntryType;
  fecha: string;
  motivo: string;
  hallazgos: string;
  diagnostico: string | null;
  indicaciones: string | null;
  tratamiento: string | null;
  medicamentos: string | null;
  examenes: string | null;
  pesoKg: number | null;
  alturaCm: number | null;
  citaSeguimiento: string | null;
};

export type ClinicalEntryUpdateInput = Omit<ClinicalEntryInput, "patientId">;
export type PagedClinicalEntries = { items: ClinicalEntry[]; totalCount: number; page: number; pageSize: number };

export class HistoriaClinicaApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message : "No se pudo completar la operación. Intentá de nuevo.";
    throw new HistoriaClinicaApiError(message, response.status);
  }
  return payload as T;
}

export function listClinicalEntries({ patientId, tipo, page = 1, pageSize = 100 }: { patientId: string; tipo?: ClinicalEntryType; page?: number; pageSize?: number }) {
  const query = new URLSearchParams({ patientId, page: String(page), pageSize: String(pageSize) });
  if (tipo) query.set("tipo", tipo);
  return request<PagedClinicalEntries>(`/api/historia-clinica?${query.toString()}`);
}

export function createClinicalEntry(input: ClinicalEntryInput) {
  return request<ClinicalEntry>("/api/historia-clinica", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function updateClinicalEntry(id: string, input: ClinicalEntryUpdateInput) {
  return request<ClinicalEntry>(`/api/historia-clinica/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function clinicalHistoryPdfDownloadUrl(patientId: string) {
  return `/api/historia-clinica/pacientes/${encodeURIComponent(patientId)}/exportar-pdf`;
}
