"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import type { NewProspectInput, Prospect, ProspectInput, ProspectStatus } from "../api";

type ProspectoFormProps = {
  prospect: Prospect | null;
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onSubmit: (values: NewProspectInput | ProspectInput) => Promise<void>;
};

const editableStates: { label: string; value: ProspectStatus }[] = [
  { label: "Nuevo", value: "Nuevo" },
  { label: "Contactado", value: "Contactado" },
  { label: "Agendado", value: "Agendado" },
  { label: "Perdido", value: "Perdido" },
];

export function ProspectoForm({ isSubmitting, onCancel, onSubmit, prospect, submitError }: ProspectoFormProps) {
  const [nombreCompleto, setNombreCompleto] = useState(prospect?.nombreCompleto ?? "");
  const [telefono, setTelefono] = useState(prospect?.telefono ?? "");
  const [email, setEmail] = useState(prospect?.email ?? "");
  const [fuente, setFuente] = useState(prospect?.fuente ?? "");
  const [estado, setEstado] = useState<ProspectStatus>(prospect?.estado ?? "Nuevo");
  const [notas, setNotas] = useState(prospect?.notas ?? "");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombreCompleto.trim() || !telefono.trim()) {
      setValidationError("Completá nombre y teléfono.");
      return;
    }
    setValidationError("");
    const sharedValues = {
      nombreCompleto: nombreCompleto.trim(),
      telefono: telefono.trim(),
      email: email.trim() || null,
      fuente: fuente.trim() || null,
      notas: notas.trim() || null,
    };
    await onSubmit(prospect ? { ...sharedValues, estado } : sharedValues);
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Input autoComplete="name" label="Nombre completo" onChange={(event) => setNombreCompleto(event.target.value)} required value={nombreCompleto} /></div>
      <Input autoComplete="tel" label="Teléfono" onChange={(event) => setTelefono(event.target.value)} required type="tel" value={telefono} />
      <Input autoComplete="email" label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
      <Input label="Fuente" onChange={(event) => setFuente(event.target.value)} placeholder="Ej.: Redes sociales" value={fuente} />
      {prospect ? <Select label="Estado" onChange={(event) => setEstado(event.target.value as ProspectStatus)} options={editableStates} value={estado} /> : null}
      <label className="block space-y-2 text-sm font-medium text-text sm:col-span-2">
        <span>Notas</span>
        <textarea className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setNotas(event.target.value)} placeholder="Información relevante del contacto" value={notas} />
      </label>
    </div>
    <div className="flex flex-wrap justify-end gap-3 pt-2">
      <Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button>
      <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : prospect ? "Guardar cambios" : "Crear prospecto"}</Button>
    </div>
  </form>;
}
