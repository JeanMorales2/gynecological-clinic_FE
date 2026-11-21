"use client";

import { useState } from "react";
import { Card, Icon } from "@/components/ui";
import { NotificationsHistory, TestEmailForm } from "@/features/notificaciones";
import { useSession } from "@/stores/session";

export default function Page() {
  const { isLoading: isSessionLoading, user } = useSession();
  if (isSessionLoading) return <p className="text-sm text-text-secondary" role="status">Cargando sesión...</p>;
  if (user?.role !== "Admin") return <Card><p className="flex items-center gap-2 text-sm text-text-secondary"><Icon name="info" size={16} />Este módulo es solo para administradores.</p></Card>;
  return <AdminNotifications />;
}

function AdminNotifications() {
  const [refreshKey, setRefreshKey] = useState(0);
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight text-text">Notificaciones</h1><p className="mt-1 text-sm text-text-secondary">Pruebas y auditoría de envíos de correo.</p></div><TestEmailForm onSent={() => setRefreshKey((key) => key + 1)} /><section className="space-y-3"><h2 className="text-lg font-semibold text-text">Historial de correos</h2><NotificationsHistory refreshKey={refreshKey} /></section></div>;
}
