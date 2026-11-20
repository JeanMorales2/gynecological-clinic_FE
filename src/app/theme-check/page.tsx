"use client";

import type { ThemePreference } from "@/stores/theme";
import { useTheme } from "@/stores/theme";

const options: Array<{ label: string; value: ThemePreference }> = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Automático", value: "auto" },
];

const tokens = [
  ["primary", "bg-primary text-on-primary"], ["primary-hover", "bg-primary-hover text-on-primary"], ["primary-active", "bg-primary-active text-on-primary"], ["primary-soft", "bg-primary-soft text-text"], ["primary-border", "bg-primary-border text-text"], ["on-primary", "bg-on-primary text-text"], ["secondary", "bg-secondary text-text"],
  ["accent", "bg-accent text-text"], ["accent-hover", "bg-accent-hover text-text"], ["accent-text", "bg-accent-text text-on-primary"], ["accent-soft", "bg-accent-soft text-text"],
  ["bg", "bg-bg text-text"], ["surface", "bg-surface text-text"], ["border", "bg-border text-text"], ["text", "bg-surface text-text"], ["text-secondary", "bg-surface text-text-secondary"], ["text-muted", "bg-surface text-text-muted"],
  ["success", "bg-success text-on-primary"], ["success-bg", "bg-success-bg text-success"], ["warning", "bg-warning text-text"], ["warning-bg", "bg-warning-bg text-warning"], ["danger", "bg-danger text-on-primary"], ["danger-bg", "bg-danger-bg text-danger"], ["info", "bg-info text-on-primary"], ["info-bg", "bg-info-bg text-info"],
] as const;

export default function ThemeCheckPage() {
  const { theme, setTheme } = useTheme();

  return (
    <main className="min-h-screen bg-bg p-6 text-text sm:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Verificación de tema</h1>
        <p className="mt-2 text-text-secondary">Esta página temporal permite revisar los tokens de color en los tres modos de tema.</p>
        <div aria-label="Selector de tema" className="mt-6 flex flex-wrap gap-3">
          {options.map((option) => {
            const selected = theme === option.value;
            return <button aria-pressed={selected} className={selected ? "rounded-md bg-primary px-4 py-2 font-medium text-on-primary" : "rounded-md border border-border bg-surface px-4 py-2 font-medium text-text hover:bg-primary-soft"} key={option.value} onClick={() => setTheme(option.value)} type="button">{option.label}</button>;
          })}
        </div>
        <section aria-labelledby="tokens-heading" className="mt-10">
          <h2 className="text-lg font-semibold" id="tokens-heading">Tokens</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tokens.map(([name, classes]) => <div className={["min-h-24 rounded-md border border-border p-4", classes].join(" ")} key={name}><p className="font-medium">{name}</p><p className="mt-1 text-sm">Muestra de color</p></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
