"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Button, Card, Input } from "@/components/ui";
import { LoginError, login } from "../api/session";
import { useSession } from "@/stores/session";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      setUser(result.user); router.replace("/"); router.refresh();
    } catch (reason) {
      setError(reason instanceof LoginError ? reason.message : "No se pudo iniciar sesión. Intentá de nuevo.");
    } finally { setIsSubmitting(false); }
  }

  return <div className="w-full max-w-md space-y-6">
    <div className="flex justify-center"><BrandMark priority width={180} /></div>
    <Card className="shadow-sm">
      <div className="mb-6 space-y-2"><h1 className="text-2xl font-semibold tracking-tight text-text">Iniciar sesión</h1><p className="text-sm text-text-secondary">Ingresá con las credenciales de tu cuenta.</p></div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input autoComplete="email" error={error ? "Revisá tus credenciales e intentá de nuevo." : undefined} label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <Input autoComplete="current-password" label="Contraseña" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
        <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-text-secondary"><Link className="text-primary hover:underline" href="/login/recuperar">¿Olvidaste tu contraseña?</Link></p>
    </Card>
  </div>;
}