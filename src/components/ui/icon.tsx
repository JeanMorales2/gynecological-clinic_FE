import type { ReactNode, SVGProps } from "react";

export type IconName = "alert" | "bell" | "calendar" | "check" | "chevronDown" | "circle" | "clipboard" | "clock" | "dashboard" | "document" | "flask" | "funnel" | "info" | "inventory" | "menu" | "patients" | "plus" | "promotions" | "receipt" | "search" | "sparkles" | "theme" | "users" | "x";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, ReactNode> = {
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
  bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  calendar: <><rect height="16" rx="2" width="16" x="4" y="5" /><path d="M8 3v4m8-4v4M4 10h16" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  circle: <circle cx="12" cy="12" r="8" />,
  clipboard: <><rect height="17" rx="2" width="14" x="5" y="4" /><path d="M9 4V3h6v1m-6 6h6m-6 4h6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  dashboard: <><rect height="7" rx="1" width="7" x="3" y="3" /><rect height="7" rx="1" width="7" x="14" y="3" /><rect height="7" rx="1" width="7" x="3" y="14" /><rect height="7" rx="1" width="7" x="14" y="14" /></>,
  document: <><path d="M7 3h7l3 3v15H7z" /><path d="M14 3v4h4M10 12h4m-4 4h4" /></>,
  flask: <><path d="M9 3h6m-5 0v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" /><path d="M8 15h8" /></>,
  funnel: <><path d="M4 5h16l-6 7v5l-4 2v-7z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  inventory: <><path d="m4 7 8-4 8 4-8 4zM4 7v10l8 4 8-4V7m-8 4v10" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  patients: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 15c3.3 0 6 1.8 6 5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  promotions: <><path d="M20 12V5h-7L4 14l6 6z" /><circle cx="16.5" cy="8.5" r="1" /><path d="m10 19 5-5" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2-3-2-3 2z" /><path d="M9 8h6m-6 4h6" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  sparkles: <><path d="m12 3 .9 4.1L17 8l-4.1.9L12 13l-.9-4.1L7 8l4.1-.9zM5 15l.5 2.5L8 18l-2.5.5L5 21l-.5-2.5L2 18l2.5-.5zM19 14l.5 2.5L22 17l-2.5.5L19 21l-.5-2.5L16 17l2.5-.5z" /></>,
  theme: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3 3 0 0 1 0 5.7M17 14c2.3.5 4 2.5 4 5" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} {...props}>{paths[name]}</svg>;
}