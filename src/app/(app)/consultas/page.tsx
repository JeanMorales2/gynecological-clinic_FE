"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageMessage, Table } from "@/components/ui";
import { PatientSearchPicker } from "@/components/patient-search-picker";
import { createConsulta, ConsultaMedicaApiError, listConsultas, type Consulta } from "@/features/consulta-medica";
import type { Patient } from "@/features/pacientes";
import { todayInClinicTimezone } from "@/lib/dates";
import { hasPermission, useSession } from "@/stores/session";

export default function ConsultasPage() {
  const router = useRouter();
  const { user } = useSession();
  const canManage = hasPermission(user, "consultas.gestionar");
  const [patient, setPatient] = useState<Pick<Patient, "id" | "nombreCompleto"> | null>(null);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadConsultas() {
      if (!patient) { setConsultas([]); setLoading(false); return; }
      setLoading(true); setError("");
      try { const result = await listConsultas(patient.id); if (active) setConsultas(result.items); }
      catch (reason) { if (active) setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudieron cargar las consultas."); }
      finally { if (active) setLoading(false); }
    }
    void loadConsultas();
    return () => { active = false; };
  }, [patient]);

  async function newConsulta() {
    if (!patient) return;
    setCreating(true); setError("");
    try { const consulta = await createConsulta(patient.id, todayInClinicTimezone()); router.push(`/consultas/${consulta.id}`); }
    catch (reason) { setError(reason instanceof ConsultaMedicaApiError ? reason.message : "No se pudo crear la consulta."); }
    finally { setCreating(false); }
  }

  return <div className="space-y-6">
    <PageMessage message={error} />
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-text">Consultas médicas</h1><p className="mt-1 text-sm text-text-secondary">Registro de la atención, exploración y receta por paciente.</p></div>{patient && canManage ? <Button disabled={creating} onClick={() => void newConsulta()}>{creating ? "Creando..." : "Nueva consulta"}</Button> : null}</div>
    <Card allowOverflow title="Buscar paciente"><PatientSearchPicker onSelect={setPatient} selectedPatient={patient} /></Card>
    {!patient ? <Card><p className="text-sm text-text-secondary">Elegí una paciente para consultar sus atenciones anteriores.</p></Card> : <Card title={`Consultas de ${patient.nombreCompleto}`}>
      {loading ? <p className="text-sm text-text-secondary">Cargando consultas...</p> : <Table<Consulta> caption="Consultas médicas" columns={[
        { key: "fecha", header: "Fecha", render: (item) => new Date(`${item.fecha}T12:00:00`).toLocaleDateString() },
        { key: "estado", header: "Estado" },
        { key: "id", header: "Acciones", render: (item) => <Button onClick={() => router.push(`/consultas/${item.id}`)} size="sm" variant="outline">Abrir</Button> },
      ]} data={consultas} emptyMessage="No hay consultas registradas para esta paciente." />}
    </Card>}
  </div>;
}
