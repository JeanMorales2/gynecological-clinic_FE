"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = { id: string; email: string; role: string };

type SessionContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) { setUser(null); return; }
      setUser(await response.json() as AuthUser);
    } catch { setUser(null); }
    finally { setIsLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizes state with the external httpOnly-cookie session.
  useEffect(() => { void refreshSession(); }, [refreshSession]);
  const value = useMemo<SessionContextValue>(() => ({ user, isLoading, setUser, refreshSession }), [isLoading, refreshSession, user]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe usarse dentro de SessionProvider.");
  return context;
}