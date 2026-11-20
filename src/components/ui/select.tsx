import { useId, type SelectHTMLAttributes } from "react";
import { Icon } from "./icon";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label: string;
  options: SelectOption[];
  error?: string;
};

export function Select({ className = "", disabled, error, id, label, options, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text" htmlFor={selectId}>{label}</label>
      <div className="relative">
        <select
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className={`min-h-10 w-full appearance-none rounded-lg border bg-surface px-3 py-2 pr-10 text-base text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted ${error ? "border-danger focus:border-danger focus:ring-danger" : "border-border"} ${className}`}
          disabled={disabled}
          id={selectId}
          {...props}
        >
          {options.map((option) => <option disabled={option.disabled} key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"><Icon name="chevronDown" size={18} /></span>
      </div>
      {error ? <p className="flex items-center gap-1.5 text-sm text-danger" id={errorId}><Icon name="alert" size={16} />{error}</p> : null}
    </div>
  );
}