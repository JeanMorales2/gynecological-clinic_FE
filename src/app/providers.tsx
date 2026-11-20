"use client";
import type { ReactNode } from "react";
import { SessionProvider } from "@/stores/session";
import { ThemeProvider } from "@/stores/theme";
export function Providers({ children }: Readonly<{ children: ReactNode }>) { return <ThemeProvider><SessionProvider>{children}</SessionProvider></ThemeProvider>; }