"use client";

import { useInitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import { getPortfolioData } from "@/lib/actions/portfolio";
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

  const hasInitialGallery =
    initialData.artPieces.length > 0 ||
    initialData.writingPieces.length > 0 ||
    initialData.gamePieces.length > 0;
  const { data, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: getPortfolioData,
    initialData: hasInitialGallery
      ? {
          artPieces: initialData.artPieces,
          writingPieces: initialData.writingPieces,
          gamePieces: initialData.gamePieces,
        }
      : undefined,
    enabled: viewingGallery || hasInitialGallery,
  });
  const artPieces = data?.artPieces ?? [];
  const writingPieces = data?.writingPieces ?? [];
  const gamePieces = data?.gamePieces ?? [];
  const loading = viewingGallery && isLoading;

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
