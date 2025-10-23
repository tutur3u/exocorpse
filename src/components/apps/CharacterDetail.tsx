import Lightbox, { type LightboxContent } from "@/components/shared/Lightbox";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import type { Character } from "@/lib/actions/wiki";
import {
  getCharacterFactions,
  getCharacterGallery,
  getCharacterOutfits,
  getCharacterWorlds,
} from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

type CharacterDetailProps = {
  character: Character;
  onWorldClick?: (worldSlug: string) => void;
};

export default function CharacterDetail({
  character,
  onWorldClick,
}: CharacterDetailProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "outfits" | "lore" | "gallery"
  >("overview");
  const [lightboxContent, setLightboxContent] =
    useState<LightboxContent | null>(null);

  const { data: gallery = [], isLoading: galleryLoading } = useQuery({
    queryKey: ["character-gallery", character.id],
    queryFn: () => getCharacterGallery(character.id),
  });

  const { data: outfits = [], isLoading: outfitsLoading } = useQuery({
    queryKey: ["character-outfits", character.id],
    queryFn: () => getCharacterOutfits(character.id),
  });

  const { data: factions = [], isLoading: factionsLoading } = useQuery({
    queryKey: ["character-factions", character.id],
    queryFn: () => getCharacterFactions(character.id),
  });

  const { data: characterWorlds = [], isLoading: worldsLoading } = useQuery({
    queryKey: ["character-worlds", character.id],
    queryFn: () => getCharacterWorlds(character.id),
  });

  const loading =
    galleryLoading || outfitsLoading || factionsLoading || worldsLoading;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "outfits", label: `Outfits (${outfits.length})` },
    { id: "lore", label: "Lore & Backstory" },
    { id: "gallery", label: `Gallery (${gallery.length})` },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Banner Image - Only visible on larger screens */}
      <div
        className="relative hidden h-32 bg-cover bg-center lg:block"
        style={{
          backgroundImage: character.banner_image
            ? `url(${character.banner_image})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* Compact Header */}
      <div className="border-b bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg ring-2 ring-gray-200 dark:border-gray-800 dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700">
            {character.profile_image ? (
              <Image
                src={character.profile_image}
                alt={character.name}
                className="h-full w-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                {character.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Character Info */}
          <div className="min-w-0 flex-1">
            <h1 className="mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
              {character.name}
            </h1>
            {character.nickname && (
              <p className="mb-1 text-sm text-gray-600 italic dark:text-gray-400">
                &quot;{character.nickname}&quot;
              </p>
            )}
            {character.title && (
              <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                {character.title}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {character.age && (
                <span className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-2.5 py-1 font-medium text-white shadow-sm">
                  {character.age} years old
                </span>
              )}
              {character.status && (
                <span className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1 font-medium text-white capitalize shadow-sm">
                  {character.status}
                </span>
              )}
              {character.species && (
                <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-2.5 py-1 font-medium text-white shadow-sm">
                  {character.species}
                </span>
              )}
              {character.occupation && (
                <span className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-2.5 py-1 font-medium text-white shadow-sm">
                  {character.occupation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-gray-50/50 px-6 dark:border-gray-800 dark:bg-gray-900/30">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as "overview" | "outfits" | "lore" | "gallery",
                )
              }
              className={`relative rounded-t-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/30 p-6 dark:to-gray-900/30">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <div className="font-medium text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="animate-fadeIn space-y-4">
                {character.personality_summary && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></span>
                      Personality
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {character.personality_summary}
                    </p>
                  </div>
                )}

                {/* Physical Traits */}
                {(character.height ||
                  character.build ||
                  character.hair_color ||
                  character.eye_color) && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-green-600 to-emerald-600"></span>
                      Physical Traits
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {character.height && (
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                          <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Height
                          </span>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {character.height}
                          </p>
                        </div>
                      )}
                      {character.build && (
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                          <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Build
                          </span>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {character.build}
                          </p>
                        </div>
                      )}
                      {character.hair_color && (
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                          <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Hair
                          </span>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {character.hair_color}
                          </p>
                        </div>
                      )}
                      {character.eye_color && (
                        <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                          <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                            Eyes
                          </span>
                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {character.eye_color}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Worlds */}
                {characterWorlds.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-600 to-cyan-600"></span>
                      Worlds
                    </h3>
                    <div className="space-y-2">
                      {characterWorlds.map((cw) => {
                        const world = cw.worlds;
                        if (!world) return null;
                        return (
                          <button
                            key={cw.id}
                            type="button"
                            onClick={() => onWorldClick?.(world.slug)}
                            className="w-full rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-cyan-50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-indigo-800/30 dark:from-indigo-900/20 dark:to-cyan-900/20 dark:hover:border-indigo-700/50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {world.name}
                              </div>
                              <svg
                                className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <title>Go to world</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </div>
                            {world.summary && (
                              <div className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                                {world.summary}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Factions */}
                {factions.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-purple-600 to-pink-600"></span>
                      Affiliations
                    </h3>
                    <div className="space-y-2">
                      {factions.map((membership) => (
                        <div
                          key={membership.id}
                          className="rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20"
                        >
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {membership.factions?.name}
                          </div>
                          {membership.role && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                              {membership.role}
                              {membership.rank && ` • ${membership.rank}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills & Abilities */}
                {(character.skills || character.abilities) && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-yellow-600 to-orange-600"></span>
                      Skills & Abilities
                    </h3>
                    {character.skills && (
                      <div className="mb-3 rounded-lg border border-yellow-100 bg-yellow-50 p-3 dark:border-yellow-800/30 dark:bg-yellow-900/10">
                        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-yellow-900 uppercase dark:text-yellow-200">
                          Skills
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {character.skills}
                        </p>
                      </div>
                    )}
                    {character.abilities && (
                      <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 dark:border-orange-800/30 dark:bg-orange-900/10">
                        <h4 className="mb-1.5 text-xs font-semibold tracking-wide text-orange-900 uppercase dark:text-orange-200">
                          Abilities
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {character.abilities}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Outfits Tab */}
            {activeTab === "outfits" && (
              <div className="animate-fadeIn">
                {outfits.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>No outfits icon</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      No outfits added yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {outfits.map((outfit) => (
                      <div
                        key={outfit.id}
                        className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-800/50"
                      >
                        {outfit.image_url && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxContent({
                                imageUrl: outfit.image_url as string,
                                title: outfit.name,
                                description: outfit.description,
                              })
                            }
                            className="group relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
                          >
                            <Image
                              src={outfit.image_url}
                              alt={outfit.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              width={128}
                              height={128}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                              <svg
                                className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <title>View outfit details</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </div>
                          </button>
                        )}
                        <div className="p-4">
                          <h4 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {outfit.name}
                          </h4>
                          {outfit.description && (
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                              {outfit.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lore Tab */}
            {activeTab === "lore" && (
              <div className="animate-fadeIn space-y-4">
                {character.backstory && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-600 to-purple-600"></span>
                      Backstory
                    </h3>
                    <MarkdownRenderer content={character.backstory} />
                  </div>
                )}
                {character.lore && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-gradient-to-b from-purple-600 to-pink-600"></span>
                      Additional Lore
                    </h3>
                    <MarkdownRenderer content={character.lore} />
                  </div>
                )}
                {!character.backstory && !character.lore && (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>No lore icon</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      No lore or backstory added yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Gallery Tab */}
            {activeTab === "gallery" && (
              <div className="animate-fadeIn">
                {gallery.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>No gallery icon</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      No artwork added yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {gallery.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          setLightboxContent({
                            imageUrl: image.image_url,
                            title: image.title,
                            description: image.description,
                            footer: image.artist_name && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 font-medium text-white">
                                  Artist: {image.artist_name}
                                </span>
                              </div>
                            ),
                          })
                        }
                        className="group aspect-square overflow-hidden rounded-xl ring-2 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-500 dark:ring-gray-700"
                      >
                        <Image
                          src={image.thumbnail_url || image.image_url}
                          alt={image.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          width={128}
                          height={128}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        content={lightboxContent}
        onClose={() => setLightboxContent(null)}
      />
    </div>
  );
}
