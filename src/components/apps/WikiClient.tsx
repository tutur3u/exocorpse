"use client";

import { useStoryTheme } from "@/contexts/StoryThemeContext";
import type { InitialWikiData } from "@/app/page";
import {
  type Character,
  type Faction,
  getCharactersByWorldSlug,
  getFactionsByWorldSlug,
  getWorldsByStorySlug,
  type Story,
  type World,
} from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";
import Breadcrumbs from "./wiki/Breadcrumbs";
import CharacterView from "./wiki/CharacterView";
import ContentView from "./wiki/ContentView";
import FactionView from "./wiki/FactionView";
import StoriesView from "./wiki/StoriesView";
import WorldsView from "./wiki/WorldsView";

type ViewMode = "stories" | "worlds" | "content" | "character" | "faction";

type WikiClientProps = {
  stories: Story[];
  initialData: InitialWikiData;
};

export default function WikiClient({ stories, initialData }: WikiClientProps) {
  const { setCurrentStory } = useStoryTheme();

  // Use nuqs for URL state management
  const [params, setParams] = useQueryStates(
    {
      story: parseAsString,
      world: parseAsString,
      character: parseAsString,
      faction: parseAsString,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  const {
    story: storySlug,
    world: worldSlug,
    character: characterSlug,
    faction: factionSlug,
  } = params;

  // Determine view mode based on URL params
  const viewMode: ViewMode = characterSlug
    ? "character"
    : factionSlug
      ? "faction"
      : worldSlug
        ? "content"
        : storySlug
          ? "worlds"
          : "stories";

  // Find selected story from slug
  const selectedStory = storySlug
    ? stories.find((s) => s.slug === storySlug) || null
    : null;

  // Apply theme when story is selected
  useEffect(() => {
    if (selectedStory) {
      setCurrentStory(selectedStory);
    }
  }, [selectedStory, setCurrentStory]);

  // Worlds query - load when we have a story slug (needed for all subsequent views)
  // Use initialData only if current storySlug matches the initial params
  const shouldUseInitialWorlds =
    initialData.worlds.length > 0 && storySlug === initialData.params.story;

  const { data: worlds = [], isLoading: worldsLoading } = useQuery({
    queryKey: ["worlds", storySlug],
    queryFn: () =>
      storySlug ? getWorldsByStorySlug(storySlug) : Promise.resolve([]),
    enabled: !!storySlug,
    initialData: shouldUseInitialWorlds ? initialData.worlds : undefined,
  });

  // Find selected world from slug
  const selectedWorld = worldSlug
    ? worlds.find((w) => w.slug === worldSlug) || null
    : null;

  // Characters and factions query - load when we have world slug
  // Use initialData only if current params match the initial params
  const shouldUseInitialContent =
    (initialData.characters.length > 0 || initialData.factions.length > 0) &&
    storySlug === initialData.params.story &&
    worldSlug === initialData.params.world;

  const {
    data: contentData = { characters: [], factions: [] },
    isLoading: contentLoading,
  } = useQuery({
    queryKey: ["content", storySlug, worldSlug],
    queryFn: async () => {
      if (storySlug && worldSlug) {
        const [characters, factions] = await Promise.all([
          getCharactersByWorldSlug(storySlug, worldSlug),
          getFactionsByWorldSlug(storySlug, worldSlug),
        ]);
        return { characters, factions };
      }
      return { characters: [], factions: [] };
    },
    enabled: !!storySlug && !!worldSlug,
    initialData: shouldUseInitialContent
      ? {
          characters: initialData.characters,
          factions: initialData.factions,
        }
      : undefined,
  });

  // Find viewing character from slug
  const viewingCharacter = characterSlug
    ? contentData.characters.find((c) => c.slug === characterSlug) || null
    : null;

  // Find viewing faction from slug
  const viewingFaction = factionSlug
    ? contentData.factions.find((f) => f.slug === factionSlug) || null
    : null;

  const loading = worldsLoading || contentLoading;

  const handleStorySelect = (story: Story) => {
    setParams({
      story: story.slug,
      world: null,
      character: null,
      faction: null,
    });
  };

  const handleWorldSelect = (world: World) => {
    setParams({
      story: storySlug,
      world: world.slug,
      character: null,
      faction: null,
    });
  };

  const handleCharacterSelect = (character: Character) => {
    setParams({
      story: storySlug,
      world: worldSlug,
      character: character.slug,
      faction: null,
    });
  };

  const handleFactionSelect = (faction: Faction) => {
    setParams({
      story: storySlug,
      world: worldSlug,
      character: null,
      faction: faction.slug,
    });
  };

  const handleNavigate = (mode: ViewMode) => {
    if (mode === "stories") {
      setParams({
        story: null,
        world: null,
        character: null,
        faction: null,
      });
    } else if (mode === "worlds") {
      setParams({
        story: storySlug,
        world: null,
        character: null,
        faction: null,
      });
    } else if (mode === "content") {
      setParams({
        story: storySlug,
        world: worldSlug,
        character: null,
        faction: null,
      });
    }
  };

  // Render main content based on view mode
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      );
    }

    // Stories view
    if (viewMode === "stories") {
      return (
        <StoriesView stories={stories} onStorySelect={handleStorySelect} />
      );
    }

    // Worlds view
    if (viewMode === "worlds") {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              onNavigate={handleNavigate}
            />
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h3 className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
                  Worlds
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Dive into unique worlds and settings
                </p>
              </div>
            </div>
          </div>

          {worlds.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30">
                  <svg
                    className="h-10 w-10 text-indigo-600 dark:text-indigo-400"
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
                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No worlds yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This story doesn&apos;t have any worlds yet
                </p>
              </div>
            </div>
          ) : (
            <WorldsView worlds={worlds} onWorldSelect={handleWorldSelect} />
          )}
        </div>
      );
    }

    // Content view (characters and factions)
    if (viewMode === "content") {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              onNavigate={handleNavigate}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <h3 className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                  Characters & Factions
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Meet the inhabitants and organizations
                </p>
              </div>
            </div>
          </div>

          {contentData.characters.length === 0 &&
          contentData.factions.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-purple-100 dark:from-green-900/30 dark:to-purple-900/30">
                  <svg
                    className="h-10 w-10 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <title>No content icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No content yet
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This world doesn&apos;t have any characters or factions yet
                </p>
              </div>
            </div>
          ) : (
            <ContentView
              characters={contentData.characters}
              factions={contentData.factions}
              onCharacterSelect={handleCharacterSelect}
              onFactionSelect={handleFactionSelect}
            />
          )}
        </div>
      );
    }

    // Character view
    if (viewMode === "character" && viewingCharacter) {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              onNavigate={handleNavigate}
            />
          </div>
          <CharacterView character={viewingCharacter} />
        </div>
      );
    }

    // Faction view
    if (viewMode === "faction" && viewingFaction) {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              viewingFaction={viewingFaction}
              onNavigate={handleNavigate}
            />
          </div>
          <FactionView faction={viewingFaction} />
        </div>
      );
    }

    return null;
  };

  return <>{renderContent()}</>;
}
