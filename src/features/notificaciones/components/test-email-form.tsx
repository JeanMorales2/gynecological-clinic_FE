"use client";

import { useState } from "react";
import { Badge, Button, Card, Icon, Input } from "@/components/ui";
import { NotificacionesApiError, sendTestEmail, type EmailNotification } from "../api";

export function TestEmailForm({ onSent }: { onSent: () => void }) {
  const [destinatario, setDestinatario] = useState("");
  const [result, setResult] = useState<EmailNotification | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setResult(null);
    try {
      const notification = await sendTestEmail(destinatario);
      setResult(notification);
      onSent();
    } catch (reason) {
      setError(reason instanceof NotificacionesApiError ? reason.message : "No se pudo enviar el correo de prueba.");
    } finally {
      setWorking(false);
    }
  }

  return <Card title="Enviar correo de prueba">
    <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={submit}>
      <div className="w-full sm:max-w-md"><Input label="Correo electrónico" onChange={(event) => setDestinatario(event.target.value)} placeholder="correo@ejemplo.com" required type="email" value={destinatario} /></div>
      <Button disabled={working} leadingIcon={<Icon name="bell" size={18} />} type="submit">Enviar prueba</Button>
    </form>
    {error ? <p className="mt-4 flex items-center gap-2 text-sm text-danger" role="alert"><Icon name="alert" size={16} />{error}</p> : null}
    {result ? <div className="mt-4 space-y-2" role="status"><Badge icon={<Icon name={result.estado === "Enviado" ? "check" : "alert"} size={15} />} tone={result.estado === "Enviado" ? "success" : "danger"}>{result.estado}</Badge>{result.estado === "Fallido" && result.ultimoError ? <p className="flex items-start gap-2 text-sm text-danger"><Icon name="alert" size={16} />{result.ultimoError}</p> : null}</div> : null}
  </Card>;
}
