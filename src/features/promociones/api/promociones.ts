export type PromotionType = "Cumpleanos"; export type PromotionStatus = "Generada" | "Enviada" | "Descartada";
export type Promotion = { id: string; patientId: string; patientNombreCompleto: string | null; tipo: PromotionType; titulo: string; mensaje: string; fechaGenerada: string; estado: PromotionStatus };
export type PagedPromotions = { items: Promotion[]; totalCount: number; page: number; pageSize: number };
export class PromocionesApiError extends Error { constructor(message: string, readonly status: number) { super(message); } }
async function request<T>(url: string, init?: RequestInit): Promise<T> { const response = await fetch(url, { ...init, cache: "no-store" }); const payload: unknown = await response.json().catch(() => null); if (!response.ok) { const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string" ? payload.message : "No se pudo completar la operación."; throw new PromocionesApiError(message, response.status); } return payload as T; }
export function listPromotions(patientId?: string, estado?: PromotionStatus) { const query = new URLSearchParams({ page: "1", pageSize: "100" }); if (patientId) query.set("patientId", patientId); if (estado) query.set("estado", estado); return request<PagedPromotions>(`/api/promociones?${query}`); }
export function discardPromotion(id: string) { return request<Promotion>(`/api/promociones/${id}/descartar`, { method: "POST" }); }
export function generatePromotionsNow() { return request<{ generated: number }>("/api/promociones/generar-ahora", { method: "POST" }); }
