import type { AuthUser } from "@/stores/session";

type LoginCredentials = { email: string; password: string };
type LoginResponse = { user: AuthUser };

export class LoginError extends Error { }

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
  if (!response.ok) throw new LoginError("Correo o contraseña incorrectos.");
  return response.json() as Promise<LoginResponse>;
}

export async function logout(): Promise<void> { await fetch("/api/auth/logout", { method: "POST" }); }

export async function requestPasswordReset(email: string): Promise<void> {
  await fetch("/api/auth/solicitar-reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
}

export class ResetPasswordError extends Error { }

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch("/api/auth/resetear-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message : "No se pudo restablecer la contraseña.";
    throw new ResetPasswordError(message);
  }
}

export class ChangePasswordError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await fetch("/api/auth/cambiar-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const message = payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
      ? payload.message : "No se pudo cambiar la contraseña.";
    throw new ChangePasswordError(message, response.status);
  }
}