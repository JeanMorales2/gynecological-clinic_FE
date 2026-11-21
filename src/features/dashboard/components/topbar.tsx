"use client";

import type { ChangeEvent, RefObject } from "react";
import { useRouter } from "next/navigation";
import { Icon, Input, Select } from "@/components/ui";
import { logout } from "@/features/auth/api/session";
import { FestiveAccent } from "@/features/festive-theme";
import { useSession } from "@/stores/session";
import { type ThemePreference, useTheme } from "@/stores/theme";

type TopbarProps = { isSidebarOpen: boolean; menuButtonRef: RefObject<HTMLButtonElement | null>; onOpenSidebar: () => void };
const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Automático", value: "auto" },
];
export function Topbar({ isSidebarOpen, menuButtonRef, onOpenSidebar }: TopbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useSession();
  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) { setTheme(event.target.value as ThemePreference); }
  async function handleLogout() { await logout(); setUser(null); router.replace("/login"); router.refresh(); }
  const userInitial = user?.email.slice(0, 1).toUpperCase() ?? "?";

  return <header className="sticky top-0 z-20 border-b border-border bg-surface">
    <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
      <button aria-controls="mobile-sidebar" aria-expanded={isSidebarOpen} aria-label="Abrir menú de navegación" className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary lg:hidden" onClick={onOpenSidebar} ref={menuButtonRef} type="button"><Icon name="menu" size={22} /></button>
      <div className="hidden max-w-md flex-1 sm:block"><Input aria-label="Buscar" label="Buscar" placeholder="Buscar pacientes, citas..." /></div>
      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <div className="hidden w-40 sm:block"><Select aria-label="Tema visual" label="Tema" onChange={handleThemeChange} options={themeOptions} value={theme} /></div>
        <div className="sm:hidden"><label className="sr-only" htmlFor="mobile-theme">Tema visual</label><select className="min-h-10 rounded-lg border border-border bg-surface px-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary" id="mobile-theme" onChange={handleThemeChange} value={theme}><option value="light">Claro</option><option value="dark">Oscuro</option><option value="auto">Auto</option></select></div>
        <FestiveAccent variant="icon" />
        <button aria-label="Notificaciones" className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary" type="button"><Icon name="bell" size={21} /></button>
        <details className="relative">
          <summary aria-label="Abrir menú de usuario" className="flex size-9 cursor-pointer list-none items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text focus:outline-none focus:ring-2 focus:ring-primary">{userInitial}</summary>
          <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-surface p-2 shadow-lg"><p className="truncate px-2 py-1 text-sm font-medium text-text">{user?.email ?? "Cargando sesión..."}</p><p className="px-2 pb-2 text-xs text-text-secondary">{user?.role ?? ""}</p><button className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-primary hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary" onClick={handleLogout} type="button">Cerrar sesión</button></div>
        </details>
      </div>
    </div>
    <div className="border-t border-border px-4 py-2 sm:hidden"><Input aria-label="Buscar" label="Buscar" placeholder="Buscar pacientes, citas..." /></div>
  </header>;
}
