"use client";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/stores/theme";
export function Providers({ children }: Readonly<{ children: ReactNode }>) { return <ThemeProvider>{children}</ThemeProvider>; }
