"use client";

import { useState, type RefObject } from "react";
import { Icon } from "@/components/ui";
import { FestiveAccent } from "@/features/festive-theme";

type TopbarProps = { isSidebarOpen: boolean; menuButtonRef: RefObject<HTMLButtonElement | null>; onOpenSidebar: () => void };

function SearchField({ className = "" }: { className?: string }) {
  const [value, setValue] = useState("");
  return <div className={`relative ${className}`}>
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"><Icon name="search" size={18} /></span>
    <input
      aria-label="Buscar pacientes, citas y más"
      className="min-h-10 w-full rounded-full border border-border bg-bg py-2 pl-10 pr-9 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary [&::-webkit-search-cancel-button]:appearance-none"
      onChange={(event) => setValue(event.target.value)}
      placeholder="Buscar pacientes, citas..."
      type="search"
      value={value}
    />
    {value ? <button aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-secondary hover:bg-border hover:text-text focus:outline-none focus:ring-2 focus:ring-primary" onClick={() => setValue("")} type="button"><Icon name="x" size={14} /></button> : null}
  </div>;
}

export function Topbar({ isSidebarOpen, menuButtonRef, onOpenSidebar }: TopbarProps) {
  return <header className="sticky top-0 z-20 bg-surface shadow-sm">
    <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
      <button aria-controls="mobile-sidebar" aria-expanded={isSidebarOpen} aria-label="Abrir menú de navegación" className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary lg:hidden" onClick={onOpenSidebar} ref={menuButtonRef} type="button"><Icon name="menu" size={22} /></button>
      <SearchField className="hidden max-w-md flex-1 sm:block" />
      <div className="ml-auto flex items-center gap-2 sm:ml-0"><FestiveAccent variant="icon" /></div>
    </div>
    <div className="px-4 py-2 sm:hidden"><SearchField /></div>
  </header>;
}
