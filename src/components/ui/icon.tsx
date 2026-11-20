import type { ReactNode, SVGProps } from "react";

export type IconName = "alert" | "check" | "chevronDown" | "circle" | "clock" | "document" | "info" | "plus" | "sparkles" | "x";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, ReactNode> = {
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4m0 4h.01" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  circle: <circle cx="12" cy="12" r="8" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  document: <><path d="M7 3h7l3 3v15H7z" /><path d="M14 3v4h4M10 12h4m-4 4h4" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  sparkles: <><path d="m12 3 .9 4.1L17 8l-4.1.9L12 13l-.9-4.1L7 8l4.1-.9zM5 15l.5 2.5L8 18l-2.5.5L5 21l-.5-2.5L2 18l2.5-.5zM19 14l.5 2.5L22 17l-2.5.5L19 21l-.5-2.5L16 17l2.5-.5z" /></>,
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size} {...props}>
      {paths[name]}
    </svg>
  );
}