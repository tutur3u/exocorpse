"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { Character, Faction, World } from "@/lib/actions/wiki";
import { cn } from "@/lib/utils";
import { parseAsStringLiteral, useQueryState } from "nuqs";

type WorldViewProps = {
  world: World;
  characters: Character[];
  factions: Faction[];
  onCharacterSelect: (character: Character) => void;
  onFactionSelect: (faction: Faction) => void;
};

export default function WorldView({
  world,
  characters,
  factions,
  onCharacterSelect,
  onFactionSelect,
}: WorldViewProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "world-tab",
    parseAsStringLiteral(["overview", "characters", "factions"] as const)
      .withDefault("overview")
      .withOptions({ history: "push", shallow: true }),
  );

  // Batch fetch all character profile images
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const characterImagePaths = characters
    .map((c) => c.profile_image)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: characterImageUrls, loading: characterImagesLoading } =
    useBatchStorageUrls(characterImagePaths);

  // Batch fetch all faction logos
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const factionLogoPaths = factions
    .map((f) => f.logo_url)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: factionLogoUrls, loading: factionLogosLoading } =
    useBatchStorageUrls(factionLogoPaths);

  return (
    <div className="flex min-h-full flex-col bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* World Header with Banner */}
      {world.theme_background_image && (
        <div className="relative h-48 overflow-hidden">
          <StorageImage
            src={world.theme_background_image}
            alt={world.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/90" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">
              {world.name}
            </h1>
            {world.summary && (
              <p className="text-lg text-gray-200 drop-shadow-md">
                {world.summary}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header for worlds without banner */}
      {!world.theme_background_image && (
        <div className="border-b bg-white/50 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
          <h1 className="wiki-title mb-2 text-4xl font-bold">{world.name}</h1>
          {world.summary && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {world.summary}
            </p>
          )}
          {/* World Info Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {world.world_type && (
              <span className="wiki-badge-primary rounded-full px-3 py-1 text-sm font-medium">
                {world.world_type}
              </span>
            )}
            {world.population && (
              <span className="wiki-badge-secondary rounded-full px-3 py-1 text-sm font-medium">
                Population: {world.population.toLocaleString()}
              </span>
            )}
            {world.size && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                Size: {world.size}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b bg-gray-50/50 px-6 dark:border-gray-800 dark:bg-gray-900/30">
        <div className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === "overview"
                ? "wiki-tab-active bg-white shadow-sm dark:bg-gray-900"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200",
            )}
          >
            Overview
            {activeTab === "overview" && (
              <div className="wiki-tab-underline absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("characters")}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === "characters"
                ? "wiki-tab-active bg-white shadow-sm dark:bg-gray-900"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200",
            )}
          >
            Characters ({characters.length})
            {activeTab === "characters" && (
              <div className="wiki-tab-underline absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("factions")}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200",
              activeTab === "factions"
                ? "wiki-tab-active bg-white shadow-sm dark:bg-gray-900"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200",
            )}
          >
            Factions ({factions.length})
            {activeTab === "factions" && (
              <div className="wiki-tab-underline absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-fadeIn mx-auto max-w-4xl">
            {world.content ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <MarkdownRenderer content={world.content} />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                <p className="text-gray-500 dark:text-gray-400">
                  No overview available for this world yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === "characters" && (
          <div className="animate-fadeIn">
            {characterImagesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <div className="font-medium text-gray-500 dark:text-gray-400">
                    Loading character images...
                  </div>
                </div>
              </div>
            ) : characters.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-purple-100 dark:from-green-900/30 dark:to-purple-900/30">
                    <svg
                      className="h-10 w-10 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>No characters icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No characters yet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    This world doesn&apos;t have any characters yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @xl:grid-cols-5 @2xl:grid-cols-6">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => onCharacterSelect(character)}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Character Image */}
                    <div className="relative aspect-square overflow-hidden bg-linear-to-br from-blue-500 to-purple-600">
                      {character.profile_image ? (
                        <StorageImage
                          src={character.profile_image}
                          signedUrl={characterImageUrls.get(
                            character.profile_image,
                          )}
                          alt={character.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fallback={
                            <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-white">
                              {character.name.charAt(0)}
                            </div>
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-white">
                          {character.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Character Info */}
                    <div className="p-3">
                      <h3 className="mb-1 truncate font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                        {character.name}
                      </h3>
                      {character.title && (
                        <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                          {character.title}
                        </p>
                      )}
                      {character.species && (
                        <span className="mt-2 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {character.species}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Factions Tab */}
        {activeTab === "factions" && (
          <div className="animate-fadeIn">
            {factionLogosLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  <div className="font-medium text-gray-500 dark:text-gray-400">
                    Loading faction logos...
                  </div>
                </div>
              </div>
            ) : factions.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                    <svg
                      className="h-10 w-10 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>No factions icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    No factions yet
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    This world doesn&apos;t have any factions yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 @lg:grid-cols-2">
                {factions.map((faction) => (
                  <button
                    key={faction.id}
                    type="button"
                    onClick={() => onFactionSelect(faction)}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Faction Logo/Image */}
                    {faction.logo_url ? (
                      <div className="relative h-40 overflow-hidden bg-linear-to-br from-purple-500 via-pink-500 to-red-500">
                        <StorageImage
                          src={faction.logo_url}
                          signedUrl={factionLogoUrls.get(faction.logo_url)}
                          alt={faction.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fallback={
                            <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                              {faction.name.charAt(0)}
                            </div>
                          }
                        />
                      </div>
                    ) : (
                      <div
                        className="relative h-40 bg-linear-to-br from-purple-500 via-pink-500 to-red-500"
                        style={
                          faction.color_scheme
                            ? { background: faction.color_scheme }
                            : {}
                        }
                      >
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                          {faction.name.charAt(0)}
                        </div>
                      </div>
                    )}

                    {/* Faction Info */}
                    <div className="p-4">
                      <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
                        {faction.name}
                      </h3>
                      {faction.summary && (
                        <p className="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                          {faction.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {faction.faction_type && (
                          <span className="rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            {faction.faction_type}
                          </span>
                        )}
                        {faction.status && (
                          <span className="rounded-full bg-pink-100 px-2 py-1 font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                            {faction.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
