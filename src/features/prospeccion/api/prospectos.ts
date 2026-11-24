export const prospectStates = ["Nuevo", "Contactado", "Agendado", "Convertido", "Perdido"] as const;
export type ProspectStatus = (typeof prospectStates)[number];

export type Prospect = {
  id: string;
  nombreCompleto: string;
  telefono: string;
  telefonoAlternativo: string | null;
  email: string | null;
  fuente: string | null;
  estado: ProspectStatus;
  notas: string | null;
  patientId: string | null;
  createdAtUtc: string;
};

export type PagedProspects = {
  items: Prospect[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type ProspectInput = Pick<Prospect, "nombreCompleto" | "telefono" | "telefonoAlternativo" | "email" | "fuente" | "estado" | "notas">;
export type NewProspectInput = Omit<ProspectInput, "estado">;
export type ConvertProspectInput = {
  fechaNacimiento: string;
  documentoIdentidad: string | null;
  alergias: string | null;
  antecedentesRelevantes: string | null;
};

export class ProspectosApiError extends Error {
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
    throw new ProspectosApiError(message, response.status);
  }
  return payload as T;
}

export function listProspects({ search = "", estado, page = 1, pageSize = 10 }: { search?: string; estado?: ProspectStatus; page?: number; pageSize?: number }) {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (search.trim()) query.set("search", search.trim());
  if (estado) query.set("estado", estado);
  return request<PagedProspects>(`/api/prospectos?${query.toString()}`);
}

export function createProspect(input: NewProspectInput) {
  return request<Prospect>("/api/prospectos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function updateProspect(id: string, input: ProspectInput) {
  return request<Prospect>(`/api/prospectos/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function convertProspect(id: string, input: ConvertProspectInput) {
  return request<Prospect>(`/api/prospectos/${encodeURIComponent(id)}/convertir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export type InviteProspectResult = {
  prospect: Prospect;
  emailEnviado: boolean;
  errorEnvio: string | null;
};

export function inviteProspect(id: string) {
  return request<InviteProspectResult>(`/api/prospectos/${encodeURIComponent(id)}/invitar`, { method: "POST" });
}
