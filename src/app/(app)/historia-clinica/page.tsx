"use client";

import { useEffect, useState } from "react";
import { Button, Card, Icon, Modal, useConfirmDialog } from "@/components/ui";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { getPatient, type Patient } from "@/features/pacientes";
import { clinicalHistoryPdfDownloadUrl, ClinicalEntryForm, ClinicalTimeline, createClinicalEntry, HistoriaClinicaApiError, listClinicalEntries, updateClinicalEntry, type ClinicalEntry, type ClinicalEntryFormValues } from "@/features/historia-clinica";
import { hasPermission, useSession } from "@/stores/session";

const dateFormatter = new Intl.DateTimeFormat("es-NI", { dateStyle: "long", timeZone: "UTC" });
function formatDate(value: string) { return dateFormatter.format(new Date(`${value}T00:00:00Z`)); }

function PatientSummary({ patient, latestEntry }: { patient: Patient; latestEntry: ClinicalEntry | null }) {
  return <Card title="Resumen del paciente">
    <div className="grid gap-4 sm:grid-cols-2">
      <div><h4 className="text-sm font-semibold text-text">Antecedentes patológicos personales</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{patient.antecedentesPatologicosPersonales ?? "No registrados"}</p></div>
      <div><h4 className="text-sm font-semibold text-text">Antecedentes patológicos familiares</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{patient.antecedentesPatologicosFamiliares ?? "No registrados"}</p></div>
    </div>
    <div className="mt-4 border-t border-border pt-4">
      {!latestEntry ? <p className="text-sm text-text-secondary">Todavía no hay entradas clínicas para resumir.</p> : <div className="space-y-3">
        <p className="text-sm text-text-secondary">Última fecha de consulta: <span className="font-semibold text-text">{formatDate(latestEntry.fecha)}</span></p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><h4 className="text-sm font-semibold text-text">Motivo</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{latestEntry.motivo}</p></div>
          <div><h4 className="text-sm font-semibold text-text">Diagnóstico</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{latestEntry.diagnostico ?? "No registrado"}</p></div>
          <div><h4 className="text-sm font-semibold text-text">Tratamiento</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{latestEntry.tratamiento ?? "No registrado"}</p></div>
          <div><h4 className="text-sm font-semibold text-text">Exámenes</h4><p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{latestEntry.examenes ?? "No registrados"}</p></div>
          <div><h4 className="text-sm font-semibold text-text">Cita de seguimiento</h4><p className="mt-1 text-sm text-text-secondary">{latestEntry.citaSeguimiento ? formatDate(latestEntry.citaSeguimiento) : "No programada"}</p></div>
        </div>
      </div>}
    </div>
  </Card>;
}

export default function Page() {
  const { confirm } = useConfirmDialog();
  const { user } = useSession();
  const [selectedPatient, setSelectedPatient] = useState<Pick<Patient, "id" | "nombreCompleto"> | null>(null);
  const [patientDetail, setPatientDetail] = useState<Patient | null>(null);
  const [latestEntry, setLatestEntry] = useState<ClinicalEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ClinicalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const canManage = hasPermission(user, "historia_clinica.gestionar");

  useEffect(() => {
    if (!selectedPatient) { setPatientDetail(null); setLatestEntry(null); return; }
    let isCurrent = true;
    void getPatient(selectedPatient.id).then((patient) => { if (isCurrent) setPatientDetail(patient); }).catch(() => { if (isCurrent) setPatientDetail(null); });
    void listClinicalEntries({ patientId: selectedPatient.id, page: 1, pageSize: 1 }).then((result) => { if (isCurrent) setLatestEntry(result.items[0] ?? null); }).catch(() => { if (isCurrent) setLatestEntry(null); });
    return () => { isCurrent = false; };
  }, [selectedPatient, refreshKey]);

  function openNewModal() { setEditingEntry(null); setFormError(""); setIsFormDirty(false); setIsModalOpen(true); }
  function openEditModal(entry: ClinicalEntry) { setEditingEntry(entry); setFormError(""); setIsFormDirty(false); setIsModalOpen(true); }
  async function closeModal() { if (isSubmitting) return; if (isFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return; setIsModalOpen(false); setFormError(""); setIsFormDirty(false); }

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
    {!selectedPatient ? <Card><div className="flex items-start gap-3"><Icon className="mt-0.5 text-text-secondary" name="patients" size={22} /><div><h2 className="font-semibold text-text">Elegí un paciente</h2><p className="mt-1 text-sm text-text-secondary">Buscá por nombre para consultar su línea de tiempo clínica.</p></div></div></Card> : <div className="space-y-4"><p className="text-sm text-text-secondary">Historia de <span className="font-semibold text-text">{selectedPatient.nombreCompleto}</span></p>{patientDetail ? <PatientSummary latestEntry={latestEntry} patient={patientDetail} /> : null}<ClinicalTimeline canManage={canManage} onEdit={openEditModal} patientId={selectedPatient.id} refreshKey={refreshKey} /></div>}
    <Modal isOpen={isModalOpen} onClose={() => void closeModal()} title={editingEntry ? "Corregir entrada clínica" : "Nueva entrada clínica"}><ClinicalEntryForm entry={editingEntry} isSubmitting={isSubmitting} key={editingEntry?.id ?? "new"} onCancel={() => void closeModal()} onDirtyChange={setIsFormDirty} onSubmit={submitEntry} submitError={formError} /></Modal>
  </div>;
}
