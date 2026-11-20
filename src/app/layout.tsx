import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "Ginecología", description: "Software de gestión ginecológica" };

const themeInitializationScript = 'try { const theme = localStorage.getItem("ginecologia-theme-preference"); if (theme === "light" || theme === "dark") { document.documentElement.dataset.theme = theme; } else { document.documentElement.removeAttribute("data-theme"); } } catch { document.documentElement.removeAttribute("data-theme"); }';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" suppressHydrationWarning><body><Script id="theme-initialization" strategy="beforeInteractive">{themeInitializationScript}</Script><Providers>{children}</Providers></body></html>;
}
