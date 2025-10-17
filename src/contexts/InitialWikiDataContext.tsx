"use client";

import type { InitialWikiData } from "@/app/page";
import { createContext, useContext, type ReactNode } from "react";

const InitialWikiDataContext = createContext<InitialWikiData | undefined>(
  undefined,
);

export function InitialWikiDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: InitialWikiData;
}) {
  return (
    <InitialWikiDataContext.Provider value={initialData}>
      {children}
    </InitialWikiDataContext.Provider>
  );
}

export function useInitialWikiData() {
  const context = useContext(InitialWikiDataContext);
  if (context === undefined) {
    throw new Error(
      "useInitialWikiData must be used within InitialWikiDataProvider",
    );
  }
  return context;
}
