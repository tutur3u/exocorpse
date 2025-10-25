"use client";

import { MasonryGallery } from "./Gallery";
import type { ArtPiece, WritingPiece } from "@/lib/actions/portfolio";
import { useState } from "react";

type PortfolioClientProps = {
  artPieces: ArtPiece[];
  writingPieces: WritingPiece[];
};

export default function PortfolioClient({
  artPieces,
  writingPieces,
}: PortfolioClientProps) {
  const [activeTab, setActiveTab] = useState<"writing" | "art">("art");
  const [selectedWriting, setSelectedWriting] = useState<WritingPiece | null>(
    null,
  );

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

  // Convert art pieces to gallery format
  const galleryImages = filteredArtPieces.map((art) => ({
    id: art.id,
    url: art.image_url,
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
          onClick={() => setActiveTab("art")}
        >
          Art ({artPieces.length})
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "writing"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => setActiveTab("writing")}
        >
          Writing ({writingPieces.length})
        </button>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap gap-4">
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Year:</label>
            <select
              value={selectedYear || ""}
              onChange={(e) =>
                setSelectedYear(e.target.value ? Number(e.target.value) : null)
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

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "art" ? (
          <div className="space-y-4">
            {filteredArtPieces.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {artPieces.length === 0
                    ? "No artwork available yet."
                    : "No artwork matches the selected filters."}
                </p>
              </div>
            ) : (
              <MasonryGallery images={galleryImages} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWritingPieces.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {writingPieces.length === 0
                    ? "No writing available yet."
                    : "No writing matches the selected filters."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredWritingPieces.map((writing) => (
                  <div
                    key={writing.id}
                    className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    onClick={() => setSelectedWriting(writing)}
                  >
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {writing.title}
                    </h3>
                    {writing.excerpt && (
                      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Writing Modal */}
      {selectedWriting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedWriting(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedWriting.title}
              </h2>
              <button
                onClick={() => setSelectedWriting(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedWriting.content
                      .split("\n")
                      .map((p) => `<p>${p}</p>`)
                      .join(""),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
