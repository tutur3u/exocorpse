"use client";

import type { InitialWikiData } from "@/contexts/InitialWikiDataContext";
import { useStoryTheme } from "@/contexts/StoryThemeContext";
import {
  type Character,
  type Faction,
  getCharacterBySlugInStory,
  getCharactersByWorldSlug,
  getFactionBySlugInStory,
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
import FactionView from "./wiki/FactionView";
import StoriesView from "./wiki/StoriesView";
import StoryView from "./wiki/StoryView";
import WorldView from "./wiki/WorldView";

type ViewMode = "stories" | "story" | "world" | "character" | "faction";

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
      "story-tab": parseAsString,
      "world-tab": parseAsString,
      "character-tab": parseAsString,
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
        ? "world"
        : storySlug
          ? "story"
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

  // Worlds query - load when we have a story slug
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

  // Characters query for world view - load when we have world slug
  const shouldUseInitialCharacters =
    initialData.characters.length > 0 &&
    storySlug === initialData.params.story &&
    worldSlug === initialData.params.world;

  const { data: worldCharacters = [], isLoading: charactersLoading } = useQuery(
    {
      queryKey: ["world-characters", storySlug, worldSlug],
      queryFn: async () => {
        if (storySlug && worldSlug) {
          return getCharactersByWorldSlug(storySlug, worldSlug);
        }
        return [];
      },
      enabled: !!storySlug && !!worldSlug,
      initialData: shouldUseInitialCharacters
        ? initialData.characters
        : undefined,
    },
  );

  // Factions query for world view - load when we have world slug
  const shouldUseInitialFactions =
    initialData.factions.length > 0 &&
    storySlug === initialData.params.story &&
    worldSlug === initialData.params.world;

  const { data: worldFactions = [], isLoading: factionsLoading } = useQuery({
    queryKey: ["world-factions", storySlug, worldSlug],
    queryFn: async () => {
      if (storySlug && worldSlug) {
        return getFactionsByWorldSlug(storySlug, worldSlug);
      }
      return [];
    },
    enabled: !!storySlug && !!worldSlug,
    initialData: shouldUseInitialFactions ? initialData.factions : undefined,
  });

  // Find viewing faction from slug
  // If faction is specified without world, fetch it to get the world info
  const { data: factionWithWorld, isLoading: factionWithWorldLoading } =
    useQuery({
      queryKey: ["faction-with-world", storySlug, factionSlug],
      queryFn: async () => {
        if (storySlug && factionSlug && !worldSlug) {
          return getFactionBySlugInStory(storySlug, factionSlug);
        }
        return null;
      },
      enabled: !!storySlug && !!factionSlug && !worldSlug,
    });

  // Auto-redirect to include world slug if faction is accessed without it
  useEffect(() => {
    if (
      factionWithWorld &&
      factionSlug &&
      !worldSlug &&
      (factionWithWorld as { worlds?: World }).worlds
    ) {
      const world = (factionWithWorld as { worlds: World }).worlds;
      setParams({
        story: storySlug,
        world: world.slug,
        character: null,
        faction: factionSlug,
      });
    }
  }, [factionWithWorld, factionSlug, worldSlug, storySlug, setParams]);

  // Character query for story view (without world)
  // If character is specified without world, fetch it
  const { data: characterWithWorlds, isLoading: characterWithWorldsLoading } =
    useQuery({
      queryKey: ["character-with-worlds", storySlug, characterSlug],
      queryFn: async () => {
        if (storySlug && characterSlug && !worldSlug) {
          return getCharacterBySlugInStory(storySlug, characterSlug);
        }
        return null;
      },
      enabled: !!storySlug && !!characterSlug && !worldSlug,
    });

  // Note: We could optionally auto-redirect character to a specific world,
  // but unlike faction, we'll allow character to be viewed without world
  // since characters can exist in multiple worlds and the view should show that

  // Find viewing character from slug
  let viewingCharacter: Character | null = characterSlug
    ? worldCharacters.find((c) => c.slug === characterSlug) || null
    : null;

  // If no world is selected and we have a character, use the character from story-level fetch
  if (!worldSlug && characterSlug && !viewingCharacter && characterWithWorlds) {
    viewingCharacter = characterWithWorlds as Character;
  }

  const viewingFaction = factionSlug
    ? worldFactions.find((f) => f.slug === factionSlug) || null
    : null;

  // Only show loading if we're actually fetching and don't have the core data needed for the current view
  // Character/faction detail views will handle their own loading states for additional data
  const loading =
    (viewMode === "story" && worldsLoading && worlds.length === 0) ||
    (viewMode === "world" &&
      ((charactersLoading && worldCharacters.length === 0) ||
        (factionsLoading && worldFactions.length === 0))) ||
    (viewMode === "character" &&
      !viewingCharacter &&
      (characterWithWorldsLoading || (charactersLoading && worldSlug))) ||
    (viewMode === "faction" &&
      !viewingFaction &&
      (factionWithWorldLoading || (factionsLoading && worldSlug)));

  const handleStorySelect = (story: Story) => {
    setParams({
      story: story.slug,
      world: null,
      character: null,
      faction: null,
      "story-tab": null,
      "world-tab": null,
      "character-tab": null,
    });
  };

  const handleWorldSelect = (world: World) => {
    setParams({
      story: storySlug,
      world: world.slug,
      character: null,
      faction: null,
      "world-tab": null,
      "character-tab": null,
    });
  };

  const handleCharacterSelect = (character: Character) => {
    setParams({
      story: storySlug,
      world: worldSlug,
      character: character.slug,
      faction: null,
      "character-tab": null,
    });
  };

  const handleFactionSelect = (faction: Faction) => {
    setParams({
      story: storySlug,
      world: worldSlug,
      character: null,
      faction: faction.slug,
      "character-tab": null,
    });
  };

  const handleWorldClickFromCharacter = (worldSlug: string) => {
    setParams({
      story: storySlug,
      world: worldSlug,
      character: null,
      faction: null,
      "world-tab": null,
      "character-tab": null,
    });
  };

  const handleFactionClickFromCharacter = (factionSlug: string) => {
    setParams({
      story: storySlug,
      world: worldSlug,
      character: null,
      faction: factionSlug,
      "character-tab": null,
    });
  };

  const handleNavigate = (mode: ViewMode) => {
    if (mode === "stories") {
      setParams({
        story: null,
        world: null,
        character: null,
        faction: null,
        "story-tab": null,
        "world-tab": null,
        "character-tab": null,
      });
    } else if (mode === "story") {
      setParams({
        story: storySlug,
        world: null,
        character: null,
        faction: null,
        "world-tab": null,
        "character-tab": null,
      });
    } else if (mode === "world") {
      setParams({
        story: storySlug,
        world: worldSlug,
        character: null,
        faction: null,
        "character-tab": null,
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

    // Story view with tabs
    if (viewMode === "story" && selectedStory) {
      return (
        <div className="flex min-h-full flex-col bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              onNavigate={handleNavigate}
            />
          </div>
          <StoryView
            story={selectedStory}
            worlds={worlds}
            onWorldSelect={handleWorldSelect}
            onCharacterSelect={handleCharacterSelect}
            onFactionSelect={handleFactionSelect}
          />
        </div>
      );
    }

    // World view with tabs
    if (viewMode === "world" && selectedWorld) {
      return (
        <div className="flex min-h-full flex-col bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              onNavigate={handleNavigate}
            />
          </div>
          <WorldView
            world={selectedWorld}
            characters={worldCharacters}
            factions={worldFactions}
            onCharacterSelect={handleCharacterSelect}
            onFactionSelect={handleFactionSelect}
          />
        </div>
      );
    }

    // Character view
    if (viewMode === "character" && viewingCharacter) {
      return (
        <div className="flex min-h-full flex-col bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <Breadcrumbs
              viewMode={viewMode}
              selectedStory={selectedStory}
              selectedWorld={selectedWorld}
              viewingCharacter={viewingCharacter}
              onNavigate={handleNavigate}
            />
          </div>
          <CharacterView
            character={viewingCharacter}
            onWorldClick={handleWorldClickFromCharacter}
            onFactionClick={handleFactionClickFromCharacter}
          />
        </div>
      );
    }

    // Faction view
    if (viewMode === "faction" && viewingFaction) {
      return (
        <div className="flex min-h-full flex-col bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
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

  return (
    <div className="@container h-full overflow-auto">{renderContent()}</div>
  );
}
