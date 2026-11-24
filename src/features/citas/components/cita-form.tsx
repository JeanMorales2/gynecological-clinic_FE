"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import type { Patient } from "@/features/pacientes";
import type { Appointment, AppointmentInput, Professional } from "../api";

type CitaFormProps = {
  appointment: Appointment | null;
  professionals: Professional[];
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (values: AppointmentInput) => Promise<void>;
};

function toLocalInputValue(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function CitaForm({ appointment, professionals, isSubmitting, onCancel, onDirtyChange, onSubmit, submitError }: CitaFormProps) {
  const [selectedPatient, setSelectedPatient] = useState<Pick<Patient, "id" | "nombreCompleto"> | null>(appointment ? { id: appointment.patientId, nombreCompleto: appointment.pacienteNombreCompleto } : null);
  const [profesionalId, setProfesionalId] = useState(appointment?.profesionalId ?? "");
  const [fechaHoraLocal, setFechaHoraLocal] = useState(appointment ? toLocalInputValue(appointment.fechaHoraInicio) : toLocalInputValue(new Date().toISOString()));
  const [duracionMinutos, setDuracionMinutos] = useState(String(appointment?.duracionMinutos ?? 30));
  const [notas, setNotas] = useState(appointment?.notas ?? "");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const duration = Number(duracionMinutos);
    if (!selectedPatient || !profesionalId || !fechaHoraLocal || !Number.isInteger(duration) || duration < 5 || duration > 240) {
      setValidationError("Elegí paciente, profesional, fecha, hora y una duración entre 5 y 240 minutos.");
      return;
    }
    setValidationError("");
    await onSubmit({ patientId: selectedPatient.id, profesionalId, fechaHoraInicio: new Date(fechaHoraLocal).toISOString(), duracionMinutos: duration, notas: notas.trim() || null });
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onChange={() => onDirtyChange?.(true)} onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <PatientSearchPicker initialSearch={appointment?.pacienteNombreCompleto ?? ""} onSelect={setSelectedPatient} selectedPatient={selectedPatient} />
    <div className="grid gap-4 sm:grid-cols-2">
      <Select label="Profesional" onChange={(event) => setProfesionalId(event.target.value)} options={[{ label: "Seleccioná una profesional", value: "" }, ...professionals.map((professional) => ({ label: professional.nombreCompleto, value: professional.id }))]} required value={profesionalId} />
      <Input label="Fecha y hora" onChange={(event) => setFechaHoraLocal(event.target.value)} required type="datetime-local" value={fechaHoraLocal} />
      <Input label="Duración (minutos)" max={240} min={5} onChange={(event) => setDuracionMinutos(event.target.value)} required type="number" value={duracionMinutos} />
      <label className="block space-y-2 text-sm font-medium text-text sm:col-span-2"><span>Notas</span><textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setNotas(event.target.value)} placeholder="Notas administrativas opcionales" value={notas} /></label>
    </div>
    <div className="flex flex-wrap justify-end gap-3 pt-2"><Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button><Button disabled={isSubmitting || professionals.length === 0} type="submit">{isSubmitting ? "Guardando..." : appointment ? "Guardar cambios" : "Crear cita"}</Button></div>
  </form>;
}
