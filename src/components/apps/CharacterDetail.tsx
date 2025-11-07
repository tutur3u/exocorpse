"use client";

import Lightbox, { type LightboxContent } from "@/components/shared/Lightbox";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { useInitialWikiData } from "@/contexts/InitialWikiDataContext";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import type { Character } from "@/lib/actions/wiki";
import {
  getCharacterFactions,
  getCharacterGallery,
  getCharacterOutfits,
  getCharacterRelationships,
  getCharacterWorlds,
} from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState } from "react";

type CharacterDetailProps = {
  character: Character;
  onWorldClick?: (worldSlug: string) => void;
  onFactionClick?: (factionSlug: string) => void;
  onCharacterClick?: (characterSlug: string) => void;
};

export default function CharacterDetail({
  character,
  onWorldClick,
  onFactionClick,
  onCharacterClick,
}: CharacterDetailProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "character-tab",
    parseAsStringLiteral([
      "overview",
      "relationships",
      "outfits",
      "lore",
      "gallery",
    ] as const)
      .withDefault("overview")
      .withOptions({ history: "push", shallow: true }),
  );
  const [lightboxContent, setLightboxContent] =
    useState<LightboxContent | null>(null);

  const initialData = useInitialWikiData();
  const hasInitialDetailData =
    initialData.characterDetail?.characterId === character.id;

  const { data: gallery = [], isLoading: galleryLoading } = useQuery({
    queryKey: ["character-gallery", character.id],
    queryFn: () => getCharacterGallery(character.id),
    initialData: hasInitialDetailData
      ? initialData.characterDetail?.gallery
      : undefined,
  });

  const { data: outfits = [], isLoading: outfitsLoading } = useQuery({
    queryKey: ["character-outfits", character.id],
    queryFn: () => getCharacterOutfits(character.id),
    initialData: hasInitialDetailData
      ? initialData.characterDetail?.outfits
      : undefined,
  });

  const { data: factions = [], isLoading: factionsLoading } = useQuery({
    queryKey: ["character-factions", character.id],
    queryFn: () => getCharacterFactions(character.id),
    initialData: hasInitialDetailData
      ? initialData.characterDetail?.factions
      : undefined,
  });

  const { data: characterWorlds = [], isLoading: worldsLoading } = useQuery({
    queryKey: ["character-worlds", character.id],
    queryFn: () => getCharacterWorlds(character.id),
    initialData: hasInitialDetailData
      ? initialData.characterDetail?.worlds
      : undefined,
  });

  const { data: relationships = [], isLoading: relationshipsLoading } =
    useQuery({
      queryKey: ["character-relationships", character.id],
      queryFn: () => getCharacterRelationships(character.id),
      initialData: hasInitialDetailData
        ? initialData.characterDetail?.relationships
        : undefined,
    });

  // Batch fetch signed URLs for gallery and outfit images
  const imagePaths = [
    ...gallery.map((item) => item.image_url),
    ...outfits
      .map((outfit) => outfit.image_url)
      .filter((url): url is string => !!url),
  ].filter((p): p is string => !!p && !p.startsWith("http"));

  const { signedUrls: imageUrls } = useBatchStorageUrls(imagePaths);

  // Only show loading if we're fetching AND don't have any data yet
  const loading =
    (galleryLoading && gallery.length === 0) ||
    (outfitsLoading && outfits.length === 0) ||
    (factionsLoading && factions.length === 0) ||
    (worldsLoading && characterWorlds.length === 0) ||
    (relationshipsLoading && relationships.length === 0);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "outfits", label: `Outfits (${outfits.length})` },
    { id: "lore", label: "Story & Relationships" },
    { id: "gallery", label: `Gallery (${gallery.length})` },
  ];

  return (
    <div className="flex min-h-full flex-col bg-white dark:bg-gray-900">
      {/* Banner Image - Only visible on larger screens */}
      <div className="relative hidden h-64 overflow-hidden @lg:block">
        {character.banner_image ? (
          <>
            <StorageImage
              src={character.banner_image}
              alt={`${character.name} banner`}
              className="h-full w-full object-cover"
              width={1200}
              height={128}
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
          </>
        ) : (
          <>
            <div className="h-full w-full bg-linear-to-r from-indigo-400 via-purple-500 to-pink-500" />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60" />
          </>
        )}
      </div>

      {/* Compact Header */}
      <div className="border-b bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
        <div className="flex items-center gap-4 @md:gap-6">
          {/* Profile Image */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white bg-linear-to-br from-gray-200 to-gray-300 shadow-lg ring-2 ring-gray-200 @md:h-24 @md:w-24 @lg:h-32 @lg:w-32 @xl:h-40 @xl:w-40 dark:border-gray-800 dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700">
            {character.profile_image ? (
              <StorageImage
                src={character.profile_image}
                alt={character.name}
                className="h-full w-full object-cover"
                width={160}
                height={160}
                fallback={
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white @md:text-4xl @lg:text-5xl @xl:text-6xl">
                    {character.name.charAt(0)}
                  </div>
                }
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white @md:text-4xl @lg:text-5xl @xl:text-6xl">
                {character.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Character Info */}
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-300">
                {character.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-1.5 text-sm text-gray-300 italic">
              {character.nickname && (
                <span className="">"{character.nickname}"</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {character.age && (
                <span className="rounded-full bg-linear-to-r from-blue-500 to-blue-600 px-2.5 py-1 font-medium text-white shadow-sm">
                  {character.age} years old
                </span>
              )}
              {character.status && (
                <span className="rounded-full bg-linear-to-r from-green-500 to-emerald-600 px-2.5 py-1 font-medium text-white capitalize shadow-sm">
                  {character.status}
                </span>
              )}
              {character.species && (
                <span className="rounded-full bg-linear-to-r from-purple-500 to-purple-600 px-2.5 py-1 font-medium text-white shadow-sm">
                  {character.species}
                </span>
              )}
              {character.occupation && (
                <span className="rounded-full bg-linear-to-r from-yellow-500 to-orange-500 px-2.5 py-1 font-medium text-white shadow-sm">
                  {character.occupation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-gray-50/50 px-6 dark:border-gray-800 dark:bg-gray-900/30">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "overview"
                    | "relationships"
                    | "outfits"
                    | "lore"
                    | "gallery",
                )
              }
              className={`relative shrink-0 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                  : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-linear-to-r from-blue-600 to-purple-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-linear-to-b from-transparent to-gray-50/30 p-6 dark:to-gray-900/30">
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
                <div className="grid grid-cols-1 items-center justify-center gap-4 md:grid-cols-3">
                  {character.featured_image && (
                    <div className="relative col-span-1 flex aspect-square w-full md:col-start-3 md:row-start-1">
                      <StorageImage
                        src={character.featured_image}
                        alt={`${character.name} featured`}
                        fill
                      />
                    </div>
                  )}
                  {character.description && (
                    <div className="col-span-1 grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2 md:col-start-1 md:row-start-1 dark:border-gray-800 dark:bg-gray-800/50">
                      {character.quote && (
                        <blockquote className="ml-4 text-xl italic">
                          "{character.quote}"
                        </blockquote>
                      )}
                      <MarkdownRenderer content={character.description} />
                      {/* Physical Traits */}
                      {(character.height ||
                        character.build ||
                        character.hair_color ||
                        character.eye_color ||
                        character.weight ||
                        character.pronouns ||
                        character.gender ||
                        character.skin_tone ||
                        character.distinguishing_features) && (
                        <div className="">
                          <div className="grid grid-cols-2 gap-3">
                            {(character.height || character.weight) && (
                              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                                <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                  {[
                                    character.height && "Height",
                                    character.weight && "Weight",
                                  ]
                                    .filter(Boolean)
                                    .join(" & ")}
                                </span>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {[character.height, character.weight]
                                    .filter(Boolean)
                                    .join(" / ")}
                                </p>
                              </div>
                            )}
                            {(character.gender || character.pronouns) && (
                              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                                <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                  {[
                                    character.gender && "Gender",
                                    character.pronouns && "Pronouns",
                                  ]
                                    .filter(Boolean)
                                    .join(" & ")}
                                </span>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {[character.gender, character.pronouns]
                                    .filter(Boolean)
                                    .join(" - ")}
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
                            {character.skin_tone && (
                              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                                <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                  Skin Tone
                                </span>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {character.skin_tone}
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
                            {character.distinguishing_features && (
                              <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-900/50">
                                <span className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                  Distinguishing Features
                                </span>
                                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {character.distinguishing_features}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {character.personality_summary && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-linear-to-b from-pink-600 to-red-600"></span>
                      Personality
                    </h3>
                    <MarkdownRenderer content={character.personality_summary} />
                  </div>
                )}

                {/* Worlds and Factions Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Worlds */}
                  {characterWorlds.length > 0 && (
                    <div
                      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 ${factions.length > 0 ? "col-span-1" : "col-span-2"}`}
                    >
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                        <span className="h-5 w-1 rounded-full bg-linear-to-b from-indigo-600 to-cyan-600"></span>
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
                              className="w-full rounded-lg border border-indigo-100 bg-linear-to-r from-indigo-50 to-cyan-50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-indigo-800/30 dark:from-indigo-900/20 dark:to-cyan-900/20 dark:hover:border-indigo-700/50"
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
                    <div
                      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50 ${characterWorlds.length > 0 ? "col-span-1" : "col-span-2"}`}
                    >
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                        <span className="h-5 w-1 rounded-full bg-linear-to-b from-purple-600 to-pink-600"></span>
                        Affiliations
                      </h3>
                      <div className="space-y-2">
                        {factions.map((membership) => (
                          <button
                            key={membership.id}
                            type="button"
                            onClick={() =>
                              onFactionClick?.(membership.factions?.slug || "")
                            }
                            className="w-full rounded-lg border border-purple-100 bg-linear-to-r from-purple-50 to-pink-50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20 dark:hover:border-purple-700/50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {membership.factions?.name}
                              </div>
                              <svg
                                className="h-4 w-4 text-purple-600 dark:text-purple-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <title>Go to faction</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                              </svg>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {membership.role && (
                                <span className="inline-block rounded-full bg-purple-200 px-2 py-0.5 text-xs font-medium text-purple-900 dark:bg-purple-800/40 dark:text-purple-200">
                                  {membership.role}
                                </span>
                              )}
                              {membership.rank && (
                                <span className="inline-block rounded-full bg-indigo-200 px-2 py-0.5 text-xs font-medium text-indigo-900 dark:bg-indigo-800/40 dark:text-indigo-200">
                                  {membership.rank}
                                </span>
                              )}
                              {membership.is_current !== null && (
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                    membership.is_current
                                      ? "bg-green-200 text-green-900 dark:bg-green-800/40 dark:text-green-200"
                                      : "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {membership.is_current ? "Current" : "Former"}
                                </span>
                              )}
                            </div>
                            {(membership.join_date ||
                              membership.leave_date) && (
                              <div className="mt-1.5 text-xs text-gray-600 dark:text-gray-500">
                                {membership.join_date && (
                                  <span>Joined {membership.join_date}</span>
                                )}
                                {membership.join_date &&
                                  membership.leave_date && <span> • </span>}
                                {membership.leave_date && (
                                  <span>Left {membership.leave_date}</span>
                                )}
                              </div>
                            )}
                            {membership.notes && (
                              <div className="mt-1 text-xs text-gray-600 italic dark:text-gray-500">
                                {membership.notes}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills & Abilities */}
                {character.abilities && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-linear-to-b from-yellow-600 to-orange-600"></span>
                      Skills & Abilities
                    </h3>
                    <MarkdownRenderer content={character.abilities} />
                  </div>
                )}
              </div>
            )}

            {/* Outfits Tab */}
            {activeTab === "outfits" && (
              <div className="animate-fadeIn">
                {/* Color Palette Display */}
                {character.color_palette &&
                  character.color_palette.length > 0 && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-linear-to-r from-gray-50 to-gray-100 p-2 sm:p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                      <h3 className="mb-3 text-xs font-semibold text-gray-700 sm:text-sm dark:text-gray-300">
                        Color Palette
                      </h3>
                      <div className="flex flex-wrap justify-between gap-1.5 sm:gap-2">
                        {character.color_palette.map((color, index) => (
                          <div
                            key={index}
                            className="group relative flex min-w-0 flex-1 items-center sm:flex-auto"
                          >
                            <div
                              className="h-8 w-full cursor-pointer rounded-lg border border-black shadow-sm transition-all sm:w-50"
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                navigator.clipboard.writeText(color);
                              }}
                            />
                            {/* Tooltip */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700">
                              {color}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                  <div className="grid grid-cols-1 gap-4 @md:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
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
                                signedUrl: imageUrls.get(
                                  outfit.image_url as string,
                                ),
                              })
                            }
                            className="group relative h-56 w-full overflow-hidden bg-gray-100 dark:bg-gray-800"
                          >
                            <StorageImage
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

                {character.fanwork_policy && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-linear-to-r from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50">
                    <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Fanwork Policy
                    </h3>
                    <MarkdownRenderer content={character.fanwork_policy} />
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
                      <span className="h-5 w-1 rounded-full bg-linear-to-b from-indigo-600 to-purple-600"></span>
                      Backstory
                    </h3>
                    <MarkdownRenderer content={character.backstory} />
                  </div>
                )}
                {character.lore && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                      <span className="h-5 w-1 rounded-full bg-linear-to-b from-purple-600 to-pink-600"></span>
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
                {relationships.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <title>No relationships icon</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-500 dark:text-gray-400">
                      No relationships documented yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                      <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
                        <span className="h-5 w-1 rounded-full bg-linear-to-b from-indigo-600 to-purple-600"></span>
                        Relationships{" "}
                        {relationships.length > 0 &&
                          `(${relationships.length})`}
                      </h3>
                      {relationships.map((relationship) => {
                        const relatedCharacter = relationship.related_character;
                        const relType = relationship.relationship_type;

                        return (
                          <button
                            key={relationship.id}
                            onClick={() =>
                              onCharacterClick?.(relatedCharacter?.slug || "")
                            }
                            className="w-full cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-gray-700"
                          >
                            <div className="flex items-start gap-4 p-4">
                              {/* Character Profile Image */}
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                {relatedCharacter?.profile_image ? (
                                  <StorageImage
                                    src={relatedCharacter.profile_image}
                                    alt={relatedCharacter.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    fallback={
                                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                                        {relatedCharacter.name.charAt(0)}
                                      </div>
                                    }
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <svg
                                      className="h-8 w-8 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <title>Character icon</title>
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Relationship Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                      {relatedCharacter.name}
                                    </h4>
                                    {relatedCharacter.title && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {relatedCharacter.title}
                                      </p>
                                    )}
                                  </div>
                                  {/* Character metadata badges */}
                                  <div className="flex shrink-0 gap-1.5 text-xs">
                                    {relatedCharacter.age && (
                                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                        {relatedCharacter.age}
                                      </span>
                                    )}
                                    {relatedCharacter.species && (
                                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                        {relatedCharacter.species}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
                                    {relType.name}
                                  </span>
                                  {relType.is_mutual && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      (mutual)
                                    </span>
                                  )}
                                </div>

                                {relationship.description && (
                                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    {relationship.description}
                                  </p>
                                )}

                                {relatedCharacter.personality_summary && (
                                  <p className="mt-2 line-clamp-2 text-xs text-gray-500 italic dark:text-gray-500">
                                    {relatedCharacter.personality_summary}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
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
                  <div className="grid grid-cols-2 gap-4 @md:grid-cols-3 @lg:grid-cols-4 @xl:grid-cols-5">
                    {gallery.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          setLightboxContent({
                            imageUrl: image.image_url,
                            title: image.title,
                            description: image.description,
                            signedUrl: imageUrls.get(image.image_url),
                            footer: image.artist_name && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="rounded-full bg-linear-to-r from-blue-500 to-purple-600 px-3 py-1 font-medium text-white">
                                  Artist: {image.artist_name}
                                </span>
                              </div>
                            ),
                          })
                        }
                        className="group aspect-square overflow-hidden rounded-xl ring-2 ring-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-500 dark:ring-gray-700"
                      >
                        <StorageImage
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
