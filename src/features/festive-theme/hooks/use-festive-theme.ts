"use client";

import { useEffect, useState } from "react";
import { fetchFestiveTheme, type FestiveTheme } from "../api/festive-theme";

let cachedTheme: FestiveTheme | null | undefined;
let pendingThemeRequest: Promise<FestiveTheme | null> | undefined;

function loadTheme(): Promise<FestiveTheme | null> {
  if (cachedTheme !== undefined) return Promise.resolve(cachedTheme);
  pendingThemeRequest ??= fetchFestiveTheme().then((theme) => {
    cachedTheme = theme;
    return theme;
  });
  return pendingThemeRequest;
}

export function useFestiveTheme(): { theme: FestiveTheme | null; isLoading: boolean } {
  const [theme, setTheme] = useState<FestiveTheme | null>(cachedTheme ?? null);
  const [isLoading, setIsLoading] = useState(cachedTheme === undefined);

  useEffect(() => {
    let active = true;
    void loadTheme().then((result) => {
      if (!active) return;
      setTheme(result);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  return { theme, isLoading };
}
