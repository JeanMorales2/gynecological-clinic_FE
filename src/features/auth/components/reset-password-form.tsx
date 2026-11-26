"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Button, Card, Input } from "@/components/ui";
import { resetPassword, ResetPasswordError } from "../api/session";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(""); setServerError("");
    if (newPassword.length < 8) { setValidationError("La nueva contraseña debe tener al menos 8 caracteres."); return; }
    if (newPassword !== confirmPassword) { setValidationError("Las contraseñas no coinciden."); return; }

    setIsSubmitting(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (reason) {
      setServerError(reason instanceof ResetPasswordError ? reason.message : "No se pudo restablecer la contraseña.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="w-full max-w-md space-y-6">
    <div className="flex justify-center"><BrandMark priority width={180} /></div>
    <Card className="shadow-sm">
      <div className="mb-6 space-y-2"><h1 className="text-2xl font-semibold tracking-tight text-text">Elegir nueva contraseña</h1></div>
      {!token ? <p className="rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert">El enlace no es válido. Pedí uno nuevo desde la pantalla de inicio de sesión.</p>
      : success ? <p className="rounded-lg bg-success-bg p-3 text-sm text-success" role="status">Tu contraseña se actualizó. Ya podés iniciar sesión con la nueva.</p>
      : <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
        {validationError ? <p className="text-sm text-danger" role="alert">{validationError}</p> : null}
        {serverError ? <p className="text-sm text-danger" role="alert">{serverError}</p> : null}
        <Input autoComplete="new-password" label="Contraseña nueva" minLength={8} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
        <Input autoComplete="new-password" label="Confirmar contraseña nueva" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
        <Button className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : "Guardar nueva contraseña"}</Button>
      </form>}
      <p className="mt-4 text-center text-sm text-text-secondary"><Link className="text-primary hover:underline" href="/login">Volver a iniciar sesión</Link></p>
    </Card>
  </div>;
}
