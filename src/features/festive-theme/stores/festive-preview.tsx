"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CuratedHolidayEntry } from "../data/curated-holidays";

type FestivePreviewContextValue = {
  preview: CuratedHolidayEntry | "off" | null;
  setPreview: (entry: CuratedHolidayEntry | "off" | null) => void;
};

const FestivePreviewContext = createContext<FestivePreviewContextValue | null>(
  null,
);

export function FestivePreviewProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [preview, setPreview] = useState<CuratedHolidayEntry | "off" | null>(
    null,
  );
  const value = useMemo<FestivePreviewContextValue>(
    () => ({ preview, setPreview }),
    [preview],
  );
  return (
    <FestivePreviewContext.Provider value={value}>
      {children}
    </FestivePreviewContext.Provider>
  );
}

export function useFestivePreview() {
  const context = useContext(FestivePreviewContext);
  if (!context)
    throw new Error(
      "useFestivePreview debe usarse dentro de FestivePreviewProvider.",
    );
  return context;
}
