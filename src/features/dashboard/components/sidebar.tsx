"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { BrandIcon } from "@/components/brand-mark";
import { Icon, Select, type IconName } from "@/components/ui";
import { logout } from "@/features/auth/api/session";
import {
  getCuratedHolidays,
  useFestivePreview,
} from "@/features/festive-theme";
import { hasPermission, useSession } from "@/stores/session";
import { type ThemePreference, useTheme } from "@/stores/theme";

type NavigationItem = {
  href: string;
  label: string;
  icon: IconName;
  requiredPermission?: string;
};
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
  {
    href: "/usuarios",
    label: "Usuarios y roles",
    icon: "users",
    requiredPermission: "usuarios.gestionar",
  },
  { href: "/notificaciones", label: "Notificaciones", icon: "bell", requiredPermission: "notificaciones.gestionar" },
];

const themeCycle: ThemePreference[] = ["light", "dark", "auto"];
const themeIcon: Record<ThemePreference, IconName> = {
  light: "theme",
  dark: "moon",
  auto: "monitor",
};
const themeLabel: Record<ThemePreference, string> = {
  light: "Claro",
  dark: "Oscuro",
  auto: "Automático",
};

type SidebarProps = { className?: string; onNavigate?: () => void };
export function Sidebar({ className = "", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useSession();
  const { theme, setTheme } = useTheme();
  const { preview, setPreview } = useFestivePreview();
  const visibleNavigation = navigation.filter(
    (item) => !item.requiredPermission || hasPermission(user, item.requiredPermission),
  );

  const demoHolidays = getCuratedHolidays(new Date().getFullYear()).sort(
    (a, b) =>
      a.startMonth * 100 + a.startDay - (b.startMonth * 100 + b.startDay),
  );
  const demoOptions = [
    { label: "Automático (según fecha real)", value: "auto" },
    { label: "Apagado", value: "off" },
    ...demoHolidays.map((entry) => ({ label: entry.label, value: entry.id })),
  ];

  function cycleTheme() {
    setTheme(themeCycle[(themeCycle.indexOf(theme) + 1) % themeCycle.length]);
  }
  function handleDemoChange(event: ChangeEvent<HTMLSelectElement>) {
    if (event.target.value === "auto") setPreview(null);
    else if (event.target.value === "off") setPreview("off");
    else
      setPreview(
        demoHolidays.find((entry) => entry.id === event.target.value) ?? null,
      );
  }
  async function handleLogout() {
    await logout();
    setUser(null);
    router.replace("/login");
    router.refresh();
  }
  const userInitial = user?.email.slice(0, 1).toUpperCase() ?? "?";

  return (
    <aside
      className={`flex h-full w-72 flex-col border-r border-border bg-surface ${className}`}
    >
      <div className="flex h-16 items-center px-6">
        <Link
          aria-label="Ir al inicio"
          className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-primary"
          href="/"
          onClick={onNavigate}
        >
          <BrandIcon size={32} />
          Ginecología
        </Link>
      </div>
      <nav
        aria-label="Navegación principal"
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Menú principal
        </p>
        <ul className="space-y-1">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${isActive ? "border-primary bg-primary-soft text-primary" : "border-transparent text-text-secondary hover:bg-bg hover:text-text"}`}
                  href={item.href}
                  onClick={onNavigate}
                >
                  <Icon name={item.icon} size={19} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 p-3">
        <div>
          <p className="px-1 pb-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
            Demo
          </p>
          <Select
            label="Previsualizar festividad"
            onChange={handleDemoChange}
            options={demoOptions}
            value={preview === "off" ? "off" : (preview?.id ?? "auto")}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            aria-label="Notificaciones"
            className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary"
            type="button"
          >
            <Icon name="bell" size={20} />
          </button>
          <button
            aria-label={`Tema actual: ${themeLabel[theme]}. Cambiar tema.`}
            className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={cycleTheme}
            title={`Tema: ${themeLabel[theme]}`}
            type="button"
          >
            <Icon name={themeIcon[theme]} size={20} />
          </button>
        </div>

        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-bg focus:outline-none focus:ring-2 focus:ring-primary">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text">
              {userInitial}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-medium text-text">
                {user?.email ?? "Cargando sesión..."}
              </span>
              <span className="block truncate text-xs text-text-secondary">
                {user?.role ?? ""}
              </span>
            </span>
            <Icon
              className="shrink-0 text-text-secondary transition-transform group-open:rotate-180"
              name="chevronDown"
              size={16}
            />
          </summary>
          <div className="absolute inset-x-0 bottom-full z-10 mb-2 rounded-lg border border-border bg-surface p-2 shadow-lg">
            <button
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={handleLogout}
              type="button"
            >
              <Icon name="logout" size={16} />
              Cerrar sesión
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}
