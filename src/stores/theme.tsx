"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "auto";
export const THEME_STORAGE_KEY = "ginecologia-theme-preference";
type ThemeContextValue = { theme: ThemePreference; setTheme: (theme: ThemePreference) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemePreference) {
  if (theme === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = theme;
}
function getSavedTheme(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    // "auto" solo se respeta cuando el usuario lo eligio explicitamente (quedo guardado tal cual);
    // si no hay nada guardado todavia, el default es "light", no seguir la preferencia del sistema.
    if (saved === "light" || saved === "dark" || saved === "auto") return saved;
    return "light";
  } catch { return "light"; }
}
export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setCurrentTheme] = useState<ThemePreference>("light");
  useEffect(() => {
    // Lee localStorage solo después de montar (nunca en el server) para que el primer render
    // del cliente siga coincidiendo con el server ("light", el default) y no dispare un
    // mismatch de hidratación. El <html data-theme> real ya lo fija el script inline de
    // layout.tsx antes de pintar; esto solo sincroniza el estado de React con ese valor ya aplicado.
    const saved = getSavedTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);
  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme: (nextTheme) => {
    setCurrentTheme(nextTheme); applyTheme(nextTheme);
    try { localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch { /* Persisting the setting is optional. */ }
  } }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider.");
  return context;
}
