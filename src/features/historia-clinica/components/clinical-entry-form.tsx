"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import { todayInClinicTimezone } from "@/lib/dates";
import type { ClinicalEntry, ClinicalEntryType, ClinicalEntryUpdateInput } from "../api";

export type ClinicalEntryFormValues = ClinicalEntryUpdateInput;

type ClinicalEntryFormProps = {
  entry: ClinicalEntry | null;
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onSubmit: (values: ClinicalEntryFormValues) => Promise<void>;
};

const typeOptions = [
  { value: "Consulta", label: "Consulta" },
  { value: "ControlPrenatal", label: "Control prenatal" },
  { value: "Citologia", label: "Citología" },
  { value: "Ecografia", label: "Ecografía" },
  { value: "Laboratorio", label: "Laboratorio" },
];

const today = todayInClinicTimezone();

export function ClinicalEntryForm({ entry, isSubmitting, onCancel, onSubmit, submitError }: ClinicalEntryFormProps) {
  const [tipo, setTipo] = useState<ClinicalEntryType>(entry?.tipo ?? "Consulta");
  const [fecha, setFecha] = useState(entry?.fecha ?? today);
  const [motivo, setMotivo] = useState(entry?.motivo ?? "");
  const [hallazgos, setHallazgos] = useState(entry?.hallazgos ?? "");
  const [diagnostico, setDiagnostico] = useState(entry?.diagnostico ?? "");
  const [indicaciones, setIndicaciones] = useState(entry?.indicaciones ?? "");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fecha || !motivo.trim() || !hallazgos.trim()) {
      setValidationError("Ingresá fecha, motivo y hallazgos.");
      return;
    }
    setValidationError("");
    await onSubmit({ tipo, fecha, motivo: motivo.trim(), hallazgos: hallazgos.trim(), diagnostico: diagnostico.trim() || null, indicaciones: indicaciones.trim() || null });
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <div className="grid gap-4 sm:grid-cols-2">
      <Select label="Tipo de entrada" onChange={(event) => setTipo(event.target.value as ClinicalEntryType)} options={typeOptions} value={tipo} />
      <Input label="Fecha" onChange={(event) => setFecha(event.target.value)} required type="date" value={fecha} />
    </div>
    <Input label="Motivo" maxLength={300} onChange={(event) => setMotivo(event.target.value)} placeholder="Motivo breve de la entrada" required value={motivo} />
    <label className="block space-y-2 text-sm font-medium text-text"><span>Hallazgos</span><textarea className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" maxLength={8000} onChange={(event) => setHallazgos(event.target.value)} placeholder="Lo observado o registrado" required value={hallazgos} /></label>
    <label className="block space-y-2 text-sm font-medium text-text"><span>Diagnóstico <span className="font-normal text-text-secondary">(opcional)</span></span><textarea className="min-h-20 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" maxLength={4000} onChange={(event) => setDiagnostico(event.target.value)} value={diagnostico} /></label>
    <label className="block space-y-2 text-sm font-medium text-text"><span>Indicaciones <span className="font-normal text-text-secondary">(opcional)</span></span><textarea className="min-h-20 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" maxLength={4000} onChange={(event) => setIndicaciones(event.target.value)} value={indicaciones} /></label>
    <div className="flex flex-wrap justify-end gap-3 pt-2"><Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Guardando..." : entry ? "Guardar corrección" : "Guardar entrada"}</Button></div>
  </form>;
}
