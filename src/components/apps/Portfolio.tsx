"use client";

import { useInitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import {
  getArtPieces,
  getGamePieces,
  getWritingPieces,
} from "@/lib/actions/portfolio";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PortfolioClient from "./PortfolioClient";
import PortfolioLoadingSkeleton from "./PortfolioLoadingSkeleton";

export default function Portfolio() {
  const initialData = useInitialPortfolioData();
  const hasSelectedPiece = Boolean(
    initialData.selectedArtPiece ||
    initialData.selectedWritingPiece ||
    initialData.selectedGamePiece,
  );
  // Track if user has navigated to gallery view (back from detail)
  const [viewingGallery, setViewingGallery] = useState(
    !hasSelectedPiece ||
      initialData.artPieces.length > 0 ||
      initialData.writingPieces.length > 0 ||
      initialData.gamePieces.length > 0,
  );

  const { data: artPieces = [], isLoading: isLoadingArt } = useQuery({
    queryKey: ["portfolio", "art"],
    queryFn: getArtPieces,
    initialData:
      initialData.artPieces.length > 0 ? initialData.artPieces : undefined,
    // Only enable query if viewing gallery or already have data
    enabled: viewingGallery || initialData.artPieces.length > 0,
  });

  const { data: writingPieces = [], isLoading: isLoadingWriting } = useQuery({
    queryKey: ["portfolio", "writing"],
    queryFn: getWritingPieces,
    initialData:
      initialData.writingPieces.length > 0
        ? initialData.writingPieces
        : undefined,
    // Only enable query if viewing gallery or already have data
    enabled: viewingGallery || initialData.writingPieces.length > 0,
  });

  const { data: gamePieces = [], isLoading: isLoadingGames } = useQuery({
    queryKey: ["portfolio", "games"],
    queryFn: getGamePieces,
    initialData:
      initialData.gamePieces.length > 0 ? initialData.gamePieces : undefined,
    // Only enable query if viewing gallery or already have data
    enabled: viewingGallery || initialData.gamePieces.length > 0,
  });

  const loading =
    viewingGallery && (isLoadingArt || isLoadingWriting || isLoadingGames);

  if (loading) {
    return <PortfolioLoadingSkeleton />;
  }

  return (
    <PortfolioClient
      artPieces={artPieces}
      writingPieces={writingPieces}
      gamePieces={gamePieces}
      onNavigateToGallery={() => setViewingGallery(true)}
    />
  );
}
