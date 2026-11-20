"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui";

type NavigationItem = { href: string; label: string; icon: IconName };
const navigation: NavigationItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/pacientes", label: "Pacientes", icon: "patients" },
  { href: "/prospeccion", label: "Prospección", icon: "funnel" },
  { href: "/citas", label: "Citas y agenda", icon: "calendar" },
  { href: "/historia-clinica", label: "Historia clínica", icon: "clipboard" },
  { href: "/laboratorio-externo", label: "Laboratorio externo", icon: "flask" },
  { href: "/facturacion", label: "Facturación", icon: "receipt" },
  { href: "/inventario", label: "Inventario y stock", icon: "inventory" },
  { href: "/promociones", label: "Promociones", icon: "promotions" },
  { href: "/usuarios", label: "Usuarios y roles", icon: "users" },
  { href: "/notificaciones", label: "Notificaciones", icon: "bell" },
];
type SidebarProps = { className?: string; onNavigate?: () => void };
export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  return <aside className={`flex h-full w-72 flex-col border-r border-border bg-surface ${className}`}>
    <div className="flex h-16 items-center border-b border-border px-6"><Link aria-label="Ir al dashboard" className="text-lg font-semibold tracking-tight text-primary" href="/" onClick={onNavigate}>Ginecología</Link></div>
    <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-5"><p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Menú principal</p><ul className="space-y-1">{navigation.map((item) => {
      const isActive = pathname === item.href;
      return <li key={item.href}><Link aria-current={isActive ? "page" : undefined} className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${isActive ? "border-primary bg-primary-soft text-primary" : "border-transparent text-text-secondary hover:bg-bg hover:text-text"}`} href={item.href} onClick={onNavigate}><Icon name={item.icon} size={19} /><span>{item.label}</span></Link></li>;
    })}</ul></nav>
  </aside>;
}