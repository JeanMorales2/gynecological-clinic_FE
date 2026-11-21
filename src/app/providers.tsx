"use client";
import type { ReactNode } from "react";
import { FestivePreviewProvider } from "@/features/festive-theme";
import { SessionProvider } from "@/stores/session";
import { ThemeProvider } from "@/stores/theme";
export function Providers({ children }: Readonly<{ children: ReactNode }>) { return <ThemeProvider><SessionProvider><FestivePreviewProvider>{children}</FestivePreviewProvider></SessionProvider></ThemeProvider>; }