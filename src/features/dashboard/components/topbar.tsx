"use client";

import type { ChangeEvent, RefObject } from "react";
import { Icon, Input, Select } from "@/components/ui";
import { type ThemePreference, useTheme } from "@/stores/theme";

type TopbarProps = { isSidebarOpen: boolean; menuButtonRef: RefObject<HTMLButtonElement | null>; onOpenSidebar: () => void };
const themeOptions: Array<{ label: string; value: ThemePreference }> = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Automático", value: "auto" },
];
export function Topbar({ isSidebarOpen, menuButtonRef, onOpenSidebar }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) { setTheme(event.target.value as ThemePreference); }
  return <header className="sticky top-0 z-20 border-b border-border bg-surface">
    <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
      <button aria-controls="mobile-sidebar" aria-expanded={isSidebarOpen} aria-label="Abrir menú de navegación" className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary lg:hidden" onClick={onOpenSidebar} ref={menuButtonRef} type="button"><Icon name="menu" size={22} /></button>
      <div className="hidden max-w-md flex-1 sm:block"><Input aria-label="Buscar" label="Buscar" placeholder="Buscar pacientes, citas..." /></div>
      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <div className="hidden w-40 sm:block"><Select aria-label="Tema visual" label="Tema" onChange={handleThemeChange} options={themeOptions} value={theme} /></div>
        <div className="sm:hidden"><label className="sr-only" htmlFor="mobile-theme">Tema visual</label><select className="min-h-10 rounded-lg border border-border bg-surface px-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary" id="mobile-theme" onChange={handleThemeChange} value={theme}><option value="light">Claro</option><option value="dark">Oscuro</option><option value="auto">Auto</option></select></div>
        <button aria-label="Notificaciones" className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary" type="button"><Icon name="bell" size={21} /></button>
        <button aria-label="Perfil de usuario" className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-text focus:outline-none focus:ring-2 focus:ring-primary" type="button">G</button>
      </div>
    </div>
    <div className="border-t border-border px-4 py-2 sm:hidden"><Input aria-label="Buscar" label="Buscar" placeholder="Buscar pacientes, citas..." /></div>
  </header>;
}