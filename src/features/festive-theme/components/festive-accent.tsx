"use client";

import { Icon } from "@/components/ui";
import { useFestiveTheme } from "../hooks/use-festive-theme";

export function FestiveAccent({ variant }: { variant: "icon" | "banner" }) {
  const { theme, isLoading } = useFestiveTheme();
  if (isLoading || !theme?.hasTheme || !theme.icon || !theme.accentColor) return null;

  const accentStyle = {
    backgroundColor: `${theme.accentColor}14`,
    borderColor: `${theme.accentColor}66`,
    color: theme.accentColor,
  };

  if (variant === "icon") {
    return <span aria-label={theme.label} className="inline-flex size-9 items-center justify-center rounded-lg border" style={accentStyle} title={theme.label}><Icon name={theme.icon} size={19} /></span>;
  }

  return <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium" role="status" style={accentStyle}><Icon name={theme.icon} size={18} /><span>{theme.label}</span></div>;
}
