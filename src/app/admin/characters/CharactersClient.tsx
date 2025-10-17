"use client";

import FactionManager, {
  type FactionMembership,
} from "@/components/admin/FactionManager";
import CharacterForm from "@/components/admin/forms/CharacterForm";
import {
  addCharacterToFaction,
  type Character,
  createCharacter,
  deleteCharacter,
  getCharacterFactions,
  getCharactersByWorldId,
  getFactionsByWorldId,
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
  const [selectedWorldId, setSelectedWorldId] = useState<string>("");
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
    queryKey: ["characters", selectedWorldId],
    queryFn: () => getCharactersByWorldId(selectedWorldId),
    enabled: !!selectedWorldId,
  });

  const { data: factions = [] } = useQuery({
    queryKey: ["factions", selectedWorldId],
    queryFn: () => getFactionsByWorldId(selectedWorldId),
    enabled: !!selectedWorldId,
  });

  const createMutation = useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characters", selectedWorldId],
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
    }) => updateCharacter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["characters", selectedWorldId],
      });
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
        queryKey: ["characters", selectedWorldId],
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
    await updateMutation.mutateAsync({ id: editingCharacter.id, data });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character?")) return;
    await deleteMutation.mutateAsync(id);
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

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId);

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
        {selectedWorldId && (
          <button
            onClick={() => {
              setEditingCharacter(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            + New Character
          </button>
        )}
      </div>

      {/* Story & World Selector */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select a Story
          </label>
          <select
            value={selectedStoryId}
            onChange={(e) => {
              setSelectedStoryId(e.target.value);
              setSelectedWorldId("");
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

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select a World
          </label>
          <select
            value={selectedWorldId}
            onChange={(e) => setSelectedWorldId(e.target.value)}
            disabled={!selectedStoryId}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">-- Choose a world --</option>
            {worlds.map((world) => (
              <option key={world.id} value={world.id}>
                {world.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedWorldId ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
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
            Select a world to manage characters
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a story and world from the dropdowns above
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
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
            No characters in {selectedWorld?.name}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first character for this world
          </p>
          <button
            onClick={() => {
              setEditingCharacter(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create First Character
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <div
              key={character.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Character Header */}
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
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
                    onClick={() => {
                      setEditingCharacter(character);
                      setShowForm(true);
                    }}
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

      {showForm && selectedWorldId && (
        <CharacterForm
          character={editingCharacter || undefined}
          worldId={selectedWorldId}
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
    </div>
  );
}
