"use client";

import { useEffect, useState } from "react";
import ListDetail, { type ListDetailItem } from "@/components/ListDetail";
import {
  type Story,
  type World,
  type Character,
  type Faction,
  getWorldsByStoryId,
  getCharactersByWorldId,
  getFactionsByWorldId,
  createStory,
  updateStory,
  deleteStory,
  createWorld,
  updateWorld,
  deleteWorld,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  createFaction,
  updateFaction,
  deleteFaction,
} from "@/lib/actions/wiki";
import StoryForm from "./forms/StoryForm";
import WorldForm from "./forms/WorldForm";
import CharacterForm from "./forms/CharacterForm";
import FactionForm from "./forms/FactionForm";

type ViewMode = "stories" | "worlds" | "content";

type ContentData = {
  characters: Character[];
  factions: Faction[];
};

type WikiClientProps = {
  stories: Story[];
};

export default function WikiClient({ stories: initialStories }: WikiClientProps) {
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

  // Form states
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [showWorldForm, setShowWorldForm] = useState(false);
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showFactionForm, setShowFactionForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);

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
    })
  );

  // World items for ListDetail
  const worldItems: Array<ListDetailItem<string, World>> = worlds.map(
    (world) => ({
      id: world.id,
      title: world.name,
      subtitle: world.summary || undefined,
      data: world,
    })
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
        c.id === updated.id ? updated : c
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
        f.id === updated.id ? updated : f
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
        </button>
      );
    }

    if (viewMode === "content" && selectedStory) {
      crumbs.push(
        <span key="sep1" className="mx-2 text-gray-400">
          /
        </span>
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
        </button>
      );
    }

    if (viewMode === "worlds" && selectedStory) {
      crumbs.push(
        <span key="sep2" className="mx-2 text-gray-400">
          /
        </span>
      );
      crumbs.push(
        <span key="current" className="text-gray-600 dark:text-gray-400">
          {selectedStory.title}
        </span>
      );
    }

    if (viewMode === "content" && selectedWorld) {
      crumbs.push(
        <span key="sep3" className="mx-2 text-gray-400">
          /
        </span>
      );
      crumbs.push(
        <span key="current" className="text-gray-600 dark:text-gray-400">
          {selectedWorld.name}
        </span>
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
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Stories</h3>
          <button
            onClick={() => {
              setEditingStory(null);
              setShowStoryForm(true);
            }}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Story
          </button>
        </div>

        {stories.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No stories yet.
              </p>
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                Create your first story to get started.
              </p>
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
            className="group transition-all duration-200 hover:scale-105 hover:cursor-pointer hover:shadow-lg"
          >
            <div className="mb-1 text-base font-semibold transition-colors duration-200">
              {item.title}
            </div>
            {item.subtitle ? (
              <div className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                {item.subtitle}
              </div>
            ) : null}
          </div>
        )}
        renderDetail={(item) => (
          <div className="space-y-4">
            {item.data.description ? (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.data.description}
                </p>
              </div>
            ) : null}
            <div className="flex gap-2">
              <button
                onClick={() => handleStorySelect(item.data)}
                className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Explore Worlds
              </button>
              <button
                onClick={() => {
                  setEditingStory(item.data);
                  setShowStoryForm(true);
                }}
                className="rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteStory(item.data.id)}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
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
      <div className="h-full overflow-hidden flex flex-col">
        <div className="p-4 pb-0 border-b border-gray-200 dark:border-gray-700">
          {renderBreadcrumbs()}
          <div className="flex justify-between items-center mt-2 mb-4">
            <h3 className="text-lg font-semibold">Worlds</h3>
            <button
              onClick={() => {
                setEditingWorld(null);
                setShowWorldForm(true);
              }}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + New World
            </button>
          </div>
        </div>

        {worlds.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No worlds in this story yet.
              </p>
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
                className="group transition-all duration-200 hover:scale-105 hover:cursor-pointer hover:shadow-lg"
              >
                <div className="mb-1 text-base font-semibold transition-colors duration-200">
                  {item.title}
                </div>
                {item.subtitle ? (
                  <div className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                    {item.subtitle}
                  </div>
                ) : null}
              </div>
            )}
            renderDetail={(item) => (
              <div className="space-y-4">
                {item.data.description ? (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.data.description}
                    </p>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWorldSelect(item.data)}
                    className="flex-1 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    View Content
                  </button>
                  <button
                    onClick={() => {
                      setEditingWorld(item.data);
                      setShowWorldForm(true);
                    }}
                    className="rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteWorld(item.data.id)}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
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
      <div className="h-full overflow-hidden flex flex-col">
        <div className="p-4 pb-0 border-b border-gray-200 dark:border-gray-700">
          {renderBreadcrumbs()}
          <div className="flex justify-between items-center mt-2 mb-4 gap-2">
            <h3 className="text-lg font-semibold">Characters & Factions</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingCharacter(null);
                  setShowCharacterForm(true);
                }}
                className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
              >
                + Character
              </button>
              <button
                onClick={() => {
                  setEditingFaction(null);
                  setShowFactionForm(true);
                }}
                className="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
              >
                + Faction
              </button>
            </div>
          </div>
        </div>

        {contentItems.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No characters or factions in this world yet.
              </p>
            </div>
          </div>
        ) : (
        <div className="h-[calc(100%-3rem)] overflow-hidden">
          <ListDetail
            items={contentItems}
            fullscreen
            indexLayout="grid"
            renderItemCard={(item) => (
              <div className="group transition-all duration-200 hover:scale-105 hover:cursor-pointer hover:shadow-lg">
                <div className="mb-1 text-base font-semibold transition-colors duration-200">
                  {item.title}
                </div>
                <div className="text-xs text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
                  {item.subtitle}
                </div>
              </div>
            )}
            renderDetail={(item) => (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400 inline-block">
                  {item.data.type === "character" ? "Character" : "Faction"}
                </div>
                {item.data.type === "character" && "nickname" in item.data && item.data.nickname ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Nickname: {item.data.nickname}
                  </div>
                ) : null}
                {item.data.type === "character" && "personality_summary" in item.data && item.data.personality_summary ? (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.data.personality_summary}
                    </p>
                  </div>
                ) : item.data.type === "faction" && "description" in item.data && item.data.description ? (
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {item.data.description}
                    </p>
                  </div>
                ) : null}
                {item.data.type === "character" && "status" in item.data && item.data.status ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Status: <span className="capitalize">{item.data.status}</span>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  {item.data.type === "character" ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingCharacter(item.data as Character);
                          setShowCharacterForm(true);
                        }}
                        className="flex-1 rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCharacter(item.data.id)}
                        className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
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
                        className="flex-1 rounded bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaction(item.data.id)}
                        className="flex-1 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
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
    </>
  );
}
