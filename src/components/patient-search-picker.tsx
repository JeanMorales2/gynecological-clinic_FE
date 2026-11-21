"use client";

import { Input } from "@/components/ui";
import { usePatientSearch } from "@/hooks/use-patient-search";
import type { Patient } from "@/features/pacientes";

type PatientSearchPickerProps = {
  initialSearch?: string;
  selectedPatient: Pick<Patient, "id" | "nombreCompleto"> | null;
  onSelect: (patient: Pick<Patient, "id" | "nombreCompleto"> | null) => void;
};

export function PatientSearchPicker({ initialSearch = "", onSelect, selectedPatient }: PatientSearchPickerProps) {
  const { search, setSearch, results, isLoading, error } = usePatientSearch(initialSearch);
  const isOpen = !selectedPatient && search.trim().length >= 2;

  function selectPatient(patient: Patient) {
    onSelect(patient);
    setSearch(patient.nombreCompleto);
  }

  return <div className="relative">
    <Input autoComplete="off" label="Paciente" onChange={(event) => { onSelect(null); setSearch(event.target.value); }} placeholder="Buscá por nombre" value={search} />
    {isOpen ? <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
      {isLoading ? <p className="px-3 py-2 text-sm text-text-secondary">Buscando pacientes...</p> : null}
      {error ? <p className="px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
      {!isLoading && !error && results.length === 0 ? <p className="px-3 py-2 text-sm text-text-secondary">No se encontraron pacientes.</p> : null}
      {results.map((patient) => <button className="block w-full border-t border-border px-3 py-2 text-left text-sm text-text hover:bg-bg" key={patient.id} onClick={() => selectPatient(patient)} type="button">{patient.nombreCompleto}<span className="ml-2 text-text-secondary">{patient.telefono}</span></button>)}
    </div> : null}
  </div>;
}
