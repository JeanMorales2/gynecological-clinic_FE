"use client";

import { useState, type FormEvent } from "react";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { Button, Icon, Input, Select } from "@/components/ui";
import type { Patient } from "@/features/pacientes";
import { todayInClinicTimezone } from "@/lib/dates";
import { promotionTypeLabels, type PromotionType } from "../api";

type PromotionFormProps = {
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onSubmit: (input: { patientId: string; tipo: PromotionType; titulo: string; mensaje: string; fechaGenerada: string }) => Promise<void>;
};

export function PromotionForm({ isSubmitting, onCancel, onSubmit, submitError }: PromotionFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Pick<Patient, "id" | "nombreCompleto"> | null>(null);
  const [tipo, setTipo] = useState<PromotionType>("Cumpleanos");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [fechaGenerada, setFechaGenerada] = useState(todayInClinicTimezone());
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPatient || !titulo.trim() || !mensaje.trim() || !fechaGenerada) {
      setValidationError("Elegí un paciente y completá el tipo, título, mensaje y fecha.");
      return;
    }
    setValidationError("");
    await onSubmit({ patientId: selectedPatient.id, tipo, titulo: titulo.trim(), mensaje: mensaje.trim(), fechaGenerada });
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <PatientSearchPicker onSelect={setSelectedPatient} selectedPatient={selectedPatient} />
    <div className="grid gap-4 sm:grid-cols-2">
      <Select label="Tipo" onChange={(event) => setTipo(event.target.value as PromotionType)} options={(Object.keys(promotionTypeLabels) as PromotionType[]).map((value) => ({ label: promotionTypeLabels[value], value }))} required value={tipo} />
      <Input label="Fecha" onChange={(event) => setFechaGenerada(event.target.value)} required type="date" value={fechaGenerada} />
      <Input className="sm:col-span-2" label="Título" maxLength={250} onChange={(event) => setTitulo(event.target.value)} required value={titulo} />
      <label className="block space-y-2 text-sm font-medium text-text sm:col-span-2"><span>Mensaje</span><textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" maxLength={2000} onChange={(event) => setMensaje(event.target.value)} required value={mensaje} /></label>
    </div>
    <div className="flex flex-wrap justify-end gap-3 pt-2"><Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : "Crear promoción"}</Button></div>
  </form>;
}
