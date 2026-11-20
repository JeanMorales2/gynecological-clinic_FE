import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Keep a single filled primary action per view; use outline or ghost for secondary actions. */
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
  outline: "border border-primary bg-transparent text-primary hover:bg-primary-soft",
  ghost: "bg-transparent text-primary hover:bg-primary-soft",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-8 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function Button({
  children,
  className = "",
  disabled,
  leadingIcon,
  size = "md",
  trailingIcon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      type={type}
      {...props}
    >
      {leadingIcon ? <span aria-hidden="true" className="shrink-0">{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span aria-hidden="true" className="shrink-0">{trailingIcon}</span> : null}
    </button>
  );
}