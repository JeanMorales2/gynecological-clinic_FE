"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isSidebarOpen) return;
    const previousElement = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => { drawerRef.current?.querySelector<HTMLElement>(focusableSelector)?.focus(); }, 0);
    return () => { window.clearTimeout(timer); document.body.style.overflow = originalOverflow; previousElement?.focus(); };
  }, [isSidebarOpen]);
  function closeSidebar() { setIsSidebarOpen(false); }
  function handleDrawerKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") { event.preventDefault(); closeSidebar(); return; }
    if (event.key !== "Tab") return;
    const focusableElements = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (!firstElement || !lastElement) return;
    if (event.shiftKey && document.activeElement === firstElement) { event.preventDefault(); lastElement.focus(); }
    else if (!event.shiftKey && document.activeElement === lastElement) { event.preventDefault(); firstElement.focus(); }
  }
  return <div className="flex min-h-screen bg-bg">
    <div className="hidden w-72 shrink-0 lg:block"><Sidebar className="fixed inset-y-0 left-0 z-30" /></div>
    {isSidebarOpen ? <div className="fixed inset-0 z-40 lg:hidden">
      <button aria-label="Cerrar menú de navegación" className="absolute inset-0 h-full w-full bg-black/40" onClick={closeSidebar} type="button" />
      <aside aria-label="Menú de navegación" aria-modal="true" className="relative h-full shadow-xl" id="mobile-sidebar" onKeyDown={handleDrawerKeyDown} ref={drawerRef} role="dialog" tabIndex={-1}>
        <button aria-label="Cerrar menú" className="absolute right-3 top-3 z-10 rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary" onClick={closeSidebar} type="button"><Icon name="x" size={20} /></button>
        <Sidebar onNavigate={closeSidebar} />
      </aside>
    </div> : null}
    <div className="flex min-w-0 flex-1 flex-col"><Topbar isSidebarOpen={isSidebarOpen} menuButtonRef={menuButtonRef} onOpenSidebar={() => setIsSidebarOpen(true)} />{children}</div>
  </div>;
}