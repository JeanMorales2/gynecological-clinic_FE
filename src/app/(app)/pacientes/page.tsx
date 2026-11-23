"use client";

import { useEffect, useState } from "react";
import { Button, Card, Icon, Input, Modal } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import { createPatient, deactivatePatient, listPatients, PacienteForm, PacientesApiError, PacientesTable, updatePatient, type PagedPatients, type Patient, type PatientInput } from "@/features/pacientes";
import { createProspect, ProspectosApiError } from "@/features/prospeccion";

type ReferidoInput = {
  nombreCompleto: string;
  telefono: string;
  telefonoAlternativo: string | null;
};

const pageSize = 10;
const emptyResult: PagedPatients = { items: [], totalCount: 0, page: 1, pageSize };

export default function Page() {
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
  function openNewPatientModal() { setEditingPatient(null); setFormError(""); setIsModalOpen(true); }
  function openEditPatientModal(patient: Patient) { setEditingPatient(patient); setFormError(""); setIsModalOpen(true); }
  function closeModal() { if (!isSubmitting) { setIsModalOpen(false); setFormError(""); } }

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
    if (!window.confirm(`¿Desactivar a ${patient.nombreCompleto}?`)) return;
    setActionError("");
    setIsUpdatingId(patient.id);
    try { await deactivatePatient(patient.id); reload(); }
    catch (reason) { setActionError(reason instanceof PacientesApiError ? reason.message : "No se pudo desactivar el paciente."); }
    finally { setIsUpdatingId(null); }
  }

  const totalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><h1 className="text-2xl font-semibold tracking-tight text-text">Pacientes</h1><p className="mt-1 text-sm text-text-secondary">Gestioná la ficha y alertas clínicas de las pacientes.</p></div>
      <div className="w-full lg:max-w-sm"><Input label="Buscar pacientes" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nombre" value={search} /></div>
      <Button leadingIcon={<Icon name="plus" size={18} />} onClick={openNewPatientModal}>Nuevo paciente</Button>
    </div>
    {actionError ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{actionError}</span></div> : null}
    {loadError ? <Card><div className="space-y-3"><p className="text-sm text-danger" role="alert">{loadError}</p><Button onClick={reload} variant="outline">Reintentar</Button></div></Card> : null}
    {!loadError ? (isLoading ? <p className="text-sm text-text-secondary" role="status">Cargando pacientes...</p> : <PacientesTable isUpdatingId={isUpdatingId} onDeactivate={(patient) => void handleDeactivate(patient)} onEdit={openEditPatientModal} onNextPage={() => setPage((current) => Math.min(current + 1, totalPages))} onPreviousPage={() => setPage((current) => Math.max(current - 1, 1))} page={result.page} pageSize={result.pageSize} patients={result.items} totalCount={result.totalCount} />) : null}
    <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPatient ? "Editar paciente" : "Nuevo paciente"}>
      <PacienteForm isSubmitting={isSubmitting} key={editingPatient?.id ?? "new"} onCancel={closeModal} onSubmit={handleSubmit} patient={editingPatient} submitError={formError} />
    </Modal>
  </div>;
}
