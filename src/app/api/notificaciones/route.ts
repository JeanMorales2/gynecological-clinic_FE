import { forwardNotificationRequest } from "./proxy";

export async function GET(request: Request) {
  return forwardNotificationRequest(`/api/notificaciones${new URL(request.url).search}`, { method: "GET" });
}
