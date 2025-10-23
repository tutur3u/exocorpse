"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { type Character, type Faction, type World } from "@/lib/actions/wiki";
import Image from "next/image";
import { useState } from "react";

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
  const [activeTab, setActiveTab] = useState<
    "overview" | "characters" | "factions"
  >("overview");

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* World Header with Banner */}
      {world.theme_background_image && (
        <div
          className="relative h-48 bg-cover bg-center"
          style={{
            backgroundImage: `url(${world.theme_background_image})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/90" />
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
          <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">
            {world.name}
          </h1>
          {world.summary && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {world.summary}
            </p>
          )}
          {/* World Info Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {world.world_type && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {world.world_type}
              </span>
            )}
            {world.population && (
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
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
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`relative rounded-t-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("characters")}
            className={`relative rounded-t-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "characters"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            }`}
          >
            Characters ({characters.length})
            {activeTab === "characters" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("factions")}
            className={`relative rounded-t-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "factions"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            }`}
          >
            Factions ({factions.length})
            {activeTab === "factions" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
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
            {characters.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-purple-100 dark:from-green-900/30 dark:to-purple-900/30">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => onCharacterSelect(character)}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Character Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                      {character.profile_image ? (
                        <Image
                          src={character.profile_image}
                          alt={character.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
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
            {factions.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
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
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {factions.map((faction) => (
                  <button
                    key={faction.id}
                    type="button"
                    onClick={() => onFactionSelect(faction)}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Faction Logo/Image */}
                    {faction.logo_url ? (
                      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
                        <Image
                          src={faction.logo_url}
                          alt={faction.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div
                        className="relative h-40 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
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
