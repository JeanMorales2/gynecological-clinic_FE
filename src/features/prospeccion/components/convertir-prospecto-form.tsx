"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon, Input } from "@/components/ui";
import { todayInClinicTimezone } from "@/lib/dates";
import type { ConvertProspectInput, Prospect } from "../api";

type ConvertirProspectoFormProps = {
  prospect: Prospect;
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onSubmit: (values: ConvertProspectInput) => Promise<void>;
};

export function ConvertirProspectoForm({ isSubmitting, onCancel, onSubmit, prospect, submitError }: ConvertirProspectoFormProps) {
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [documentoIdentidad, setDocumentoIdentidad] = useState("");
  const [alergias, setAlergias] = useState("");
  const [antecedentesRelevantes, setAntecedentesRelevantes] = useState("");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fechaNacimiento) {
      setValidationError("La fecha de nacimiento es obligatoria para crear la ficha de paciente.");
      return;
    }
    setValidationError("");
    await onSubmit({
      fechaNacimiento,
      documentoIdentidad: documentoIdentidad.trim() || null,
      alergias: alergias.trim() || null,
      antecedentesRelevantes: antecedentesRelevantes.trim() || null,
    });
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onSubmit={handleSubmit}>
    <p className="rounded-lg bg-bg p-3 text-sm text-text-secondary">Se creará la ficha de <span className="font-semibold text-text">{prospect.nombreCompleto}</span> con el teléfono {prospect.telefono}{prospect.email ? ` y el correo ${prospect.email}` : ""}.</p>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <Input label="Fecha de nacimiento" max={todayInClinicTimezone()} onChange={(event) => setFechaNacimiento(event.target.value)} required type="date" value={fechaNacimiento} />
    <Input label="Documento de identidad" onChange={(event) => setDocumentoIdentidad(event.target.value)} value={documentoIdentidad} />
    <label className="block space-y-2 text-sm font-medium text-text">
      <span>Alergias</span>
      <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setAlergias(event.target.value)} value={alergias} />
    </label>
    <label className="block space-y-2 text-sm font-medium text-text">
      <span>Antecedentes relevantes</span>
      <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setAntecedentesRelevantes(event.target.value)} value={antecedentesRelevantes} />
    </label>
    <div className="flex flex-wrap justify-end gap-3 pt-2">
      <Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button>
      <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Convirtiendo..." : "Convertir a paciente"}</Button>
    </div>
  </form>;
}
