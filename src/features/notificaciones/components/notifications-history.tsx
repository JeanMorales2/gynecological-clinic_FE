"use client";

import { useEffect, useState } from "react";
import { Badge, Card, Icon, Table, type BadgeTone } from "@/components/ui";
import { listEmailNotifications, NotificacionesApiError, type EmailNotification, type EmailNotificationStatus, type PagedEmailNotifications } from "../api";

const tones: Record<EmailNotificationStatus, BadgeTone> = { Enviado: "success", Fallido: "danger", Pendiente: "info" };
const icons: Record<EmailNotificationStatus, "check" | "alert" | "info"> = { Enviado: "check", Fallido: "alert", Pendiente: "info" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-NI", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function NotificationsHistory({ refreshKey }: { refreshKey: number }) {
  const [result, setResult] = useState<PagedEmailNotifications | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const response = await listEmailNotifications(page);
        if (current) setResult(response);
      } catch (reason) {
        if (current) setError(reason instanceof NotificacionesApiError ? reason.message : "No se pudo cargar el historial de correos.");
      } finally {
        if (current) setLoading(false);
      }
    })();
    return () => { current = false; };
  }, [page, refreshKey]);

  if (loading) return <p className="text-sm text-text-secondary">Cargando historial de correos...</p>;
  if (error) return <Card><p className="flex items-center gap-2 text-sm text-danger" role="alert"><Icon name="alert" size={16} />{error}</p></Card>;

  const data = result?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((result?.totalCount ?? 0) / (result?.pageSize ?? 20)));
  return <Table
    columns={[
      { key: "destinatario", header: "Destinatario" },
      { key: "asunto", header: "Asunto" },
      { key: "estado", header: "Estado", render: (notification: EmailNotification) => <Badge icon={<Icon name={icons[notification.estado]} size={15} />} tone={tones[notification.estado]}>{notification.estado}</Badge> },
      { key: "createdAtUtc", header: "Fecha", render: (notification: EmailNotification) => formatDate(notification.enviadoAtUtc ?? notification.createdAtUtc) },
    ]}
    data={data}
    emptyMessage="No hay correos registrados."
    pagination={{
      summary: `${result?.totalCount ?? 0} correo(s) registrado(s)`,
      currentPage: result?.page ?? 1,
      totalPages,
      onPreviousPage: () => setPage((current) => Math.max(1, current - 1)),
      onNextPage: () => setPage((current) => Math.min(totalPages, current + 1)),
    }}
  />;
}
