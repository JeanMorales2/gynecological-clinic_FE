"use client";

import { useEffect, useState } from "react";
import { Button, Card, Icon, Modal } from "@/components/ui";
import { CitaForm, CitasAgendaView, CitasApiError, createAppointment, listProfessionals, updateAppointment, type Appointment, type AppointmentInput, type Professional } from "@/features/citas";

export default function Page() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalsError, setProfessionalsError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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

  function openNewModal() { setEditingAppointment(null); setFormError(""); setIsModalOpen(true); }
  function openEditModal(appointment: Appointment) { setEditingAppointment(appointment); setFormError(""); setIsModalOpen(true); }
  function closeModal() { if (!isSubmitting) { setIsModalOpen(false); setFormError(""); } }

  async function submitAppointment(values: AppointmentInput) {
    setIsSubmitting(true); setFormError("");
    try { if (editingAppointment) await updateAppointment(editingAppointment.id, values); else await createAppointment(values); setIsModalOpen(false); setRefreshKey((value) => value + 1); }
    catch (reason) { setFormError(reason instanceof CitasApiError ? reason.message : "No se pudo guardar la cita."); }
    finally { setIsSubmitting(false); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-text">Citas y agenda</h1><p className="mt-1 text-sm text-text-secondary">Agendá y seguí las consultas de cada día.</p></div><Button leadingIcon={<Icon name="plus" size={18} />} onClick={openNewModal}>Nueva cita</Button></div>
    {professionalsError ? <Card><p className="text-sm text-danger" role="alert">{professionalsError}</p></Card> : null}
    <CitasAgendaView onEdit={openEditModal} professionals={professionals} refreshKey={refreshKey} />
    <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAppointment ? "Editar cita" : "Nueva cita"}><CitaForm appointment={editingAppointment} isSubmitting={isSubmitting} key={editingAppointment?.id ?? "new"} onCancel={closeModal} onSubmit={submitAppointment} professionals={professionals} submitError={formError} /></Modal>
  </div>;
}
