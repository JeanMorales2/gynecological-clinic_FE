export type EmailNotificationStatus = "Pendiente" | "Enviado" | "Fallido";

export type EmailNotification = {
  id: string;
  destinatario: string;
  asunto: string;
  estado: EmailNotificationStatus;
  intentosCount: number;
  ultimoError: string | null;
  enviadoAtUtc: string | null;
  createdAtUtc: string;
};

export type PagedEmailNotifications = {
  items: EmailNotification[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export class NotificacionesApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message
      : "No se pudo completar la operación.";
    throw new NotificacionesApiError(message, response.status);
  }
  return payload as T;
}

export function listEmailNotifications(page: number, estado?: EmailNotificationStatus) {
  const query = new URLSearchParams({ page: String(page), pageSize: "20" });
  if (estado) query.set("estado", estado);
  return request<PagedEmailNotifications>(`/api/notificaciones?${query}`);
}

export function sendTestEmail(destinatario: string) {
  return request<EmailNotification>("/api/notificaciones/probar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destinatario }),
  });
}
