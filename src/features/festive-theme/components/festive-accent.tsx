"use client";

import { Icon } from "@/components/ui";
import { useFestiveTheme } from "../hooks/use-festive-theme";
import { useFestivePreview } from "../stores/festive-preview";

export function FestiveAccent({ variant }: { variant: "icon" | "banner" }) {
  const { preview } = useFestivePreview();
  const { theme, isLoading } = useFestiveTheme();

  const active =
    preview === "off"
      ? null
      : preview
        ? {
            label: `${preview.label} (vista previa)`,
            icon: preview.icon,
            accentColor: preview.accentColor,
          }
        : theme?.hasTheme
          ? {
              label: theme.label,
              icon: theme.icon,
              accentColor: theme.accentColor,
            }
          : null;

  if (!preview && isLoading) return null;
  if (!active?.icon || !active.accentColor) return null;

  const accentStyle = {
    backgroundColor: `${active.accentColor}14`,
    borderColor: `${active.accentColor}66`,
    color: active.accentColor,
  };

  if (variant === "icon") {
    return (
      <span
        aria-label={active.label}
        className="festive-glow inline-flex size-9 items-center justify-center rounded-lg border"
        style={accentStyle}
        title={active.label}
      >
        <Icon className="festive-icon" name={active.icon} size={19} />
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
      role="status"
      style={accentStyle}
    >
      <Icon className="festive-icon" name={active.icon} size={18} />
      <span>{active.label}</span>
    </div>
  );
}
