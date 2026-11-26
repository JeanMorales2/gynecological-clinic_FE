"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Button, Card, Input } from "@/components/ui";
import { requestPasswordReset } from "../api/session";

export function RequestPasswordResetForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try { await requestPasswordReset(email); } finally { setIsSubmitting(false); setSuccess(true); }
  }

  return <div className="w-full max-w-md space-y-6">
    <div className="flex justify-center"><BrandMark priority width={180} /></div>
    <Card className="shadow-sm">
      <div className="mb-6 space-y-2"><h1 className="text-2xl font-semibold tracking-tight text-text">Recuperar contraseña</h1><p className="text-sm text-text-secondary">Ingresá tu correo y te enviamos un enlace para elegir una nueva contraseña.</p></div>
      {success
        ? <p className="rounded-lg bg-success-bg p-3 text-sm text-success" role="status">Si el correo está registrado, vas a recibir un enlace para restablecer tu contraseña en los próximos minutos.</p>
        : <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <Input autoComplete="email" label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}</Button>
        </form>}
      <p className="mt-4 text-center text-sm text-text-secondary"><Link className="text-primary hover:underline" href="/login">Volver a iniciar sesión</Link></p>
    </Card>
  </div>;
}
