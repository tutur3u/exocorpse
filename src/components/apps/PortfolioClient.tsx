"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { useInitialPortfolioData } from "@/contexts/InitialPortfolioDataContext";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { ArtPiece, WritingPiece } from "@/lib/actions/portfolio";
import Image from "next/image";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { MasonryGallery } from "./Gallery";

type PortfolioClientProps = {
  artPieces: ArtPiece[];
  writingPieces: WritingPiece[];
  onNavigateToGallery?: () => void;
};

export default function PortfolioClient({
  artPieces,
  writingPieces,
  onNavigateToGallery,
}: PortfolioClientProps) {
  // Use nuqs for URL state management
  const [params, setParams] = useQueryStates(
    {
      "portfolio-tab": parseAsStringLiteral(["art", "writing"] as const),
      "portfolio-piece": parseAsString,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  // Get initial data from context (server-side fetched data)
  const initialData = useInitialPortfolioData();

  // Initialize state from params or defaults
  const activeTab = (params["portfolio-tab"] ?? "art") as "art" | "writing";
  const selectedPieceId = params["portfolio-piece"];

  // Find selected pieces based on URL params
  // First try to use server-fetched data, then fall back to client data
  const selectedArt = useMemo(() => {
    if (!selectedPieceId || activeTab !== "art") return null;
    // Prefer server-fetched data if available and matches
    if (
      initialData.selectedArtPiece &&
      initialData.selectedArtPiece.slug === selectedPieceId
    ) {
      return initialData.selectedArtPiece;
    }
    // Fall back to searching in the gallery list
    return artPieces.find((a) => a.slug === selectedPieceId) ?? null;
  }, [selectedPieceId, activeTab, artPieces, initialData.selectedArtPiece]);

  const selectedWriting = useMemo(() => {
    if (!selectedPieceId || activeTab !== "writing") return null;
    // Prefer server-fetched data if available and matches
    if (
      initialData.selectedWritingPiece &&
      initialData.selectedWritingPiece.slug === selectedPieceId
    ) {
      return initialData.selectedWritingPiece;
    }
    // Fall back to searching in the gallery list
    return writingPieces.find((w) => w.slug === selectedPieceId) ?? null;
  }, [
    selectedPieceId,
    activeTab,
    writingPieces,
    initialData.selectedWritingPiece,
  ]);

  // Filter controls
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique years and tags
  const allYears = Array.from(
    new Set(
      [...artPieces, ...writingPieces]
        .map((item) => item.year)
        .filter((year): year is number => year !== null),
    ),
  ).sort((a, b) => b - a);

  const allTags = Array.from(
    new Set(
      [...artPieces, ...writingPieces].flatMap((item) => item.tags || []),
    ),
  ).sort();

  // Filter functions
  const filterItems = <T extends ArtPiece | WritingPiece>(items: T[]): T[] => {
    return items.filter((item) => {
      if (selectedYear && item.year !== selectedYear) return false;
      if (
        selectedTags.length > 0 &&
        !selectedTags.some((tag) => item.tags?.includes(tag))
      )
        return false;
      return true;
    });
  };

  const filteredArtPieces = filterItems(artPieces);
  const filteredWritingPieces = filterItems(writingPieces);

  // Batch fetch signed URLs for art images
  // Include both gallery pieces and the selected art piece
  const artImagePaths = [
    ...artPieces.flatMap((art) => [art.image_url, art.thumbnail_url]),
    ...(selectedArt ? [selectedArt.image_url, selectedArt.thumbnail_url] : []),
  ];

  const filteredArtImagePaths = artImagePaths.filter(
    (p): p is string => !!p && !p.startsWith("http"),
  );
  const { signedUrls: artImageUrls } = useBatchStorageUrls(
    filteredArtImagePaths,
  );

  // Batch fetch signed URLs for writing cover images
  // Include both gallery pieces and the selected writing piece
  const writingImagePaths = [
    ...writingPieces.flatMap((writing) => [
      writing.cover_image,
      writing.thumbnail_url,
    ]),
    ...(selectedWriting
      ? [selectedWriting.cover_image, selectedWriting.thumbnail_url]
      : []),
  ];
  const filteredWritingImagePaths = writingImagePaths.filter(
    (p): p is string => !!p && !p.startsWith("http"),
  );
  const { signedUrls: writingImageUrls } = useBatchStorageUrls(
    filteredWritingImagePaths,
  );

  // Convert art pieces to gallery format with signed URLs
  const galleryImages = filteredArtPieces.map((art) => ({
    id: art.id,
    url: artImageUrls.get(art.image_url) || art.image_url,
    title: art.title,
    description: art.description || undefined,
    metadata: {
      author: art.artist_name || undefined,
      authorUrl: art.artist_url || undefined,
      year: art.year,
      tags: art.tags,
    },
  }));

  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "art"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => {
            setParams({
              "portfolio-tab": "art",
              "portfolio-piece": null,
            });
          }}
        >
          Art ({artPieces.length})
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "writing"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => {
            setParams({
              "portfolio-tab": "writing",
              "portfolio-piece": null,
            });
          }}
        >
          Writing ({writingPieces.length})
        </button>
      </div>

      {/* Filters - Hide when viewing detail */}
      {!selectedArt && !selectedWriting && (
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-wrap gap-4">
            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Year:</label>
              <select
                value={selectedYear || ""}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="">All Years</option>
                {allYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filters */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tags:</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag)
                          ? prev.filter((t) => t !== tag)
                          : [...prev, tag],
                      );
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedYear || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSelectedYear(null);
                  setSelectedTags([]);
                }}
                className="ml-auto text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "art" ? (
          <div className="space-y-4">
            {selectedArt ? (
              /* Artwork Detail View */
              <div className="space-y-4">
                <button
                  onClick={() => {
                    onNavigateToGallery?.();
                    setParams({
                      "portfolio-piece": null,
                    });
                  }}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Gallery
                </button>
                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-center rounded-t-lg bg-gray-100 p-8 dark:bg-gray-900">
                    <div className="relative max-h-[70vh] w-full">
                      <Image
                        src={
                          artImageUrls.get(selectedArt.image_url) ||
                          selectedArt.image_url
                        }
                        alt={selectedArt.title}
                        width={800}
                        height={600}
                        className="max-h-[70vh] w-auto rounded-lg"
                        style={{ objectFit: "contain" }}
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                      <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                        {selectedArt.title}
                      </h2>
                      {selectedArt.description && (
                        <p className="mb-3 text-gray-600 dark:text-gray-400">
                          {selectedArt.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {selectedArt.artist_name && (
                          <span>
                            Artist:{" "}
                            {selectedArt.artist_url ? (
                              <a
                                href={selectedArt.artist_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {selectedArt.artist_name}
                              </a>
                            ) : (
                              selectedArt.artist_name
                            )}
                          </span>
                        )}
                        {selectedArt.year && <span>{selectedArt.year}</span>}
                        {selectedArt.tags &&
                          selectedArt.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredArtPieces.length === 0 ? (
              /* Empty State */
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {artPieces.length === 0
                    ? "No artwork available yet."
                    : "No artwork matches the selected filters."}
                </p>
              </div>
            ) : (
              /* Gallery Grid */
              <MasonryGallery
                images={galleryImages}
                onImageClick={(image) => {
                  const art = filteredArtPieces.find((a) => a.id === image.id);
                  if (art)
                    setParams({
                      "portfolio-piece": art.slug,
                    });
                }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {selectedWriting ? (
              /* Writing Detail View */
              <div className="space-y-4">
                <button
                  onClick={() => {
                    onNavigateToGallery?.();
                    setParams({
                      "portfolio-piece": null,
                    });
                  }}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Writing List
                </button>
                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  {selectedWriting.cover_image && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={
                          writingImageUrls.get(selectedWriting.cover_image) ||
                          selectedWriting.cover_image
                        }
                        alt={selectedWriting.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-4 border-b border-gray-200 pb-4 dark:border-gray-700">
                      <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
                        {selectedWriting.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        {selectedWriting.year && (
                          <span>{selectedWriting.year}</span>
                        )}
                        {selectedWriting.word_count && (
                          <span>{selectedWriting.word_count} words</span>
                        )}
                        {selectedWriting.tags &&
                          selectedWriting.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <MarkdownRenderer content={selectedWriting.content} />
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredWritingPieces.length === 0 ? (
              /* Empty State */
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {writingPieces.length === 0
                    ? "No writing available yet."
                    : "No writing matches the selected filters."}
                </p>
              </div>
            ) : (
              /* Writing List View */
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredWritingPieces.map((writing) => (
                  <div
                    key={writing.id}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    onClick={() =>
                      setParams({
                        "portfolio-piece": writing.slug,
                      })
                    }
                  >
                    {writing.cover_image && (
                      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={
                            writingImageUrls.get(writing.cover_image) ||
                            writing.cover_image
                          }
                          alt={writing.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        {writing.title}
                      </h3>
                      {writing.excerpt && (
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {writing.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {writing.year && <span>{writing.year}</span>}
                        {writing.word_count && (
                          <span>{writing.word_count} words</span>
                        )}
                        {writing.tags &&
                          writing.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
