import type { FestiveIconName } from "../data/curated-holidays";

export type FestiveTheme = {
  hasTheme: boolean;
  season: string | null;
  label: string;
  icon: FestiveIconName | null;
  accentColor: string | null;
  source: "curated" | "curated+nager";
};

export async function fetchFestiveTheme(): Promise<FestiveTheme | null> {
  try {
    const response = await fetch("/api/festive-theme");
    if (!response.ok) return null;
    return await response.json() as FestiveTheme;
  } catch {
    return null;
  }
}
