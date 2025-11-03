"use client";

import ArtPortfolioTab from "@/components/admin/portfolio/ArtPortfolioTab";
import GamePortfolioTab from "@/components/admin/portfolio/GamePortfolioTab";
import WritingPortfolioTab from "@/components/admin/portfolio/WritingPortfolioTab";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type {
  ArtPiece,
  GamePiece,
  WritingPiece,
} from "@/lib/actions/portfolio";
import { useState } from "react";

type PortfolioClientProps = {
  initialArtPieces: ArtPiece[];
  initialWritingPieces: WritingPiece[];
  initialGamePieces: GamePiece[];
};

export default function PortfolioClient({
  initialArtPieces,
  initialWritingPieces,
  initialGamePieces,
}: PortfolioClientProps) {
  const [activeTab, setActiveTab] = useState<"art" | "writing" | "games">(
    "art",
  );

  // Batch fetch ALL portfolio images in a single operation for optimal performance
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const allImagePaths = [
    // Art piece images
    ...initialArtPieces.flatMap((art) => [art.image_url, art.thumbnail_url]),
    // Writing piece images
    ...initialWritingPieces.flatMap((writing) => [
      writing.cover_image,
      writing.thumbnail_url,
    ]),
    // Game piece images
    ...initialGamePieces.map((game) => game.cover_image_url),
  ].filter((p): p is string => !!p && !p.startsWith("http"));

  const { signedUrls: imageUrls } = useBatchStorageUrls(allImagePaths);

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab("art")}
              className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "art"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Art ({initialArtPieces.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("writing")}
              className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "writing"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Writing ({initialWritingPieces.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("games")}
              className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "games"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Games ({initialGamePieces.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "art" && (
            <ArtPortfolioTab
              initialArtPieces={initialArtPieces}
              imageUrls={imageUrls}
            />
          )}

          {activeTab === "writing" && (
            <WritingPortfolioTab
              initialWritingPieces={initialWritingPieces}
              imageUrls={imageUrls}
            />
          )}

          {activeTab === "games" && (
            <GamePortfolioTab
              initialGamePieces={initialGamePieces}
              imageUrls={imageUrls}
            />
          )}
        </div>
      </div>
    </>
  );
}
