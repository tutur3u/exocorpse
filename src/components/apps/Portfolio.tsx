"use client";

import { getArtPieces, getWritingPieces } from "@/lib/actions/portfolio";
import { useEffect, useState } from "react";
import PortfolioClient from "./PortfolioClient";
import type { ArtPiece, WritingPiece } from "@/lib/actions/portfolio";

export default function Portfolio() {
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([]);
  const [writingPieces, setWritingPieces] = useState<WritingPiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [art, writing] = await Promise.all([
          getArtPieces(),
          getWritingPieces(),
        ]);
        setArtPieces(art);
        setWritingPieces(writing);
      } catch (error) {
        console.error("Failed to load portfolio data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
    <PortfolioClient artPieces={artPieces} writingPieces={writingPieces} />
  );
}
