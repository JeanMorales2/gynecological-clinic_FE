"use client";

import { useState, type FormEvent } from "react";
import { Badge, Button, Icon, Input, Tabs } from "@/components/ui";
import { todayInClinicTimezone } from "@/lib/dates";
import type { Patient, PatientInput } from "../api";

type PacienteFormProps = {
  patient: Patient | null;
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onSubmit: (values: PatientInput) => Promise<void>;
};

export function PacienteForm({ isSubmitting, onCancel, onSubmit, patient, submitError }: PacienteFormProps) {
  const [nombreCompleto, setNombreCompleto] = useState(patient?.nombreCompleto ?? "");
  const [fechaNacimiento, setFechaNacimiento] = useState(patient?.fechaNacimiento ?? "");
  const [telefono, setTelefono] = useState(patient?.telefono ?? "");
  const [email, setEmail] = useState(patient?.email ?? "");
  const [documentoIdentidad, setDocumentoIdentidad] = useState(patient?.documentoIdentidad ?? "");
  const [alergias, setAlergias] = useState(patient?.alergias ?? "");
  const [antecedentesRelevantes, setAntecedentesRelevantes] = useState(patient?.antecedentesRelevantes ?? "");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nombreCompleto.trim() || !fechaNacimiento || !telefono.trim()) {
      setValidationError("Completá nombre, fecha de nacimiento y teléfono.");
      return;
    }
    setValidationError("");
    await onSubmit({
      nombreCompleto: nombreCompleto.trim(),
      fechaNacimiento,
      telefono: telefono.trim(),
      email: email.trim() || null,
      documentoIdentidad: documentoIdentidad.trim() || null,
      alergias: alergias.trim() || null,
      antecedentesRelevantes: antecedentesRelevantes.trim() || null,
    });
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <Tabs tabs={[
      {
        label: "Datos personales",
        value: "datos",
        content: <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Input autoComplete="name" label="Nombre completo" onChange={(event) => setNombreCompleto(event.target.value)} required value={nombreCompleto} /></div>
          <Input label="Fecha de nacimiento" max={todayInClinicTimezone()} onChange={(event) => setFechaNacimiento(event.target.value)} required type="date" value={fechaNacimiento} />
          <Input autoComplete="tel" label="Teléfono" onChange={(event) => setTelefono(event.target.value)} required type="tel" value={telefono} />
          <Input autoComplete="email" label="Correo electrónico" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          <Input label="Documento de identidad" onChange={(event) => setDocumentoIdentidad(event.target.value)} value={documentoIdentidad} />
        </div>,
      },
      {
        label: "Antecedentes y alergias",
        value: "antecedentes",
        content: <div className="space-y-4">
          {alergias.trim() ? <Badge icon={<Icon name="alert" size={16} />} tone="danger">Alergias registradas: verificá esta información clínica.</Badge> : null}
          <label className="block space-y-2 text-sm font-medium text-text">
            <span>Alergias</span>
            <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-danger focus:ring-2 focus:ring-danger" onChange={(event) => setAlergias(event.target.value)} placeholder="Ej.: alergia a penicilina" value={alergias} />
          </label>
          <label className="block space-y-2 text-sm font-medium text-text">
            <span>Antecedentes relevantes</span>
            <textarea className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setAntecedentesRelevantes(event.target.value)} value={antecedentesRelevantes} />
          </label>
        </div>,
      },
    ]} />
    <div className="flex flex-wrap justify-end gap-3 pt-2">
      <Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button>
      <Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : patient ? "Guardar cambios" : "Crear paciente"}</Button>
    </div>
  </form>;
}
