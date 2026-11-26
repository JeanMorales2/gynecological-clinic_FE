import { UpcomingAppointmentsCard } from "@/features/dashboard/components";
import { FestiveAccent } from "@/features/festive-theme";

export default function DashboardPage() {
  return <section className="space-y-6"><FestiveAccent variant="banner" /><div><p className="text-sm font-medium text-accent-text">Vista general</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">Dashboard</h1><p className="mt-2 text-text-secondary">Bienvenida al sistema de gestión de la clínica.</p></div><UpcomingAppointmentsCard /></section>;
}
