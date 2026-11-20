import { useId, type InputHTMLAttributes } from "react";
import { Icon } from "./icon";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  error?: string;
};

export function Input({ className = "", disabled, error, id, label, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text" htmlFor={inputId}>{label}</label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={`min-h-10 w-full rounded-lg border bg-surface px-3 py-2 text-base text-text outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted ${error ? "border-danger focus:border-danger focus:ring-danger" : "border-border"} ${className}`}
        disabled={disabled}
        id={inputId}
        {...props}
      />
      {error ? <p className="flex items-center gap-1.5 text-sm text-danger" id={errorId}><Icon name="alert" size={16} />{error}</p> : null}
    </div>
  );
}