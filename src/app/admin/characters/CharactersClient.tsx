"use client";

import FactionManager, {
  type FactionMembership,
} from "@/components/admin/FactionManager";
import CharacterForm from "@/components/admin/forms/CharacterForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  addCharacterToFaction,
  type Character,
  createCharacter,
  deleteCharacter,
  getCharacterFactions,
  getCharactersByStoryId,
  getCharactersByWorldId,
  getCharacterWorlds,
  getFactionsByCharacterWorldIds,
  getPublishedStories,
  getWorldsByStoryId,
  removeCharacterFromFaction,
  type Story,
  updateCharacter,
} from "@/lib/actions/wiki";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface CharactersClientProps {
  initialStories: Story[];
}

export default function CharactersClient({
  initialStories,
}: CharactersClientProps) {
  const queryClient = useQueryClient();
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [selectedWorldFilters, setSelectedWorldFilters] = useState<Set<string>>(
    new Set(),
  );
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null,
  );

  // Faction management states
  const [showFactionManager, setShowFactionManager] = useState(false);
  const [managingCharacter, setManagingCharacter] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [entityMemberships, setEntityMemberships] = useState<
    FactionMembership[]
  >([]);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: getPublishedStories,
    initialData: initialStories,
  });

  const { data: worlds = [] } = useQuery({
    queryKey: ["worlds", selectedStoryId],
    queryFn: () => getWorldsByStoryId(selectedStoryId),
    enabled: !!selectedStoryId,
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ["characters", selectedStoryId],
    queryFn: () => getCharactersByStoryId(selectedStoryId),
    enabled: !!selectedStoryId,
  });

  const { data: factions = [] } = useQuery({
    queryKey: ["factions", managingCharacter?.id],
    queryFn: () => {
      if (!managingCharacter) return [];
      return getFactionsByCharacterWorldIds(managingCharacter.id);
    },
    enabled: !!managingCharacter?.id,
  });

  // Query for character worlds when editing
  const { data: characterWorlds = [], isLoading: characterWorldsLoading } =
    useQuery({
      queryKey: ["characterWorlds", editingCharacter?.id],
      queryFn: () => getCharacterWorlds(editingCharacter!.id),
      enabled: !!editingCharacter?.id,
    });

  // Get all character-world relationships for the story
  const { data: characterWorldMappings = [] } = useQuery({
    queryKey: ["characterWorldMappings", selectedStoryId],
    queryFn: async () => {
      if (!selectedStoryId) return [];
      // Fetch all character-world relationships for worlds in this story
      const storyWorlds = await getWorldsByStoryId(selectedStoryId);
      const mappings: { characterId: string; worldId: string }[] = [];

      for (const world of storyWorlds) {
        const chars = await getCharactersByWorldId(world.id);
        chars.forEach((char: Character) => {
          mappings.push({ characterId: char.id, worldId: world.id });
        });
      }

      return mappings;
    },
    enabled: !!selectedStoryId,
  });

  // Filter characters based on selected worlds
  const filteredCharacters =
    selectedWorldFilters.size === 0
      ? characters
      : characters.filter((character) => {
          // Check if character belongs to any selected world
          return characterWorldMappings.some(
            (mapping) =>
              mapping.characterId === character.id &&
              selectedWorldFilters.has(mapping.worldId),
          );
        });

  const createMutation = useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characters", selectedStoryId],
      });
      setShowForm(false);
      toastWithSound.success("Character created successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to create character: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateCharacter>[1];
      worldIds: string[];
    }) => updateCharacter(id, data),
    onSuccess: async () => {
      // Invalidate the characters query for the selected story
      await queryClient.invalidateQueries({
        queryKey: ["characters", selectedStoryId],
      });

      // Also invalidate the character's worlds data
      if (editingCharacter) {
        await queryClient.invalidateQueries({
          queryKey: ["characterWorlds", editingCharacter.id],
        });
      }

      setEditingCharacter(null);
      setShowForm(false);
      toastWithSound.success("Character updated successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to update character: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characters", selectedStoryId],
      });
      toastWithSound.success("Character deleted successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete character: ${error.message}`);
    },
  });

  const addToFactionMutation = useMutation({
    mutationFn: addCharacterToFaction,
    onSuccess: async () => {
      if (!managingCharacter) return;
      const memberships = await getCharacterFactions(managingCharacter.id);
      setEntityMemberships(memberships);
      toastWithSound.success("Character added to faction!");
    },
    onError: (error) => {
      toastWithSound.error(
        `Failed to add character to faction: ${error.message}`,
      );
    },
  });

  const removeFromFactionMutation = useMutation({
    mutationFn: removeCharacterFromFaction,
    onSuccess: async () => {
      if (!managingCharacter) return;
      const memberships = await getCharacterFactions(managingCharacter.id);
      setEntityMemberships(memberships);
      toastWithSound.success("Character removed from faction!");
    },
    onError: (error) => {
      toastWithSound.error(
        `Failed to remove character from faction: ${error.message}`,
      );
    },
  });

  const handleCreate = async (data: Parameters<typeof createCharacter>[0]) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: Parameters<typeof updateCharacter>[1]) => {
    if (!editingCharacter) return;
    const worldIds = data.world_ids || [];
    await updateMutation.mutateAsync({
      id: editingCharacter.id,
      data,
      worldIds,
    });
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  const handleEdit = async (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  const handleOpenFactionManager = async (id: string, name: string) => {
    setManagingCharacter({ id, name });
    setShowFactionManager(true);
    const memberships = await getCharacterFactions(id);
    setEntityMemberships(memberships);
  };

  const handleAddToFaction = async (factionId: string, role?: string) => {
    if (!managingCharacter) return;
    await addToFactionMutation.mutateAsync({
      character_id: managingCharacter.id,
      faction_id: factionId,
      role,
      is_current: true,
    });
  };

  const handleRemoveFromFaction = async (membershipId: string) => {
    await removeFromFactionMutation.mutateAsync(membershipId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Characters
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage characters within your worlds
          </p>
        </div>
        {selectedStoryId && (
          <button
            onClick={() => {
              setEditingCharacter(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-linear-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            + New Character
          </button>
        )}
      </div>

      {/* Story & World Selector */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select a Story
        </label>
        <select
          value={selectedStoryId}
          onChange={(e) => {
            setSelectedStoryId(e.target.value);
            setSelectedWorldFilters(new Set()); // Reset world filters when story changes
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">-- Choose a story --</option>
          {stories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.title}
            </option>
          ))}
        </select>
      </div>

      {/* World Filter */}
      {selectedStoryId && worlds.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Worlds (
            {selectedWorldFilters.size > 0
              ? `${selectedWorldFilters.size} selected`
              : "All worlds"}
            )
          </label>
          <div className="flex flex-wrap gap-2">
            {worlds.map((world) => (
              <button
                key={world.id}
                onClick={() => {
                  const newFilters = new Set(selectedWorldFilters);
                  if (newFilters.has(world.id)) {
                    newFilters.delete(world.id);
                  } else {
                    newFilters.add(world.id);
                  }
                  setSelectedWorldFilters(newFilters);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  selectedWorldFilters.has(world.id)
                    ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500"
                }`}
              >
                {world.name}
              </button>
            ))}
            {selectedWorldFilters.size > 0 && (
              <button
                onClick={() => setSelectedWorldFilters(new Set())}
                className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-all duration-200 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {!selectedStoryId ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select a story to manage characters
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a story from the dropdown above
          </p>
        </div>
      ) : charactersLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Loading characters...
          </div>
        </div>
      ) : characters.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No characters in this story
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first character for this story
          </p>
          <button
            onClick={() => {
              setEditingCharacter(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-linear-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create First Character
          </button>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
            <svg
              className="h-8 w-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 4v2M6.343 3.665c-.966-.322-1.641-.56-2.513-.56C2.622 3.105 1 4.727 1 6.757c0 .997.142 1.926.41 2.816.267.89.663 1.668 1.184 2.333.52.665 1.166 1.23 1.945 1.697"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No characters match the selected filters
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Try clearing the world filters to see all characters
          </p>
          <button
            onClick={() => setSelectedWorldFilters(new Set())}
            className="rounded-lg bg-linear-to-r from-yellow-600 to-orange-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCharacters.map((character) => (
            <div
              key={character.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Character Header */}
              <div className="relative h-32 overflow-hidden bg-linear-to-br from-green-400 via-emerald-400 to-teal-400">
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {character.name}
                </h4>
                {character.nickname && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    &quot;{character.nickname}&quot;
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2">
                  <button
                    onClick={() =>
                      handleOpenFactionManager(character.id, character.name)
                    }
                    className="w-full rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
                  >
                    Manage Factions
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(character)}
                    className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(character.id)}
                    className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm &&
        selectedStoryId &&
        (!editingCharacter || !characterWorldsLoading) && (
          <CharacterForm
            character={editingCharacter ?? undefined}
            preSelectedWorldIds={
              editingCharacter ? characterWorlds.map((cw) => cw.world_id) : []
            }
            availableWorlds={worlds}
            worldsLoading={editingCharacter ? characterWorldsLoading : false}
            onSubmit={editingCharacter ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingCharacter(null);
            }}
          />
        )}

      {showFactionManager && managingCharacter && (
        <FactionManager
          type="character"
          entityId={managingCharacter.id}
          entityName={managingCharacter.name}
          availableEntities={factions}
          memberships={entityMemberships}
          onAdd={handleAddToFaction}
          onRemove={handleRemoveFromFaction}
          onClose={() => {
            setShowFactionManager(false);
            setManagingCharacter(null);
            setEntityMemberships([]);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Character"
          message="Are you sure you want to delete this character? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={async () => {
            try {
              await deleteMutation.mutateAsync(deleteConfirmId!);
            } finally {
              setShowDeleteConfirm(false);
              setDeleteConfirmId(null);
            }
          }}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteConfirmId(null);
          }}
        />
      )}
    </div>
  );
}
