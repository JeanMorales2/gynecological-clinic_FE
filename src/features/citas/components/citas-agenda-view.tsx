"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Icon, Input, Select, Table, type BadgeTone, type IconName, type TableColumn } from "@/components/ui";
import { changeAppointmentStatus, CitasApiError, listAppointments, type Appointment, type AppointmentStatus, type PagedAppointments, type Professional } from "../api";

type CitasAgendaViewProps = { professionals: Professional[]; refreshKey: number; onEdit: (appointment: Appointment) => void };
const emptyResult: PagedAppointments = { items: [], totalCount: 0, page: 1, pageSize: 100 };
const today = new Date().toISOString().slice(0, 10);
const statusPresentation: Record<AppointmentStatus, { tone: BadgeTone; icon: IconName; label: string }> = {
  PendienteConsulta: { tone: "neutral", icon: "clock", label: "Pendiente" },
  Recepcionado: { tone: "info", icon: "check", label: "Recepcionado" },
  EnConsulta: { tone: "warning", icon: "clock", label: "En consulta" },
  Finalizada: { tone: "success", icon: "check", label: "Finalizada" },
  NoShow: { tone: "neutral", icon: "circle", label: "No se presentó" },
};
const timeFormatter = new Intl.DateTimeFormat("es-NI", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });

function nextActions(status: AppointmentStatus): { label: string; target: AppointmentStatus }[] {
  if (status === "PendienteConsulta") return [{ label: "Recepcionar", target: "Recepcionado" }, { label: "No se presentó", target: "NoShow" }];
  if (status === "Recepcionado") return [{ label: "Iniciar consulta", target: "EnConsulta" }];
  if (status === "EnConsulta") return [{ label: "Finalizar", target: "Finalizada" }];
  return [];
}

export function CitasAgendaView({ professionals, refreshKey, onEdit }: CitasAgendaViewProps) {
  const [fecha, setFecha] = useState(today);
  const [profesionalId, setProfesionalId] = useState("");
  const [result, setResult] = useState<PagedAppointments>(emptyResult);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    async function loadAgenda() {
      setIsLoading(true); setLoadError("");
      try { const appointments = await listAppointments({ fecha, profesionalId: profesionalId || undefined }); if (isCurrent) setResult(appointments); }
      catch (reason) { if (isCurrent) setLoadError(reason instanceof CitasApiError ? reason.message : "No se pudo cargar la agenda."); }
      finally { if (isCurrent) setIsLoading(false); }
    }
    void loadAgenda();
    return () => { isCurrent = false; };
  }, [fecha, profesionalId, refreshKey, reloadKey]);

  async function changeStatus(appointment: Appointment, estado: AppointmentStatus) {
    setActionError(""); setIsUpdatingId(appointment.id);
    try { await changeAppointmentStatus(appointment.id, estado); const appointments = await listAppointments({ fecha, profesionalId: profesionalId || undefined }); setResult(appointments); }
    catch (reason) { setActionError(reason instanceof CitasApiError ? reason.message : "No se pudo actualizar el estado de la cita."); }
    finally { setIsUpdatingId(null); }
  }

  const columns: TableColumn<Appointment>[] = [
    { key: "fechaHoraInicio", header: "Hora", render: (appointment) => timeFormatter.format(new Date(appointment.fechaHoraInicio)) },
    { key: "pacienteNombreCompleto", header: "Paciente" },
    { key: "profesionalNombreCompleto", header: "Profesional" },
    { key: "duracionMinutos", header: "Duración", render: (appointment) => `${appointment.duracionMinutos} min` },
    { key: "estado", header: "Estado", render: (appointment) => { const presentation = statusPresentation[appointment.estado]; return <Badge icon={<Icon name={presentation.icon} size={16} />} tone={presentation.tone}>{presentation.label}</Badge>; } },
    { key: "id", header: "Acciones", render: (appointment) => <div className="flex flex-wrap gap-2">{appointment.estado === "PendienteConsulta" ? <Button disabled={isUpdatingId === appointment.id} onClick={() => onEdit(appointment)} size="sm" variant="ghost">Editar</Button> : null}{nextActions(appointment.estado).map((action) => <Button disabled={isUpdatingId === appointment.id} key={action.target} onClick={() => void changeStatus(appointment, action.target)} size="sm" variant="outline">{action.label}</Button>)}</div> },
  ];

  return <section className="space-y-4">
    <Card title="Agenda diaria"><div className="grid gap-4 sm:grid-cols-2"><Input label="Fecha" onChange={(event) => setFecha(event.target.value)} type="date" value={fecha} /><Select label="Profesional" onChange={(event) => setProfesionalId(event.target.value)} options={[{ label: "Todas las profesionales", value: "" }, ...professionals.map((professional) => ({ label: professional.nombreCompleto, value: professional.id }))]} value={profesionalId} /></div></Card>
    {actionError ? <div className="flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-sm text-danger" role="alert"><Icon name="alert" size={18} /><span>{actionError}</span></div> : null}
    {loadError ? <Card><div className="space-y-3"><p className="text-sm text-danger" role="alert">{loadError}</p><Button onClick={() => setReloadKey((value) => value + 1)} variant="outline">Reintentar</Button></div></Card> : null}
    {!loadError ? (isLoading ? <p className="text-sm text-text-secondary" role="status">Cargando agenda...</p> : <Table caption="Agenda de citas" columns={columns} data={result.items} emptyMessage="No hay citas para esta fecha." />) : null}
  </section>;
}
