import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  /** Recommended for every state badge: it ensures the meaning is not conveyed by color alone. */
  icon?: ReactNode;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-bg text-text-secondary",
  accent: "bg-accent-soft text-accent-text",
};

export function Badge({ children, className = "", icon, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium ${toneClasses[tone]} ${className}`}>
      {icon ? <span aria-hidden="true" className="shrink-0">{icon}</span> : null}
      {children}
    </span>
  );
}