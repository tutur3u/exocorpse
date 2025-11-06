"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import {
  type GamePieceWithGallery,
  useInitialPortfolioData,
} from "@/contexts/InitialPortfolioDataContext";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type {
  ArtPiece,
  GamePiece,
  WritingPiece,
} from "@/lib/actions/portfolio";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useMemo, useState } from "react";
import { MasonryGallery } from "./Gallery";

type PortfolioClientProps = {
  artPieces: ArtPiece[];
  writingPieces: WritingPiece[];
  gamePieces: GamePiece[];
  onNavigateToGallery?: () => void;
};

export default function PortfolioClient({
  artPieces,
  writingPieces,
  gamePieces,
  onNavigateToGallery,
}: PortfolioClientProps) {
  // Use nuqs for URL state management
  const [params, setParams] = useQueryStates(
    {
      "portfolio-tab": parseAsStringLiteral([
        "art",
        "writing",
        "games",
      ] as const).withDefault("art"),
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
  const activeTab = params["portfolio-tab"] as "art" | "writing" | "games";
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

  const selectedGame = useMemo<GamePieceWithGallery | null>(() => {
    if (!selectedPieceId || activeTab !== "games") return null;
    // Prefer server-fetched data if available and matches (includes gallery images)
    if (
      initialData.selectedGamePiece &&
      initialData.selectedGamePiece.slug === selectedPieceId
    ) {
      return initialData.selectedGamePiece;
    }
    // Fall back to searching in the gallery list
    return gamePieces.find((g) => g.slug === selectedPieceId) ?? null;
  }, [selectedPieceId, activeTab, gamePieces, initialData.selectedGamePiece]);

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

  // Batch fetch signed URLs for art images - only for the active tab
  // Include both gallery pieces and the selected art piece (if it belongs to this tab)
  const artImagePaths = useMemo(() => {
    if (activeTab !== "art") return [];

    const paths: (string | null)[] = [
      ...artPieces.flatMap((art) => [art.image_url, art.thumbnail_url]),
    ];

    // Only include selectedArt if it belongs to the art tab
    if (selectedArt) {
      paths.push(selectedArt.image_url, selectedArt.thumbnail_url);
    }

    // Deduplicate and filter out null/http URLs
    const uniquePaths = Array.from(
      new Set(paths.filter((p): p is string => !!p && !p.startsWith("http"))),
    );

    return uniquePaths;
  }, [activeTab, artPieces, selectedArt]);

  const { signedUrls: artImageUrls } = useBatchStorageUrls(artImagePaths);

  // Batch fetch signed URLs for writing cover images - only for the active tab
  // Include both gallery pieces and the selected writing piece (if it belongs to this tab)
  const writingImagePaths = useMemo(() => {
    if (activeTab !== "writing") return [];

    const paths: (string | null)[] = [
      ...writingPieces.flatMap((writing) => [
        writing.cover_image,
        writing.thumbnail_url,
      ]),
    ];

    // Only include selectedWriting if it belongs to the writing tab
    if (selectedWriting) {
      paths.push(selectedWriting.cover_image, selectedWriting.thumbnail_url);
    }

    // Deduplicate and filter out null/http URLs
    const uniquePaths = Array.from(
      new Set(paths.filter((p): p is string => !!p && !p.startsWith("http"))),
    );

    return uniquePaths;
  }, [activeTab, writingPieces, selectedWriting]);

  const { signedUrls: writingImageUrls } =
    useBatchStorageUrls(writingImagePaths);

  // Batch fetch signed URLs for game cover images and gallery images - only for the active tab
  const gameImagePaths = useMemo(() => {
    if (activeTab !== "games") return [];

    const paths: (string | null)[] = [
      ...gamePieces.map((game) => game.cover_image_url),
    ];

    // Only include selectedGame if it belongs to the games tab
    if (selectedGame) {
      paths.push(selectedGame.cover_image_url);
      // Add gallery images if available
      if (selectedGame.game_piece_gallery_images) {
        paths.push(
          ...selectedGame.game_piece_gallery_images.map((img) => img.image_url),
        );
      }
    }

    // Deduplicate and filter out null/http URLs
    const uniquePaths = Array.from(
      new Set(paths.filter((p): p is string => !!p && !p.startsWith("http"))),
    );

    return uniquePaths;
  }, [activeTab, gamePieces, selectedGame]);

  const { signedUrls: gameImageUrls } = useBatchStorageUrls(gameImagePaths);

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
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "games"
              ? "border-b-2 border-blue-500 bg-gray-100 dark:bg-gray-800"
              : "hover:bg-gray-50 dark:hover:bg-gray-900"
          }`}
          onClick={() => {
            setParams({
              "portfolio-tab": "games",
              "portfolio-piece": null,
            });
          }}
        >
          Games ({gamePieces.length})
        </button>
      </div>

      {/* Filters - Hide when viewing detail */}
      {!selectedArt && !selectedWriting && !selectedGame && (
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
        {activeTab === "art" && (
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
                      <StorageImage
                        src={selectedArt.image_url}
                        signedUrl={artImageUrls.get(selectedArt.image_url)}
                        alt={selectedArt.title}
                        className="max-h-[70vh] w-auto rounded-lg"
                        style={{ objectFit: "contain" }}
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
        )}
        {activeTab === "writing" && (
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
                      <StorageImage
                        src={selectedWriting.cover_image}
                        signedUrl={writingImageUrls.get(
                          selectedWriting.cover_image,
                        )}
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
                        <StorageImage
                          src={writing.cover_image}
                          signedUrl={writingImageUrls.get(writing.cover_image)}
                          alt={writing.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
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
        {activeTab === "games" && (
          <div className="space-y-4">
            {selectedGame ? (
              /* Game Detail View - Necrolist Style */
              <div className="space-y-0">
                <button
                  onClick={() => {
                    onNavigateToGallery?.();
                    setParams({
                      "portfolio-piece": null,
                    });
                  }}
                  className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
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
                  Back to Games List
                </button>

                <div className="overflow-hidden rounded-lg border border-gray-700">
                  {/* Hero Banner */}
                  {selectedGame.cover_image_url && (
                    <div className="relative aspect-video max-h-[450px] w-full overflow-hidden bg-gray-900">
                      <StorageImage
                        src={selectedGame.cover_image_url}
                        signedUrl={gameImageUrls.get(
                          selectedGame.cover_image_url,
                        )}
                        fill
                        alt={selectedGame.title}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
                    {/* Left Content - 3/5 width */}
                    <div className="lg:col-span-3">
                      {/* Title Section */}
                      <div className="border-b border-gray-800 p-8 pb-6">
                        <h1 className="mb-2 text-4xl font-bold tracking-wide text-white uppercase">
                          {selectedGame.title}
                        </h1>
                      </div>

                      {/* Description Content */}
                      <div className="px-8 py-4">
                        {selectedGame.description && (
                          <div className="space-y-4 text-sm leading-relaxed text-gray-300">
                            <MarkdownRenderer
                              content={selectedGame.description}
                            />
                          </div>
                        )}
                      </div>

                      {/* Play Game Button */}
                      {selectedGame.game_url && (
                        <div className="border-t border-gray-800 p-8">
                          <a
                            href={selectedGame.game_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full rounded-lg bg-white py-4 text-center text-lg font-bold tracking-wider text-black uppercase transition-colors hover:bg-gray-200"
                          >
                            PLAY GAME
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar - Gallery */}
                    <div className="flex flex-col border-l border-gray-800 lg:col-span-2">
                      {selectedGame.game_piece_gallery_images &&
                        selectedGame.game_piece_gallery_images.length > 0 && (
                          <div className="flex flex-col">
                            {selectedGame.game_piece_gallery_images
                              .sort(
                                (a, b) =>
                                  (a.display_order ?? 0) -
                                  (b.display_order ?? 0),
                              )
                              .map((img, index) => (
                                <div
                                  key={img.id}
                                  className="group relative overflow-hidden bg-gray-900"
                                  style={{
                                    aspectRatio: "16/10",
                                    borderBottom:
                                      index <
                                      (selectedGame.game_piece_gallery_images
                                        ?.length ?? 0) -
                                        1
                                        ? "1px solid rgb(31, 41, 55)"
                                        : "none",
                                  }}
                                >
                                  <StorageImage
                                    src={img.image_url}
                                    signedUrl={gameImageUrls.get(img.image_url)}
                                    alt={img.description || selectedGame.title}
                                    className="object-cover transition-transform group-hover:scale-105"
                                    fill
                                  />
                                  {img.description && (
                                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 to-transparent p-3">
                                      <p className="text-xs font-medium text-white">
                                        {img.description}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : gamePieces.length === 0 ? (
              /* Empty State */
              <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No games available yet.
                </p>
              </div>
            ) : (
              /* Games Grid View */
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gamePieces.map((game) => (
                  <div
                    key={game.id}
                    className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                    onClick={() =>
                      setParams({
                        "portfolio-piece": game.slug,
                      })
                    }
                  >
                    {game.cover_image_url && (
                      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <StorageImage
                          src={game.cover_image_url}
                          signedUrl={gameImageUrls.get(game.cover_image_url)}
                          alt={game.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                        {game.title}
                      </h3>
                      {game.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {game.description}
                        </p>
                      )}
                      {game.game_url && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
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
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Play Now
                        </div>
                      )}
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
