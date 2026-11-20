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