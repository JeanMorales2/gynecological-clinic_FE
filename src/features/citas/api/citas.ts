export type AppointmentStatus = "PendienteConsulta" | "Recepcionado" | "EnConsulta" | "Finalizada" | "NoShow";

export type Appointment = {
  id: string;
  patientId: string;
  pacienteNombreCompleto: string;
  profesionalId: string;
  profesionalNombreCompleto: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  duracionMinutos: number;
  estado: AppointmentStatus;
  notas: string | null;
  createdAtUtc: string;
};

export type Professional = { id: string; nombreCompleto: string };
export type PagedAppointments = { items: Appointment[]; totalCount: number; page: number; pageSize: number };
export type AppointmentInput = { patientId: string; profesionalId: string; fechaHoraInicio: string; duracionMinutos: number; notas: string | null };
export type ScheduleException = { id: string; fecha: string; descripcion: string; createdAtUtc: string };
export type ScheduleExceptionInput = { fecha: string; descripcion: string };

export class CitasApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message : "No se pudo completar la operación. Intentá de nuevo.";
    throw new CitasApiError(message, response.status);
  }
  return payload as T;
}

export function listAppointments({ fecha, desde, profesionalId, patientId, estado, page = 1, pageSize = 100 }: { fecha?: string; desde?: string; profesionalId?: string; patientId?: string; estado?: AppointmentStatus; page?: number; pageSize?: number }) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (fecha) query.set("fecha", fecha);
  if (desde) query.set("desde", desde);
  if (profesionalId) query.set("profesionalId", profesionalId);
  if (patientId) query.set("patientId", patientId);
  if (estado) query.set("estado", estado);
  return request<PagedAppointments>(`/api/citas?${query.toString()}`);
}

export function listProfessionals() { return request<Professional[]>("/api/citas/profesionales"); }

export function createAppointment(input: AppointmentInput) {
  return request<Appointment>("/api/citas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function updateAppointment(id: string, input: AppointmentInput) {
  return request<Appointment>(`/api/citas/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function changeAppointmentStatus(id: string, estado: AppointmentStatus) {
  return request<Appointment>(`/api/citas/${encodeURIComponent(id)}/estado`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado }) });
}

export function listScheduleExceptions({ desde, hasta }: { desde?: string; hasta?: string } = {}) {
  const query = new URLSearchParams();
  if (desde) query.set("desde", desde);
  if (hasta) query.set("hasta", hasta);
  const suffix = query.size ? `?${query.toString()}` : "";
  return request<ScheduleException[]>(`/api/citas/excepciones${suffix}`);
}

export function createScheduleException(input: ScheduleExceptionInput) {
  return request<ScheduleException>("/api/citas/excepciones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
}

export function deleteScheduleException(id: string) {
  return request<void>(`/api/citas/excepciones/${encodeURIComponent(id)}`, { method: "DELETE" });
}
