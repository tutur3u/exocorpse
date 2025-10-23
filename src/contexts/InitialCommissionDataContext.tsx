"use client";

import type { BlacklistedUser } from "@/lib/actions/blacklist";
import { createContext, useContext } from "react";

export type InitialCommissionData = {
  blacklistedUsers: BlacklistedUser[];
  blacklistTotal: number;
  blacklistPage: number;
  blacklistPageSize: number;
};

const InitialCommissionDataContext = createContext<
  InitialCommissionData | undefined
>(undefined);

export function InitialCommissionDataProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: InitialCommissionData;
}) {
  return (
    <InitialCommissionDataContext.Provider value={value}>
      {children}
    </InitialCommissionDataContext.Provider>
  );
}

export function useInitialCommissionData() {
  const context = useContext(InitialCommissionDataContext);
  if (context === undefined) {
    throw new Error(
      "useInitialCommissionData must be used within InitialCommissionDataProvider",
    );
  }
  return context;
}
