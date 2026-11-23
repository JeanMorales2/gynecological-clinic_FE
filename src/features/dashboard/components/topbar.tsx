"use client";

import { type RefObject } from "react";
import { Icon } from "@/components/ui";
import { FestiveAccent } from "@/features/festive-theme";

type TopbarProps = {
  isSidebarOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenSidebar: () => void;
};

export function Topbar({
  isSidebarOpen,
  menuButtonRef,
  onOpenSidebar,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-surface shadow-sm">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6">
        <button
          aria-controls="mobile-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label="Abrir menú de navegación"
          className="rounded-lg p-2 text-text-secondary hover:bg-bg hover:text-text focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
          onClick={onOpenSidebar}
          ref={menuButtonRef}
          type="button"
        >
          <Icon name="menu" size={22} />
        </button>
        <div className="ml-auto flex items-center gap-2">
          <FestiveAccent variant="icon" />
        </div>
      </div>
    </header>
  );
}
