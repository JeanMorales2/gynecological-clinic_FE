"use client";

import { useEffect, useState } from "react";
import { Button, Card, Icon, Input, Modal, PageMessage, useConfirmDialog } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import { createPatient, deactivatePatient, listPatients, PacienteForm, PacientesApiError, PacientesTable, reactivatePatient, updatePatient, type PagedPatients, type Patient, type PatientInput } from "@/features/pacientes";
import { createProspect, ProspectosApiError } from "@/features/prospeccion";

type ReferidoInput = {
  nombreCompleto: string;
  telefono: string;
  telefonoAlternativo: string | null;
};

const pageSize = 10;
const emptyResult: PagedPatients = { items: [], totalCount: 0, page: 1, pageSize };

export default function Page() {
  const { confirm } = useConfirmDialog();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PagedPatients>(emptyResult);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    async function loadPatients() {
      setIsLoading(true);
      setLoadError("");
      try {
        const patients = await listPatients({ search: debouncedSearch, page, pageSize });
        if (isCurrent) setResult(patients);
      } catch (reason) {
        if (isCurrent) setLoadError(reason instanceof PacientesApiError ? reason.message : "No se pudo cargar la lista de pacientes.");
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }
    void loadPatients();
    return () => { isCurrent = false; };
  }, [debouncedSearch, page, refreshKey]);

  function reload() { setRefreshKey((current) => current + 1); }
  function openNewPatientModal() { setEditingPatient(null); setFormError(""); setIsFormDirty(false); setIsModalOpen(true); }
  function openEditPatientModal(patient: Patient) { setEditingPatient(patient); setFormError(""); setIsFormDirty(false); setIsModalOpen(true); }
  async function closeModal() { if (isSubmitting) return; if (isFormDirty && !(await confirm("Tenés cambios sin guardar. Si salís ahora, se van a perder. ¿Querés salir igual?", { danger: true, confirmLabel: "Salir sin guardar" }))) return; setIsModalOpen(false); setFormError(""); setIsFormDirty(false); }

  async function handleSubmit(values: PatientInput, referidos?: ReferidoInput[]) {
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, values);
      } else {
        const patient = await createPatient(values);
        if (referidos?.length) {
          const outcomes = await Promise.allSettled(referidos.map((referido) => createProspect({
            nombreCompleto: referido.nombreCompleto,
            telefono: referido.telefono,
            telefonoAlternativo: referido.telefonoAlternativo,
            email: null,
            fuente: `Referido por ${patient.nombreCompleto}`,
            notas: null,
          })));
          const errors = outcomes.flatMap((outcome) => outcome.status === "rejected"
            ? [outcome.reason instanceof ProspectosApiError ? outcome.reason.message : "No se pudo crear uno de los referidos."]
            : []);
          if (errors.length) setActionError(`El paciente se creó, pero hubo problemas al registrar referidos: ${errors.join(" ")}`);
        }
      }
      setIsModalOpen(false);
      setPage(1);
      reload();
    } catch (reason) {
      setFormError(reason instanceof PacientesApiError ? reason.message : "No se pudo guardar el paciente.");
    } finally { setIsSubmitting(false); }
  }

  async function handleDeactivate(patient: Patient) {
    if (!(await confirm(`¿Desactivar a ${patient.nombreCompleto}?`, { danger: true, confirmLabel: "Desactivar" }))) return;
    setActionError("");
    setIsUpdatingId(patient.id);
    try { await deactivatePatient(patient.id); reload(); }
    catch (reason) { setActionError(reason instanceof PacientesApiError ? reason.message : "No se pudo desactivar el paciente."); }
    finally { setIsUpdatingId(null); }
  }

  async function handleReactivate(patient: Patient) {
    if (!(await confirm(`¿Reactivar a ${patient.nombreCompleto}?`, { confirmLabel: "Reactivar" }))) return;
    setActionError("");
    setIsUpdatingId(patient.id);
    try { await reactivatePatient(patient.id); reload(); }
    catch (reason) { setActionError(reason instanceof PacientesApiError ? reason.message : "No se pudo reactivar el paciente."); }
    finally { setIsUpdatingId(null); }
  }

  const totalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><h1 className="text-2xl font-semibold tracking-tight text-text">Pacientes</h1><p className="mt-1 text-sm text-text-secondary">Gestioná la ficha y alertas clínicas de las pacientes.</p></div>
      <div className="w-full lg:max-w-sm"><Input label="Buscar pacientes" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nombre" value={search} /></div>
      <Button leadingIcon={<Icon name="plus" size={18} />} onClick={openNewPatientModal}>Nuevo paciente</Button>
    </div>
    <PageMessage message={actionError} />
    {loadError ? <><PageMessage message={loadError} /><Card><div className="space-y-3"><Button onClick={reload} variant="outline">Reintentar</Button></div></Card></> : null}
    {!loadError ? (isLoading ? <p className="text-sm text-text-secondary" role="status">Cargando pacientes...</p> : <PacientesTable isUpdatingId={isUpdatingId} onDeactivate={(patient) => void handleDeactivate(patient)} onEdit={openEditPatientModal} onNextPage={() => setPage((current) => Math.min(current + 1, totalPages))} onPreviousPage={() => setPage((current) => Math.max(current - 1, 1))} onReactivate={(patient) => void handleReactivate(patient)} page={result.page} pageSize={result.pageSize} patients={result.items} totalCount={result.totalCount} />) : null}
    <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPatient ? "Editar paciente" : "Nuevo paciente"}>
      <PacienteForm isSubmitting={isSubmitting} key={editingPatient?.id ?? "new"} onCancel={() => void closeModal()} onDirtyChange={setIsFormDirty} onSubmit={handleSubmit} patient={editingPatient} submitError={formError} />
    </Modal>
  </div>;
}
