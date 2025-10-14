"use client";

import { useStoryTheme } from "@/contexts/StoryThemeContext";
import {
  type Character,
  getCharactersByWorldId,
  getFactionsByWorldId,
  getWorldsByStoryId,
  type Story,
  type World,
} from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Breadcrumbs from "./wiki/Breadcrumbs";
import CharacterView from "./wiki/CharacterView";
import ContentView from "./wiki/ContentView";
import StoriesView from "./wiki/StoriesView";
import WorldsView from "./wiki/WorldsView";

type ViewMode = "stories" | "worlds" | "content" | "character";

type WikiClientProps = {
  stories: Story[];
};

export default function WikiClient({
  stories: initialStories,
}: WikiClientProps) {
  const { setCurrentStory } = useStoryTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("stories");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(
    null,
  );

  // Worlds query
  const { data: worlds = [], isLoading: worldsLoading } = useQuery({
    queryKey: ["worlds", selectedStory?.id],
    queryFn: () =>
      selectedStory && viewMode === "worlds"
        ? getWorldsByStoryId(selectedStory.id)
        : [],
    enabled: !!selectedStory && viewMode === "worlds",
  });

  // Characters and factions query
  const {
    data: contentData = { characters: [], factions: [] },
    isLoading: contentLoading,
  } = useQuery({
    queryKey: ["content", selectedWorld?.id],
    queryFn: async () => {
      if (selectedWorld && viewMode === "content") {
        const [characters, factions] = await Promise.all([
          getCharactersByWorldId(selectedWorld.id),
          getFactionsByWorldId(selectedWorld.id),
        ]);
        return { characters, factions };
      }
      return { characters: [], factions: [] };
    },
    enabled: !!selectedWorld && viewMode === "content",
  });

  const loading = worldsLoading || contentLoading;

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setCurrentStory(story); // Apply theme
    setViewMode("worlds");
    setSelectedWorld(null);
    setViewingCharacter(null);
  };

  const handleWorldSelect = (world: World) => {
    setSelectedWorld(world);
    setViewMode("content");
    setViewingCharacter(null);
  };

  const handleCharacterSelect = (character: Character) => {
    setViewingCharacter(character);
    setViewMode("character");
  };

  const handleNavigate = (mode: ViewMode) => {
    if (mode === "stories") {
      setViewMode("stories");
      setSelectedStory(null);
      setSelectedWorld(null);
      setViewingCharacter(null);
    } else if (mode === "worlds") {
      setViewMode("worlds");
      setSelectedWorld(null);
      setViewingCharacter(null);
    } else if (mode === "content") {
      setViewMode("content");
      setViewingCharacter(null);
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

    return null;
  };

  return <>{renderContent()}</>;
}
