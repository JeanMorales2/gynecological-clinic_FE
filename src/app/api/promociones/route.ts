import { forwardPromotionRequest } from "./proxy"; export async function GET(request: Request) { return forwardPromotionRequest(`/api/promociones${new URL(request.url).search}`, { method: "GET" }); }
