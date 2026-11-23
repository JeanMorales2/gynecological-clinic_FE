"use client";

import { useState } from "react";
import { Button, Card, Icon, Modal } from "@/components/ui";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import type { Patient } from "@/features/pacientes";
import { clinicalHistoryPdfDownloadUrl, ClinicalEntryForm, ClinicalTimeline, createClinicalEntry, HistoriaClinicaApiError, updateClinicalEntry, type ClinicalEntry, type ClinicalEntryFormValues } from "@/features/historia-clinica";
import { useSession } from "@/stores/session";

export default function Page() {
  const { user } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<Pick<Patient, "id" | "nombreCompleto"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ClinicalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = user?.role === "Admin" || user?.role === "Ginecologa";

  function openNewModal() { setEditingEntry(null); setFormError(""); setIsModalOpen(true); }
  function openEditModal(entry: ClinicalEntry) { setEditingEntry(entry); setFormError(""); setIsModalOpen(true); }
  function closeModal() { if (!isSubmitting) { setIsModalOpen(false); setFormError(""); } }

  async function submitEntry(values: ClinicalEntryFormValues) {
    if (!selectedPatient) return;
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingEntry) await updateClinicalEntry(editingEntry.id, values);
      else await createClinicalEntry({ ...values, patientId: selectedPatient.id });
      setIsModalOpen(false);
      setRefreshKey((value) => value + 1);
    } catch (reason) {
      setFormError(reason instanceof HistoriaClinicaApiError ? reason.message : "No se pudo guardar la entrada clínica.");
    } finally { setIsSubmitting(false); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-text">Historia clínica</h1><p className="mt-1 text-sm text-text-secondary">Consultas, controles y resultados ordenados por paciente.</p></div>{selectedPatient ? <div className="flex flex-wrap gap-2"><a download href={clinicalHistoryPdfDownloadUrl(selectedPatient.id)} target="_blank"><Button variant="outline">Exportar PDF</Button></a>{canManage ? <Button leadingIcon={<Icon name="plus" size={18} />} onClick={openNewModal}>Nueva entrada</Button> : null}</div> : null}</div>
    <Card allowOverflow title="Buscar paciente"><PatientSearchPicker onSelect={setSelectedPatient} selectedPatient={selectedPatient} /></Card>
    {!selectedPatient ? <Card><div className="flex items-start gap-3"><Icon className="mt-0.5 text-text-secondary" name="patients" size={22} /><div><h2 className="font-semibold text-text">Elegí un paciente</h2><p className="mt-1 text-sm text-text-secondary">Buscá por nombre para consultar su línea de tiempo clínica.</p></div></div></Card> : <div className="space-y-4"><p className="text-sm text-text-secondary">Historia de <span className="font-semibold text-text">{selectedPatient.nombreCompleto}</span></p><ClinicalTimeline canManage={canManage} onEdit={openEditModal} patientId={selectedPatient.id} refreshKey={refreshKey} /></div>}
    <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEntry ? "Corregir entrada clínica" : "Nueva entrada clínica"}><ClinicalEntryForm entry={editingEntry} isSubmitting={isSubmitting} key={editingEntry?.id ?? "new"} onCancel={closeModal} onSubmit={submitEntry} submitError={formError} /></Modal>
  </div>;
}
