"use client";

import { useInitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import { getArtPieces, getWritingPieces } from "@/lib/actions/portfolio";
import { useQuery } from "@tanstack/react-query";
import PortfolioClient from "./PortfolioClient";

export default function Portfolio() {
  const initialData = useInitialPortfolioData();

  const { data: artPieces = [], isLoading: isLoadingArt } = useQuery({
    queryKey: ["portfolio", "art"],
    queryFn: getArtPieces,
    initialData:
      initialData.artPieces.length > 0 ? initialData.artPieces : undefined,
  });

  const { data: writingPieces = [], isLoading: isLoadingWriting } = useQuery({
    queryKey: ["portfolio", "writing"],
    queryFn: getWritingPieces,
    initialData:
      initialData.writingPieces.length > 0
        ? initialData.writingPieces
        : undefined,
  });

  const loading = isLoadingArt || isLoadingWriting;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PortfolioClient
      artPieces={artPieces}
      writingPieces={writingPieces}
      initialData={initialData}
    />
  );
}
