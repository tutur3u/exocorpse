"use client";

import type {
  ArtPiece,
  GamePiece,
  GamePieceGalleryImage,
  WritingPiece,
} from "@/lib/actions/portfolio";
import type { PortfolioSearchParams } from "@/lib/portfolio-search-params";
import { createContext, useContext, type ReactNode } from "react";

// Extended type for game piece with gallery images (from server query)
export type GamePieceWithGallery = GamePiece & {
  game_piece_gallery_images?: GamePieceGalleryImage[];
};

export type InitialPortfolioData = {
  artPieces: ArtPiece[];
  writingPieces: WritingPiece[];
  gamePieces: GamePiece[];
  selectedArtPiece: ArtPiece | null;
  selectedWritingPiece: WritingPiece | null;
  selectedGamePiece: GamePieceWithGallery | null;
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
