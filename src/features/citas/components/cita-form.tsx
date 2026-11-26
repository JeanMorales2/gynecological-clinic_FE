"use client";

import { useState, type FormEvent } from "react";
import { Button, Icon, Input, Select } from "@/components/ui";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { clinicDateAndTimeToIso, nowTimeInClinicTimezone, toClinicDateAndTime, todayInClinicTimezone } from "@/lib/dates";
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

const slotLabelFormatter = new Intl.DateTimeFormat("es-NI", { hour: "numeric", minute: "2-digit", hour12: true });

function buildTimeSlots() {
  const slots: { value: string; label: string }[] = [];
  for (let minutes = 8 * 60; minutes <= 17 * 60; minutes += 30) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    slots.push({ value, label: slotLabelFormatter.format(new Date(2000, 0, 1, hour, minute)) });
  }
  return slots;
}

const timeSlots = buildTimeSlots();

export function CitaForm({ appointment, professionals, isSubmitting, onCancel, onDirtyChange, onSubmit, submitError }: CitaFormProps) {
  const initial = appointment ? toClinicDateAndTime(appointment.fechaHoraInicio) : { fecha: todayInClinicTimezone(), hora: "" };
  const [selectedPatient, setSelectedPatient] = useState<Pick<Patient, "id" | "nombreCompleto"> | null>(appointment ? { id: appointment.patientId, nombreCompleto: appointment.pacienteNombreCompleto } : null);
  const [profesionalId, setProfesionalId] = useState(appointment?.profesionalId ?? "");
  const [fecha, setFecha] = useState(initial.fecha);
  const [hora, setHora] = useState(initial.hora);
  const [duracionMinutos, setDuracionMinutos] = useState(String(appointment?.duracionMinutos ?? 30));
  const [notas, setNotas] = useState(appointment?.notas ?? "");
  const [validationError, setValidationError] = useState("");

  const today = todayInClinicTimezone();
  const isToday = fecha === today;
  const nowTime = nowTimeInClinicTimezone();
  const horaOptions = timeSlots.filter((slot) => slot.value === hora || !isToday || slot.value >= nowTime);

  function handleFechaChange(value: string) {
    setFecha(value);
    if (value === today && hora && hora < nowTimeInClinicTimezone()) setHora("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const duration = Number(duracionMinutos);
    if (!selectedPatient || !profesionalId || !fecha || !hora || !Number.isInteger(duration) || duration < 5 || duration > 240) {
      setValidationError("Elegí paciente, profesional, fecha, horario y una duración entre 5 y 240 minutos.");
      return;
    }
    setValidationError("");
    await onSubmit({ patientId: selectedPatient.id, profesionalId, fechaHoraInicio: clinicDateAndTimeToIso(fecha, hora), duracionMinutos: duration, notas: notas.trim() || null });
  }

  const error = validationError || submitError;
  return <form className="space-y-4" onChange={() => onDirtyChange?.(true)} onSubmit={handleSubmit}>
    {error ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{error}</span></div> : null}
    <PatientSearchPicker initialSearch={appointment?.pacienteNombreCompleto ?? ""} onSelect={setSelectedPatient} selectedPatient={selectedPatient} />
    <div className="grid gap-4 sm:grid-cols-2">
      <Select label="Profesional" onChange={(event) => setProfesionalId(event.target.value)} options={[{ label: "Seleccioná una profesional", value: "" }, ...professionals.map((professional) => ({ label: professional.nombreCompleto, value: professional.id }))]} required value={profesionalId} />
      <Input label="Fecha" min={today} onChange={(event) => handleFechaChange(event.target.value)} required type="date" value={fecha} />
      <Select label="Horario" onChange={(event) => setHora(event.target.value)} options={[{ label: horaOptions.length ? "Seleccioná un horario" : "No quedan horarios disponibles hoy", value: "" }, ...horaOptions.map((slot) => ({ label: slot.label, value: slot.value }))]} required value={hora} />
      <Input label="Duración (minutos)" max={240} min={5} onChange={(event) => setDuracionMinutos(event.target.value)} required type="number" value={duracionMinutos} />
      <label className="block space-y-2 text-sm font-medium text-text sm:col-span-2"><span>Notas</span><textarea className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary" onChange={(event) => setNotas(event.target.value)} placeholder="Notas administrativas opcionales" value={notas} /></label>
    </div>
    <div className="flex flex-wrap justify-end gap-3 pt-2"><Button disabled={isSubmitting} onClick={onCancel} variant="outline">Cancelar</Button><Button disabled={isSubmitting || professionals.length === 0} type="submit">{isSubmitting ? "Guardando..." : appointment ? "Guardar cambios" : "Crear cita"}</Button></div>
  </form>;
}
