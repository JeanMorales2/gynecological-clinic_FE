"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, Icon, type BadgeTone, type IconName } from "@/components/ui";
import { CLINIC_TIMEZONE, todayInClinicTimezone, toClinicDateAndTime } from "@/lib/dates";
import { listAppointments, type Appointment, type AppointmentStatus } from "@/features/citas/api";

const timeFormatter = new Intl.DateTimeFormat("es-NI", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: CLINIC_TIMEZONE });
const dateFormatter = new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "2-digit", timeZone: CLINIC_TIMEZONE });
const statusPresentation: Record<AppointmentStatus, { tone: BadgeTone; icon: IconName; label: string }> = {
  PendienteConsulta: { tone: "neutral", icon: "clock", label: "Pendiente" },
  Recepcionado: { tone: "info", icon: "check", label: "Recepcionado" },
  EnConsulta: { tone: "warning", icon: "clock", label: "En consulta" },
  Finalizada: { tone: "success", icon: "check", label: "Finalizada" },
  NoShow: { tone: "neutral", icon: "circle", label: "No se presentó" },
};

function AppointmentRow({ appointment, showDate }: { appointment: Appointment; showDate: boolean }) {
  const presentation = statusPresentation[appointment.estado];
  const start = new Date(appointment.fechaHoraInicio);
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text">{appointment.pacienteNombreCompleto}</p>
        <p className="truncate text-xs text-text-secondary">
          {showDate ? `${dateFormatter.format(start)} · ` : ""}
          {timeFormatter.format(start)} · {appointment.profesionalNombreCompleto}
        </p>
      </div>
      <Badge icon={<Icon name={presentation.icon} size={14} />} tone={presentation.tone}>{presentation.label}</Badge>
    </li>
  );
}

export function UpcomingAppointmentsCard() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCurrent = true;
    listAppointments({ desde: todayInClinicTimezone(), pageSize: 50 })
      .then((result) => { if (isCurrent) setAppointments(result.items); })
      .catch(() => { if (isCurrent) setLoadError("No se pudieron cargar las citas."); });
    return () => { isCurrent = false; };
  }, []);

  const action = <Link className="text-sm font-medium text-primary hover:underline" href="/citas">Ver agenda completa</Link>;

  if (loadError) return <Card action={action} title="Citas de hoy y próximas"><p className="text-sm text-danger">{loadError}</p></Card>;
  if (appointments === null) return <Card action={action} title="Citas de hoy y próximas"><p className="text-sm text-text-secondary" role="status">Cargando citas...</p></Card>;

  const today = todayInClinicTimezone();
  const pending = appointments.filter((appointment) => appointment.estado !== "Finalizada" && appointment.estado !== "NoShow");
  const todayAppointments = pending.filter((appointment) => toClinicDateAndTime(appointment.fechaHoraInicio).fecha === today);
  const upcomingAppointments = pending.filter((appointment) => toClinicDateAndTime(appointment.fechaHoraInicio).fecha !== today).slice(0, 6);

  return (
    <Card action={action} title="Citas de hoy y próximas">
      <div className="space-y-5">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">Hoy</p>
          {todayAppointments.length === 0
            ? <p className="text-sm text-text-secondary">No hay citas pendientes para hoy.</p>
            : <ul className="divide-y divide-border">{todayAppointments.map((appointment) => <AppointmentRow appointment={appointment} key={appointment.id} showDate={false} />)}</ul>}
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">Próximas</p>
          {upcomingAppointments.length === 0
            ? <p className="text-sm text-text-secondary">No hay próximas citas agendadas.</p>
            : <ul className="divide-y divide-border">{upcomingAppointments.map((appointment) => <AppointmentRow appointment={appointment} key={appointment.id} showDate={true} />)}</ul>}
        </div>
      </div>
    </Card>
  );
}
