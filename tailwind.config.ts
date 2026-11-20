import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: {
    primary: "var(--color-primary)", "primary-hover": "var(--color-primary-hover)", "primary-active": "var(--color-primary-active)", "primary-soft": "var(--color-primary-soft)", "primary-border": "var(--color-primary-border)", "on-primary": "var(--color-on-primary)",
    secondary: "var(--color-secondary)",
    accent: "var(--color-accent)", "accent-hover": "var(--color-accent-hover)", "accent-text": "var(--color-accent-text)", "accent-soft": "var(--color-accent-soft)",
    bg: "var(--color-bg)", surface: "var(--color-surface)", border: "var(--color-border)", text: "var(--color-text)", "text-secondary": "var(--color-text-secondary)", "text-muted": "var(--color-text-muted)",
    success: "var(--color-success)", "success-bg": "var(--color-success-bg)", warning: "var(--color-warning)", "warning-bg": "var(--color-warning-bg)", danger: "var(--color-danger)", "danger-bg": "var(--color-danger-bg)", info: "var(--color-info)", "info-bg": "var(--color-info-bg)",
  } } },
  plugins: [],
};
export default config;
