export type ConsultaEstado = "Borrador" | "Finalizada";

export type PrescriptionItem = {
  id: string;
  orden: number;
  medicamento: string;
  dosis: string;
  via: string;
  frecuencia: string;
  duracionTexto: string;
};

export type ConsultaAttachment = {
  id: string;
  consultaId: string;
  nombreArchivo: string;
  tipoContenido: string;
  tamanoBytes: number;
  createdAtUtc: string;
};

export type Consulta = {
  id: string;
  patientId: string;
  fecha: string;
  estado: ConsultaEstado;
  registradoPorId: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  finalizadaAtUtc: string | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  pesoKg: number | null;
  tallaCm: number | null;
  imc: number | null;
  fum: string | null;
  motivoConsulta: string;
  padecimientoActual: string | null;
  hallazgosMamas: string | null;
  hallazgosCervixGenitales: string | null;
  hallazgosTactoBimanual: string | null;
  ultrasonidoEndometrioMm: number | null;
  ultrasonidoOvarioDerecho: string | null;
  ultrasonidoOvarioIzquierdo: string | null;
  ultrasonidoSacoGestacionalEmbrion: string | null;
  diagnosticoCie: string | null;
  diagnosticoDescripcion: string | null;
  estudiosSolicitados: string | null;
  indicacionesProximaCita: string | null;
  prescriptionItems: PrescriptionItem[];
  attachments: ConsultaAttachment[];
};

export type UpdateConsultaInput = Omit<Consulta, "id" | "patientId" | "fecha" | "estado" | "registradoPorId" | "createdAtUtc" | "updatedAtUtc" | "finalizadaAtUtc" | "imc" | "attachments" | "prescriptionItems"> & {
  prescriptionItems: Omit<PrescriptionItem, "id">[];
};
export type Cie10Entry = { codigo: string; descripcion: string };
export type PagedConsultas = { items: Consulta[]; totalCount: number; page: number; pageSize: number };

export class ConsultaMedicaApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message : "No se pudo completar la operación.";
    throw new ConsultaMedicaApiError(message, response.status);
  }
  return payload as T;
}

export function createConsulta(patientId: string, fecha: string) {
  return request<Consulta>("/api/consultas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId, fecha }) });
}
export function updateConsulta(id: string, values: UpdateConsultaInput) {
  return request<Consulta>(`/api/consultas/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
}
export function finalizeConsulta(id: string) { return request<Consulta>(`/api/consultas/${encodeURIComponent(id)}/finalizar`, { method: "POST" }); }
export function getConsulta(id: string) { return request<Consulta>(`/api/consultas/${encodeURIComponent(id)}`); }
export function listConsultas(patientId: string, page = 1, pageSize = 100) {
  return request<PagedConsultas>(`/api/consultas?${new URLSearchParams({ patientId, page: String(page), pageSize: String(pageSize) })}`);
}
export function searchCie10(search = "") { return request<Cie10Entry[]>(`/api/consultas/cie10?${new URLSearchParams({ search })}`); }
export function uploadConsultaAttachment(consultaId: string, file: File) {
  const body = new FormData(); body.append("archivo", file);
  return request<ConsultaAttachment>(`/api/consultas/${encodeURIComponent(consultaId)}/adjuntos`, { method: "POST", body });
}
export function listConsultaAttachments(consultaId: string) { return request<ConsultaAttachment[]>(`/api/consultas/${encodeURIComponent(consultaId)}/adjuntos`); }
export function deleteConsultaAttachment(attachmentId: string) { return request<void>(`/api/consultas/adjuntos/${encodeURIComponent(attachmentId)}`, { method: "DELETE" }); }
export function attachmentDownloadUrl(attachmentId: string) { return `/api/consultas/adjuntos/${encodeURIComponent(attachmentId)}/contenido`; }
export function recetaPdfUrl(consultaId: string) { return `/api/consultas/${encodeURIComponent(consultaId)}/receta-pdf`; }
