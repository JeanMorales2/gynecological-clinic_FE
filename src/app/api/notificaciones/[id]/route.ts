import { forwardNotificationRequest } from "../proxy";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return forwardNotificationRequest(`/api/notificaciones/${id}`, { method: "GET" });
}
