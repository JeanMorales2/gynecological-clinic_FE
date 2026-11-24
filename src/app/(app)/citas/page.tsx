"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Icon, Input, Modal, PageMessage, useConfirmDialog } from "@/components/ui";
import { hasPermission, useSession } from "@/stores/session";
import { CitaForm, CitasAgendaView, CitasApiError, createAppointment, createScheduleException, deleteScheduleException, listProfessionals, listScheduleExceptions, updateAppointment, type Appointment, type AppointmentInput, type Professional, type ScheduleException } from "@/features/citas";

export default function Page() {
  const { confirm } = useConfirmDialog();
  const { user } = useSession();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalsError, setProfessionalsError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [scheduleExceptions, setScheduleExceptions] = useState<ScheduleException[]>([]);
  const [scheduleExceptionError, setScheduleExceptionError] = useState("");
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionDescription, setExceptionDescription] = useState("");
  const [isSavingException, setIsSavingException] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    async function loadProfessionals() {
      setProfessionalsError("");
      try { const values = await listProfessionals(); if (isCurrent) setProfessionals(values); }
      catch (reason) { if (isCurrent) setProfessionalsError(reason instanceof CitasApiError ? reason.message : "No se pudo cargar la lista de profesionales."); }
    }
    void loadProfessionals();
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!hasPermission(user, "citas.gestionar_excepciones")) return;
    let isCurrent = true;
    async function loadScheduleExceptions() {
      setScheduleExceptionError("");
      try { const values = await listScheduleExceptions(); if (isCurrent) setScheduleExceptions(values); }
      catch (reason) { if (isCurrent) setScheduleExceptionError(reason instanceof CitasApiError ? reason.message : "No se pudieron cargar las excepciones de horario."); }
    }
    void loadScheduleExceptions();
    return () => { isCurrent = false; };
  }, [user]);

  function openNewModal() { setEditingAppointment(null); setFormError(""); setIsFormDirty(false); setIsModalOpen(true); }
  function openEditModal(appointment: Appointment) { setEditingAppointment(appointment); setFormError(""); setIsFormDirty(false); setIsModalOpen(true); }
  async function closeModal() { if (isSubmitting) return; if (isFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return; setIsModalOpen(false); setFormError(""); setIsFormDirty(false); }

  async function submitAppointment(values: AppointmentInput) {
    setIsSubmitting(true); setFormError("");
    try { if (editingAppointment) await updateAppointment(editingAppointment.id, values); else await createAppointment(values); setIsModalOpen(false); setRefreshKey((value) => value + 1); }
    catch (reason) { setFormError(reason instanceof CitasApiError ? reason.message : "No se pudo guardar la cita."); }
    finally { setIsSubmitting(false); }
  }

  async function submitScheduleException(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!exceptionDate || !exceptionDescription.trim()) return;
    setIsSavingException(true); setScheduleExceptionError("");
    try {
      const created = await createScheduleException({ fecha: exceptionDate, descripcion: exceptionDescription.trim() });
      setScheduleExceptions((items) => [...items, created].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setExceptionDate(""); setExceptionDescription("");
    } catch (reason) { setScheduleExceptionError(reason instanceof CitasApiError ? reason.message : "No se pudo agregar la excepción de horario."); }
    finally { setIsSavingException(false); }
  }

  async function removeScheduleException(scheduleException: ScheduleException) {
    if (!(await confirm(`¿Eliminar la excepción del ${formatExceptionDate(scheduleException.fecha)}?`, { danger: true, confirmLabel: "Eliminar" }))) return;
    setIsSavingException(true); setScheduleExceptionError("");
    try {
      await deleteScheduleException(scheduleException.id);
      setScheduleExceptions((items) => items.filter((item) => item.id !== scheduleException.id));
    } catch (reason) { setScheduleExceptionError(reason instanceof CitasApiError ? reason.message : "No se pudo eliminar la excepción de horario."); }
    finally { setIsSavingException(false); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-text">Citas y agenda</h1><p className="mt-1 text-sm text-text-secondary">Agendá y seguí las consultas de cada día.</p></div><Button leadingIcon={<Icon name="plus" size={18} />} onClick={openNewModal}>Nueva cita</Button></div>
    <PageMessage message={professionalsError} />
    <CitasAgendaView onEdit={openEditModal} professionals={professionals} refreshKey={refreshKey} />
    <PageMessage message={scheduleExceptionError} />
    {hasPermission(user, "citas.gestionar_excepciones") ? <Card title="Días de excepción (horario completo)"><div className="space-y-4"><ul className="space-y-3">{scheduleExceptions.length ? scheduleExceptions.map((scheduleException) => <li className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 text-sm" key={scheduleException.id}><span><span className="font-medium">{formatExceptionDate(scheduleException.fecha)}</span> · {scheduleException.descripcion}</span><Button disabled={isSavingException} onClick={() => void removeScheduleException(scheduleException)} size="sm" variant="outline">Eliminar</Button></li>) : <li className="text-sm text-text-secondary">No hay próximas excepciones.</li>}</ul><form className="grid gap-3 sm:grid-cols-[minmax(0,180px)_1fr_auto] sm:items-end" onSubmit={submitScheduleException}><Input label="Fecha" onChange={(event) => setExceptionDate(event.target.value)} required type="date" value={exceptionDate} /><Input label="Descripción" onChange={(event) => setExceptionDescription(event.target.value)} placeholder="Jornada de salud comunitaria" required value={exceptionDescription} /><Button disabled={isSavingException} type="submit">{isSavingException ? "Agregando..." : "Agregar"}</Button></form></div></Card> : null}
    <Modal isOpen={isModalOpen} onClose={() => void closeModal()} title={editingAppointment ? "Editar cita" : "Nueva cita"}><CitaForm appointment={editingAppointment} isSubmitting={isSubmitting} key={editingAppointment?.id ?? "new"} onCancel={() => void closeModal()} onDirtyChange={setIsFormDirty} onSubmit={submitAppointment} professionals={professionals} submitError={formError} /></Modal>
  </div>;
}

function formatExceptionDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}
