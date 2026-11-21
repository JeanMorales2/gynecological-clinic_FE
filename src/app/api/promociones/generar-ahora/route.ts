import { forwardPromotionRequest } from "../proxy"; export async function POST() { return forwardPromotionRequest("/api/promociones/generar-ahora", { method: "POST" }); }
