"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { Character, Faction, Location, World } from "@/lib/actions/wiki";
import { parseAsStringLiteral, useQueryState } from "nuqs";

type WorldViewProps = {
  world: World;
  characters: Character[];
  factions: Faction[];
  locations: Location[];
  onCharacterSelect: (character: Character) => void;
  onFactionSelect: (faction: Faction) => void;
  onLocationSelect: (location: Location) => void;
};

export default function WorldView({
  world,
  characters,
  factions,
  locations,
  onCharacterSelect,
  onFactionSelect,
  onLocationSelect,
}: WorldViewProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "world-tab",
    parseAsStringLiteral([
      "overview",
      "characters",
      "factions",
      "locations",
    ] as const)
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

  // Batch fetch all location images
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const locationImagePaths = locations
    .map((l) => l.image_url)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: locationImageUrls, loading: locationImagesLoading } =
    useBatchStorageUrls(locationImagePaths);

  return (
    <div className="bg-theme-primary flex min-h-full flex-col">
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
            <h1 className="text-theme-primary mb-2 text-4xl font-bold drop-shadow-lg">
              {world.name}
            </h1>
            {world.summary && (
              <p className="text-theme-text text-lg drop-shadow-md">
                {world.summary}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header for worlds without banner */}
      {!world.theme_background_image && (
        <div className="bg-theme-secondary p-6 backdrop-blur-sm">
          <h1 className="text-theme-text mb-2 text-4xl font-bold">
            {world.name}
          </h1>
          {world.summary && (
            <p className="text-theme-text text-lg">{world.summary}</p>
          )}
          {/* World Info Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {world.world_type && (
              <span className="bg-theme-primary text-theme-text rounded-full px-3 py-1 text-sm font-medium">
                {world.world_type}
              </span>
            )}
            {world.population && (
              <span className="bg-theme-primary text-theme-text rounded-full px-3 py-1 text-sm font-medium">
                Population: {world.population.toLocaleString()}
              </span>
            )}
            {world.size && (
              <span className="bg-theme-primary text-theme-text rounded-full px-3 py-1 text-sm font-medium">
                Size: {world.size}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-theme-secondary px-6">
        <div className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("characters")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "characters"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Characters ({characters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("factions")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "factions"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Factions ({factions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("locations")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "locations"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Locations ({locations.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-fadeIn mx-auto max-w-4xl">
            {world.content ? (
              <div className="text-theme-text prose prose-lg max-w-none">
                <MarkdownRenderer content={world.content} />
              </div>
            ) : (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-8 text-center shadow-sm">
                <p className="text-theme-text">
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
                  <div className="text-theme-text h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <div className="text-theme-text font-medium">
                    Loading character images...
                  </div>
                </div>
              </div>
            ) : characters.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <svg
                      className="text-theme-text h-10 w-10"
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
              <div className="text-theme-text grid grid-cols-1 gap-4 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @xl:grid-cols-5 @2xl:grid-cols-6">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => onCharacterSelect(character)}
                    className="group bg-theme-secondary relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Character Image */}
                    <div className="text-theme-text bg-theme-secondary relative aspect-square overflow-hidden">
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
                            <div className="text-theme-text flex h-full w-full items-center justify-center text-6xl font-bold">
                              {character.name.charAt(0)}
                            </div>
                          }
                        />
                      ) : (
                        <div className="text-theme-text flex h-full w-full items-center justify-center text-6xl font-bold">
                          {character.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Character Info */}
                    <div className="p-3">
                      <h3 className="text-theme-text group-hover:text-theme-secondary mb-1 truncate font-semibold">
                        {character.name}
                      </h3>
                      {character.nickname && (
                        <p className="text-theme-text group-hover:text-theme-secondary truncate text-xs">
                          {character.nickname}
                        </p>
                      )}
                      {character.species && (
                        <span className="text-theme-text bg-theme-primary group-hover:text-theme-secondary mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium">
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
                  <div className="text-theme-text h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  <div className="text-theme-text font-medium">
                    Loading faction logos...
                  </div>
                </div>
              </div>
            ) : factions.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <svg
                      className="text-theme-text h-10 w-10"
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
                  <h4 className="text-theme-text mb-2 text-lg font-semibold">
                    No factions yet
                  </h4>
                  <p className="text-theme-text">
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
                    className="group bg-theme-secondary relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Faction Logo/Image */}
                    {faction.logo_url ? (
                      <div className="text-theme-text bg-theme-secondary relative h-40 overflow-hidden">
                        <StorageImage
                          src={faction.logo_url}
                          signedUrl={factionLogoUrls.get(faction.logo_url)}
                          alt={faction.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fallback={
                            <div className="text-theme-text flex h-full w-full items-center justify-center text-4xl font-bold">
                              {faction.name.charAt(0)}
                            </div>
                          }
                        />
                      </div>
                    ) : (
                      <div className="text-theme-text bg-theme-secondary relative h-40">
                        <div className="text-theme-text flex h-full w-full items-center justify-center text-4xl font-bold">
                          {faction.name.charAt(0)}
                        </div>
                      </div>
                    )}

                    {/* Faction Info */}
                    <div className="p-4">
                      <h3 className="text-theme-text group-hover:text-theme-secondary mb-2 text-xl font-bold">
                        {faction.name}
                      </h3>
                      {faction.summary && (
                        <p className="text-theme-text mb-3 line-clamp-3 text-sm">
                          {faction.summary}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {faction.faction_type && (
                          <span className="text-theme-text bg-theme-primary rounded-full px-2 py-1 font-medium">
                            {faction.faction_type}
                          </span>
                        )}
                        {faction.status && (
                          <span className="text-theme-text bg-theme-primary rounded-full px-2 py-1 font-medium">
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

        {/* Locations Tab */}
        {activeTab === "locations" && (
          <div className="animate-fadeIn">
            {locationImagesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-theme-text h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                  <div className="text-theme-text font-medium">
                    Loading location images...
                  </div>
                </div>
              </div>
            ) : locations.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <svg
                      className="text-theme-text h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>No locations icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-theme-text mb-2 text-lg font-semibold">
                    No locations yet
                  </h4>
                  <p className="text-theme-text">
                    This world doesn&apos;t have any locations yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 @lg:grid-cols-4">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => onLocationSelect(location)}
                    className="group bg-theme-secondary relative flex flex-col justify-between overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* Location Image */}
                    {location.image_url ? (
                      <div className="text-theme-text bg-theme-secondary relative h-48 overflow-hidden">
                        <StorageImage
                          src={location.image_url}
                          signedUrl={locationImageUrls.get(location.image_url)}
                          alt={location.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          fallback={
                            <div className="text-theme-text flex h-full w-full items-center justify-center text-4xl font-bold">
                              {location.name.charAt(0)}
                            </div>
                          }
                        />
                      </div>
                    ) : (
                      <div className="text-theme-text bg-theme-secondary relative h-48">
                        <div className="text-theme-text flex h-full w-full items-center justify-center text-4xl font-bold">
                          {location.name.charAt(0)}
                        </div>
                      </div>
                    )}

                    {/* Location Info */}
                    <div className="p-4">
                      <h3 className="text-theme-text group-hover:text-theme-secondary mb-2 text-xl font-bold">
                        {location.name}
                      </h3>
                      {location.summary && (
                        <p className="text-theme-text mb-3 line-clamp-3 text-sm">
                          {location.summary}
                        </p>
                      )}
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
