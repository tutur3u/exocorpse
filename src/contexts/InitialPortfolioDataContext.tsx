"use client";

import type { ArtPiece, WritingPiece } from "@/lib/actions/portfolio";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import { createContext, useContext, type ReactNode } from "react";

export type InitialPortfolioData = {
  artPieces: ArtPiece[];
  writingPieces: WritingPiece[];
  selectedArtPiece: ArtPiece | null;
  selectedWritingPiece: WritingPiece | null;
  params: PortfolioSearchParams;
};

const InitialPortfolioDataContext = createContext<
  InitialPortfolioData | undefined
>(undefined);

export function InitialPortfolioDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: InitialPortfolioData;
}) {
  return (
    <InitialPortfolioDataContext.Provider value={initialData}>
      {children}
    </InitialPortfolioDataContext.Provider>
  );
}

export function useInitialPortfolioData() {
  const context = useContext(InitialPortfolioDataContext);
  if (context === undefined) {
    throw new Error(
      "useInitialPortfolioData must be used within InitialPortfolioDataProvider",
    );
  }
  return context;
}
