"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { APP_CONFIG } from "@/constants/config";

interface SessionContextType {
  session: string;
  setSession: (session: string) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<string>(APP_CONFIG.academic.currentSession);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
