"use client";

import type { InitialAboutData } from "@/lib/about";
import { createContext, useContext, type ReactNode } from "react";

const InitialAboutDataContext = createContext<InitialAboutData | undefined>(
  undefined,
);

export function InitialAboutDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: InitialAboutData;
}) {
  return (
    <InitialAboutDataContext.Provider value={initialData}>
      {children}
    </InitialAboutDataContext.Provider>
  );
}

export function useInitialAboutData() {
  const context = useContext(InitialAboutDataContext);

  if (context === undefined) {
    throw new Error(
      "useInitialAboutData must be used within InitialAboutDataProvider",
    );
  }

  return context;
}
