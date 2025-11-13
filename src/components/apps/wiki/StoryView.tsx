"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  type Character,
  type Faction,
  getCharactersByStorySlug,
  getFactionsByStorySlug,
  type Story,
  type World,
} from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";

type StoryViewProps = {
  story: Story;
  worlds: World[];
  onWorldSelect: (world: World) => void;
  onCharacterSelect: (character: Character) => void;
  onFactionSelect: (faction: Faction) => void;
};

export default function StoryView({
  story,
  worlds,
  onWorldSelect,
  onCharacterSelect,
  onFactionSelect,
}: StoryViewProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "story-tab",
    parseAsStringLiteral([
      "synopsis",
      "worlds",
      "characters",
      "factions",
    ] as const)
      .withDefault("synopsis")
      .withOptions({ history: "push", shallow: true }),
  );

  // Fetch all characters across all worlds in this story
  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ["story-characters", story.slug],
    queryFn: () => getCharactersByStorySlug(story.slug),
  });

  // Fetch all factions across all worlds in this story
  const { data: factions = [], isLoading: factionsLoading } = useQuery({
    queryKey: ["story-factions", story.slug],
    queryFn: () => getFactionsByStorySlug(story.slug),
  });

  // Batch fetch all character profile images at once
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const characterImagePaths = characters
    .map((c) => c.profile_image)
    .filter((path): path is string => !!path && !path.startsWith("http"));
  const { signedUrls: characterImageUrls, loading: imageUrlsLoading } =
    useBatchStorageUrls(characterImagePaths);

  // Batch fetch all faction logos at once
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const factionLogoPaths = factions
    .map((f) => f.logo_url)
    .filter((path): path is string => !!path && !path.startsWith("http"));
  const { signedUrls: factionLogoUrls, loading: logoUrlsLoading } =
    useBatchStorageUrls(factionLogoPaths);

  return (
    <div className="bg-theme-primary flex min-h-full flex-col">
      {/* Story Header with Banner */}
      {story.theme_background_image && (
        <div className="relative h-48 overflow-hidden">
          <StorageImage
            src={story.theme_background_image}
            alt={story.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/90" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h1 className="text-theme-primary mb-2 text-4xl font-bold drop-shadow-lg">
              {story.title}
            </h1>
            {story.summary && (
              <p className="text-theme-text text-lg drop-shadow-md">
                {story.summary}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header for stories without banner */}
      {!story.theme_background_image && (
        <div className="bg-theme-secondary p-6 backdrop-blur-sm">
          <h1 className="text-theme-text mb-2 text-4xl font-bold">
            {story.title}
          </h1>
          {story.summary && (
            <p className="text-theme-text text-lg">{story.summary}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-theme-secondary px-6">
        <div className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("synopsis")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "synopsis"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Synopsis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("worlds")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "worlds"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Worlds ({worlds.length})
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
            Characters ({charactersLoading ? "..." : characters.length})
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
            Factions ({factionsLoading ? "..." : factions.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Synopsis Tab */}
        {activeTab === "synopsis" && (
          <div className="animate-fadeIn mx-auto max-w-4xl">
            {story.content ? (
              <div className="prose prose-lg text-theme-text max-w-none">
                <MarkdownRenderer content={story.content} />
              </div>
            ) : (
              <div className="border-theme-text bg-theme-secondary rounded-xl border p-8 text-center shadow-sm">
                <p className="text-theme-text">
                  No synopsis available for this story yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Worlds Tab */}
        {activeTab === "worlds" && (
          <div className="animate-fadeIn">
            {worlds.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="text-theme-text bg-theme-secondary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                    <svg
                      className="text-theme-text h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <title>No worlds icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-theme-text mb-2 text-lg font-semibold">
                    No worlds yet
                  </h4>
                  <p className="text-theme-text">
                    This story doesn&apos;t have any worlds yet
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-theme-text grid grid-cols-1 gap-6 @lg:grid-cols-2">
                {worlds.map((world) => (
                  <button
                    key={world.id}
                    type="button"
                    onClick={() => onWorldSelect(world)}
                    className="group bg-theme-secondary relative overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* World Image/Gradient */}
                    <div className="text-theme-text bg-theme-secondary relative h-40 overflow-hidden">
                      {world.theme_background_image ? (
                        <StorageImage
                          src={world.theme_background_image}
                          alt={world.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h3 className="text-theme-text text-xl font-bold drop-shadow-lg">
                          {world.name}
                        </h3>
                      </div>
                    </div>

                    {/* World Info */}
                    <div className="p-4">
                      {world.summary && (
                        <p className="text-theme-text mb-3 line-clamp-3 text-sm">
                          {world.summary}
                        </p>
                      )}
                      <div className="text-theme-text flex items-center gap-2 text-xs">
                        {world.world_type && (
                          <span className="text-theme-text bg-theme-primary rounded-full px-2 py-1">
                            {world.world_type}
                          </span>
                        )}
                        {world.population && (
                          <span className="text-theme-text bg-theme-primary rounded-full px-2 py-1">
                            Pop: {world.population.toLocaleString()}
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

        {/* Characters Tab */}
        {activeTab === "characters" && (
          <div className="animate-fadeIn">
            {charactersLoading || imageUrlsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-theme-text font-medium">
                    {charactersLoading
                      ? "Loading characters..."
                      : "Loading images..."}
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
                  <h4 className="text-theme-text mb-2 text-lg font-semibold">
                    No characters yet
                  </h4>
                  <p className="text-theme-text">
                    This story doesn&apos;t have any characters yet
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
                    <div className="text-theme-text relative aspect-square overflow-hidden from-black/70 via-black/30 to-transparent">
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
                      <h3 className="text-theme-text group-hover:text-theme-text mb-1 truncate font-semibold">
                        {character.name}
                      </h3>
                      {character.nickname && (
                        <p className="text-theme-text group-hover:text-theme-text truncate text-xs">
                          {character.nickname}
                        </p>
                      )}
                      {character.species && (
                        <span className="text-theme-text bg-theme-primary group-hover:text-theme-text mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium">
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
            {factionsLoading || logoUrlsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-theme-text h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  <div className="text-theme-text font-medium">
                    {factionsLoading
                      ? "Loading factions..."
                      : "Loading logos..."}
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
                    This story doesn&apos;t have any factions yet
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
                        />
                      </div>
                    ) : (
                      <div className="text-theme-text bg-theme-secondary relative h-40">
                        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                          {faction.name.charAt(0)}
                        </div>
                      </div>
                    )}

                    {/* Faction Info */}
                    <div className="p-4">
                      <h3 className="text-theme-text group-hover:text-theme-text mb-2 text-xl font-bold">
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
      </div>
    </div>
  );
}
