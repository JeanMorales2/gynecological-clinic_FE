import { Card } from "@/components/ui";

export default function DashboardPage() {
  return <section className="space-y-6"><div><p className="text-sm font-medium text-accent-text">Vista general</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-text sm:text-3xl">Dashboard</h1><p className="mt-2 text-text-secondary">Bienvenida al sistema de gestión de la clínica.</p></div><Card title="Todo listo para comenzar"><p className="text-text-secondary">Los indicadores y la actividad de la clínica aparecerán aquí cuando los módulos estén conectados.</p></Card></section>;
}