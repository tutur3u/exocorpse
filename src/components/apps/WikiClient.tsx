"use client";

import ListDetail, { type ListDetailItem } from "@/components/ListDetail";
import { useStoryTheme } from "@/contexts/StoryThemeContext";
import {
  addCharacterToFaction,
  type Character,
  createCharacter,
  createFaction,
  createStory,
  createWorld,
  deleteCharacter,
  deleteFaction,
  deleteStory,
  deleteWorld,
  type Faction,
  getCharacterFactions,
  getCharactersByWorldId,
  getFactionMembers,
  getFactionsByWorldId,
  getWorldsByStoryId,
  removeCharacterFromFaction,
  type Story,
  updateCharacter,
  updateFaction,
  updateStory,
  updateWorld,
  type World,
} from "@/lib/actions/wiki";
import { useEffect, useState } from "react";
import CharacterDetailModal from "./CharacterDetailModal";
import FactionManager from "./FactionManager";
import CharacterForm from "./forms/CharacterForm";
import FactionForm from "./forms/FactionForm";
import StoryForm from "./forms/StoryForm";
import WorldForm from "./forms/WorldForm";

type ViewMode = "stories" | "worlds" | "content";

type ContentData = {
  characters: Character[];
  factions: Faction[];
};

type WikiClientProps = {
  stories: Story[];
};

export default function WikiClient({
  stories: initialStories,
}: WikiClientProps) {
  const { setCurrentStory } = useStoryTheme();
  const [stories, setStories] = useState(initialStories);
  const [viewMode, setViewMode] = useState<ViewMode>("stories");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [contentData, setContentData] = useState<ContentData>({
    characters: [],
    factions: [],
  });
  const [loading, setLoading] = useState(false);
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(
    null,
  );

  // Form states
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showWorldForm, setShowWorldForm] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showFactionForm, setShowFactionForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);

  // Faction management states
  const [showFactionManager, setShowFactionManager] = useState(false);
  const [managingEntity, setManagingEntity] = useState<{
    type: "character" | "faction";
    id: string;
    name: string;
  } | null>(null);
  const [entityMemberships, setEntityMemberships] = useState<any[]>([]);

  // Fetch worlds when a story is selected
  useEffect(() => {
    if (selectedStory && viewMode === "worlds") {
      setLoading(true);
      getWorldsByStoryId(selectedStory.id)
        .then((data) => {
          setWorlds(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading worlds:", error);
          setLoading(false);
        });
    }
  }, [selectedStory, viewMode]);

  // Fetch characters and factions when a world is selected
  useEffect(() => {
    if (selectedWorld && viewMode === "content") {
      setLoading(true);
      Promise.all([
        getCharactersByWorldId(selectedWorld.id),
        getFactionsByWorldId(selectedWorld.id),
      ])
        .then(([characters, factions]) => {
          setContentData({ characters, factions });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error loading content:", error);
          setLoading(false);
        });
    }
  }, [selectedWorld, viewMode]);

  // Story items for ListDetail
  const storyItems: Array<ListDetailItem<string, Story>> = stories.map(
    (story) => ({
      id: story.id,
      title: story.title,
      subtitle: story.summary || undefined,
      data: story,
    }),
  );

  // World items for ListDetail
  const worldItems: Array<ListDetailItem<string, World>> = worlds.map(
    (world) => ({
      id: world.id,
      title: world.name,
      subtitle: world.summary || undefined,
      data: world,
    }),
  );

  // Combined content items (characters and factions)
  const contentItems: Array<
    ListDetailItem<
      string,
      (Character | Faction) & { type: "character" | "faction" }
    >
  > = [
    ...contentData.characters.map((char) => ({
      id: char.id,
      title: char.name,
      subtitle: char.nickname || "Character",
      data: { ...char, type: "character" as const },
    })),
    ...contentData.factions.map((faction) => ({
      id: faction.id,
      title: faction.name,
      subtitle: faction.summary || "Faction",
      data: { ...faction, type: "faction" as const },
    })),
  ];

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setCurrentStory(story); // Apply theme
    setViewMode("worlds");
    setSelectedWorld(null);
  };

  const handleWorldSelect = (world: World) => {
    setSelectedWorld(world);
    setViewMode("content");
  };

  // CRUD Handlers
  const handleCreateStory = async (data: {
    title: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => {
    const newStory = await createStory(data);
    setStories([newStory, ...stories]);
    setShowStoryForm(false);
  };

  const handleUpdateStory = async (data: {
    title: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => {
    if (!editingStory) return;
    const updated = await updateStory(editingStory.id, data);
    setStories(stories.map((s) => (s.id === updated.id ? updated : s)));
    setEditingStory(null);
    setShowStoryForm(false);
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    await deleteStory(id);
    setStories(stories.filter((s) => s.id !== id));
  };

  const handleCreateWorld = async (data: {
    story_id: string;
    name: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => {
    const newWorld = await createWorld(data);
    setWorlds([newWorld, ...worlds]);
    setShowWorldForm(false);
  };

  const handleUpdateWorld = async (data: {
    story_id: string;
    name: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => {
    if (!editingWorld) return;
    const updated = await updateWorld(editingWorld.id, data);
    setWorlds(worlds.map((w) => (w.id === updated.id ? updated : w)));
    setEditingWorld(null);
    setShowWorldForm(false);
  };

  const handleDeleteWorld = async (id: string) => {
    if (!confirm("Are you sure you want to delete this world?")) return;
    await deleteWorld(id);
    setWorlds(worlds.filter((w) => w.id !== id));
  };

  const handleCreateCharacter = async (data: {
    world_id: string;
    name: string;
    slug: string;
    nickname?: string;
    personality_summary?: string;
  }) => {
    const newChar = await createCharacter(data);
    setContentData({
      ...contentData,
      characters: [newChar, ...contentData.characters],
    });
    setShowCharacterForm(false);
  };

  const handleUpdateCharacter = async (data: {
    world_id: string;
    name: string;
    slug: string;
    nickname?: string;
    personality_summary?: string;
  }) => {
    if (!editingCharacter) return;
    const updated = await updateCharacter(editingCharacter.id, data);
    setContentData({
      ...contentData,
      characters: contentData.characters.map((c) =>
        c.id === updated.id ? updated : c,
      ),
    });
    setEditingCharacter(null);
    setShowCharacterForm(false);
  };

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character?")) return;
    await deleteCharacter(id);
    setContentData({
      ...contentData,
      characters: contentData.characters.filter((c) => c.id !== id),
    });
  };

  const handleCreateFaction = async (data: {
    world_id: string;
    name: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => {
    const newFaction = await createFaction(data);
    setContentData({
      ...contentData,
      factions: [newFaction, ...contentData.factions],
    });
    setShowFactionForm(false);
  };

  const handleUpdateFaction = async (data: {
    world_id: string;
    name: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => {
    if (!editingFaction) return;
    const updated = await updateFaction(editingFaction.id, data);
    setContentData({
      ...contentData,
      factions: contentData.factions.map((f) =>
        f.id === updated.id ? updated : f,
      ),
    });
    setEditingFaction(null);
    setShowFactionForm(false);
  };

  const handleDeleteFaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faction?")) return;
    await deleteFaction(id);
    setContentData({
      ...contentData,
      factions: contentData.factions.filter((f) => f.id !== id),
    });
  };

  // Faction management handlers
  const handleOpenFactionManager = async (
    type: "character" | "faction",
    id: string,
    name: string,
  ) => {
    setManagingEntity({ type, id, name });
    setShowFactionManager(true);

    // Fetch memberships
    const memberships =
      type === "character"
        ? await getCharacterFactions(id)
        : await getFactionMembers(id);
    setEntityMemberships(memberships);
  };

  const handleAddToFaction = async (targetId: string, role?: string) => {
    if (!managingEntity) return;

    if (managingEntity.type === "character") {
      await addCharacterToFaction({
        character_id: managingEntity.id,
        faction_id: targetId,
        role,
        is_current: true,
      });
      // Refresh memberships
      const memberships = await getCharacterFactions(managingEntity.id);
      setEntityMemberships(memberships);
    } else {
      await addCharacterToFaction({
        character_id: targetId,
        faction_id: managingEntity.id,
        role,
        is_current: true,
      });
      // Refresh memberships
      const memberships = await getFactionMembers(managingEntity.id);
      setEntityMemberships(memberships);
    }
  };

  const handleRemoveFromFaction = async (membershipId: string) => {
    await removeCharacterFromFaction(membershipId);
    // Refresh memberships
    if (!managingEntity) return;
    const memberships =
      managingEntity.type === "character"
        ? await getCharacterFactions(managingEntity.id)
        : await getFactionMembers(managingEntity.id);
    setEntityMemberships(memberships);
  };

  // Render breadcrumbs
  const renderBreadcrumbs = () => {
    const crumbs = [];

    if (viewMode === "worlds" || viewMode === "content") {
      crumbs.push(
        <button
          key="stories"
          onClick={() => {
            setViewMode("stories");
            setSelectedStory(null);
            setSelectedWorld(null);
          }}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Stories
        </button>,
      );
    }

    if (viewMode === "content" && selectedStory) {
      crumbs.push(
        <span key="sep1" className="mx-2 text-gray-400">
          /
        </span>,
      );
      crumbs.push(
        <button
          key="story"
          onClick={() => {
            setViewMode("worlds");
            setSelectedWorld(null);
          }}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {selectedStory.title}
        </button>,
      );
    }

    if (viewMode === "worlds" && selectedStory) {
      crumbs.push(
        <span key="sep2" className="mx-2 text-gray-400">
          /
        </span>,
      );
      crumbs.push(
        <span key="current" className="text-gray-600 dark:text-gray-400">
          {selectedStory.title}
        </span>,
      );
    }

    if (viewMode === "content" && selectedWorld) {
      crumbs.push(
        <span key="sep3" className="mx-2 text-gray-400">
          /
        </span>,
      );
      crumbs.push(
        <span key="current" className="text-gray-600 dark:text-gray-400">
          {selectedWorld.name}
        </span>,
      );
    }

    return crumbs.length > 0 ? (
      <div className="mb-4 flex items-center text-sm">{crumbs}</div>
    ) : null;
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
        <div className="flex h-full flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white/50 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            <div>
              <h3 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                Stories
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Explore your creative worlds
              </p>
            </div>
            <button
              onClick={() => {
                setEditingStory(null);
                setShowStoryForm(true);
              }}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              + New Story
            </button>
          </div>

          {stories.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
                  <svg
                    className="h-10 w-10 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No stories yet
                </h4>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Start your creative journey by creating your first story. Each
                  story can contain multiple worlds, characters, and factions.
                </p>
                <button
                  onClick={() => {
                    setEditingStory(null);
                    setShowStoryForm(true);
                  }}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Create Your First Story
                </button>
              </div>
            </div>
          ) : (
            <ListDetail
              items={storyItems}
              fullscreen
              indexLayout="grid"
              renderItemCard={(item) => (
                <div
                  onClick={() => handleStorySelect(item.data)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Cover Image / Gradient */}
                  <div
                    className="relative h-32 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                    style={
                      item.data.theme_background_image
                        ? {
                            backgroundImage: `url(${item.data.theme_background_image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {}
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    {item.data.is_published && (
                      <div className="absolute top-2 right-2 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        Published
                      </div>
                    )}

                    {/* Quick Actions (visible on hover) */}
                    <div className="absolute top-2 left-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingStory(item.data);
                          setShowStoryForm(true);
                        }}
                        className="rounded-lg bg-white/90 p-1.5 backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
                        title="Edit"
                      >
                        <svg
                          className="h-4 w-4 text-gray-700 dark:text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStory(item.data.id);
                        }}
                        className="rounded-lg bg-white/90 p-1.5 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white dark:bg-gray-900/90"
                        title="Delete"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                      {item.title}
                    </h4>
                    {item.subtitle && (
                      <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Hover Overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              )}
              renderDetail={(item) => (
                <div className="space-y-6">
                  {/* Cover Image in Detail */}
                  {item.data.theme_background_image && (
                    <div className="h-48 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                      <img
                        src={item.data.theme_background_image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {item.data.description && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {item.data.description}
                      </p>
                    </div>
                  )}

                  {/* Theme Colors */}
                  {(item.data.theme_primary_color ||
                    item.data.theme_secondary_color) && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Theme Colors
                      </h4>
                      <div className="flex gap-3">
                        {item.data.theme_primary_color && (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-8 w-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                              style={{
                                backgroundColor: item.data.theme_primary_color,
                              }}
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Primary
                            </span>
                          </div>
                        )}
                        {item.data.theme_secondary_color && (
                          <div className="flex items-center gap-2">
                            <div
                              className="h-8 w-8 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                              style={{
                                backgroundColor:
                                  item.data.theme_secondary_color,
                              }}
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Secondary
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStorySelect(item.data)}
                      className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Explore Worlds
                    </button>
                    <button
                      onClick={() => {
                        setEditingStory(item.data);
                        setShowStoryForm(true);
                      }}
                      className="rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStory(item.data.id)}
                      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      );
    }

    // Worlds view
    if (viewMode === "worlds") {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="border-b border-gray-200 bg-white/50 p-6 pb-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            {renderBreadcrumbs()}
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h3 className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-2xl font-bold text-transparent">
                  Worlds
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Dive into unique worlds and settings
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingWorld(null);
                  setShowWorldForm(true);
                }}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                + New World
              </button>
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
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Build immersive worlds for your story. Each world can have its
                  own characters, factions, and lore.
                </p>
                <button
                  onClick={() => {
                    setEditingWorld(null);
                    setShowWorldForm(true);
                  }}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Create Your First World
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100%-3rem)] overflow-hidden">
              <ListDetail
                items={worldItems}
                fullscreen
                indexLayout="grid"
                renderItemCard={(item) => (
                  <div
                    onClick={() => handleWorldSelect(item.data)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Decorative Header */}
                    <div className="relative h-24 overflow-hidden bg-gradient-to-br from-indigo-400 via-cyan-400 to-teal-400">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                      {/* Quick Actions (visible on hover) */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorld(item.data);
                            setShowWorldForm(true);
                          }}
                          className="rounded-lg bg-white/90 p-1.5 backdrop-blur-sm transition-colors hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
                          title="Edit"
                        >
                          <svg
                            className="h-4 w-4 text-gray-700 dark:text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorld(item.data.id);
                          }}
                          className="rounded-lg bg-white/90 p-1.5 backdrop-blur-sm transition-colors hover:bg-red-500 hover:text-white dark:bg-gray-900/90"
                          title="Delete"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                )}
                renderDetail={(item) => (
                  <div className="space-y-6">
                    {/* Description */}
                    {item.data.description && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Description
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {item.data.description}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleWorldSelect(item.data)}
                        className="flex-1 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        View Content
                      </button>
                      <button
                        onClick={() => {
                          setEditingWorld(item.data);
                          setShowWorldForm(true);
                        }}
                        className="rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWorld(item.data.id)}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      );
    }

    // Content view (characters and factions)
    if (viewMode === "content") {
      return (
        <div className="flex h-full flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="border-b border-gray-200 bg-white/50 p-6 pb-4 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
            {renderBreadcrumbs()}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <h3 className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                  Characters & Factions
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Meet the inhabitants and organizations
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCharacter(null);
                    setShowCharacterForm(true);
                  }}
                  className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  + Character
                </button>
                <button
                  onClick={() => {
                    setEditingFaction(null);
                    setShowFactionForm(true);
                  }}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  + Faction
                </button>
              </div>
            </div>
          </div>

          {contentItems.length === 0 ? (
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
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Populate this world with characters and factions. Characters
                  can belong to multiple factions and have detailed profiles.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingCharacter(null);
                      setShowCharacterForm(true);
                    }}
                    className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Add Character
                  </button>
                  <button
                    onClick={() => {
                      setEditingFaction(null);
                      setShowFactionForm(true);
                    }}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Add Faction
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100%-3rem)] overflow-hidden">
              <ListDetail
                items={contentItems}
                fullscreen
                indexLayout="grid"
                renderItemCard={(item) => (
                  <div
                    onClick={() => {
                      if (item.data.type === "character") {
                        setViewingCharacter(item.data as Character);
                      }
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    {item.data.type === "character" ? (
                      <>
                        {/* Character Card */}
                        <div className="relative h-32 overflow-hidden">
                          {/* Banner or gradient background */}
                          <div
                            className="h-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400"
                            style={
                              "banner_image" in item.data &&
                              item.data.banner_image
                                ? {
                                    backgroundImage: `url(${item.data.banner_image})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                  }
                                : {}
                            }
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          </div>

                          {/* Profile Image */}
                          <div className="absolute -bottom-8 left-4">
                            <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg dark:border-gray-800 dark:bg-gray-700">
                              {"profile_image" in item.data &&
                              item.data.profile_image ? (
                                <img
                                  src={item.data.profile_image}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                                  {item.title.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          {"status" in item.data && item.data.status && (
                            <div className="absolute top-2 right-2 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white capitalize backdrop-blur-sm">
                              {item.data.status}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="px-4 pt-10 pb-4">
                          <h4 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-gray-100 dark:group-hover:text-green-400">
                            {item.title}
                          </h4>
                          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                            {item.subtitle}
                          </p>
                          {"age" in item.data && item.data.age && (
                            <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {item.data.age} years old
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Faction Card */}
                        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                          {/* Faction Icon */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg
                              className="h-12 w-12 text-white/30"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h4 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.subtitle}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Hover Overlay */}
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-xl border-2 opacity-0 transition-opacity group-hover:opacity-100 ${
                        item.data.type === "character"
                          ? "border-green-500"
                          : "border-purple-500"
                      }`}
                    />
                  </div>
                )}
                renderDetail={(item) => (
                  <div className="space-y-6">
                    {/* Type Badge */}
                    <div
                      className={`inline-block rounded-lg px-3 py-1.5 text-xs font-medium ${
                        item.data.type === "character"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      }`}
                    >
                      {item.data.type === "character" ? "Character" : "Faction"}
                    </div>

                    {/* Character-specific details */}
                    {item.data.type === "character" && (
                      <>
                        {"nickname" in item.data && item.data.nickname && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Nickname:</span> "
                            {item.data.nickname}"
                          </div>
                        )}
                        {"personality_summary" in item.data &&
                          item.data.personality_summary && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                              <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Personality
                              </h4>
                              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                {item.data.personality_summary}
                              </p>
                            </div>
                          )}
                        {"status" in item.data && item.data.status && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Status:
                            </span>{" "}
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 capitalize dark:bg-green-900/30 dark:text-green-300">
                              {item.data.status}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Faction-specific details */}
                    {item.data.type === "faction" &&
                      "description" in item.data &&
                      item.data.description && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Description
                          </h4>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            {item.data.description}
                          </p>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          handleOpenFactionManager(
                            item.data.type,
                            item.data.id,
                            item.title,
                          )
                        }
                        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        {item.data.type === "character"
                          ? "Manage Factions"
                          : "Manage Members"}
                      </button>
                      <div className="flex gap-2">
                        {item.data.type === "character" ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingCharacter(item.data as Character);
                                setShowCharacterForm(true);
                              }}
                              className="flex-1 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCharacter(item.data.id)
                              }
                              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingFaction(item.data as Faction);
                                setShowFactionForm(true);
                              }}
                              className="flex-1 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFaction(item.data.id)}
                              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderContent()}

      {showStoryForm && (
        <StoryForm
          story={editingStory || undefined}
          onSubmit={editingStory ? handleUpdateStory : handleCreateStory}
          onCancel={() => {
            setShowStoryForm(false);
            setEditingStory(null);
          }}
        />
      )}

      {showWorldForm && selectedStory && (
        <WorldForm
          world={editingWorld || undefined}
          storyId={selectedStory.id}
          onSubmit={editingWorld ? handleUpdateWorld : handleCreateWorld}
          onCancel={() => {
            setShowWorldForm(false);
            setEditingWorld(null);
          }}
        />
      )}

      {showCharacterForm && selectedWorld && (
        <CharacterForm
          character={editingCharacter || undefined}
          worldId={selectedWorld.id}
          onSubmit={
            editingCharacter ? handleUpdateCharacter : handleCreateCharacter
          }
          onCancel={() => {
            setShowCharacterForm(false);
            setEditingCharacter(null);
          }}
        />
      )}

      {showFactionForm && selectedWorld && (
        <FactionForm
          faction={editingFaction || undefined}
          worldId={selectedWorld.id}
          onSubmit={editingFaction ? handleUpdateFaction : handleCreateFaction}
          onCancel={() => {
            setShowFactionForm(false);
            setEditingFaction(null);
          }}
        />
      )}

      {showFactionManager && managingEntity && (
        <FactionManager
          type={managingEntity.type}
          entityId={managingEntity.id}
          entityName={managingEntity.name}
          availableEntities={
            managingEntity.type === "character"
              ? contentData.factions
              : contentData.characters
          }
          memberships={entityMemberships}
          onAdd={handleAddToFaction}
          onRemove={handleRemoveFromFaction}
          onClose={() => {
            setShowFactionManager(false);
            setManagingEntity(null);
            setEntityMemberships([]);
          }}
        />
      )}

      {viewingCharacter && (
        <CharacterDetailModal
          character={viewingCharacter}
          onClose={() => setViewingCharacter(null)}
        />
      )}
    </>
  );
}
