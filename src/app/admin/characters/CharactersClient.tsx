"use client";

import FactionManager from "@/components/admin/FactionManager";
import RelationshipManager from "@/components/admin/RelationshipManager";
import CharacterForm from "@/components/admin/forms/CharacterForm";
import CharacterDetail from "@/components/apps/CharacterDetail";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PreviewModal from "@/components/shared/PreviewModal";
import { InitialWikiDataProvider } from "@/contexts/InitialWikiDataContext";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  addCharacterToFaction,
  type Character,
  createCharacter,
  createCharacterRelationship,
  deleteCharacter,
  deleteCharacterRelationship,
  getAllCharacters,
  getAllWorlds,
  getAvailableCharactersForRelationship,
  getCharacterFactions,
  getCharacterRelationshipRecords,
  getCharactersByStoryId,
  getCharactersByWorldId,
  getCharacterWorlds,
  getFactionsByCharacterWorldIds,
  getPublishedStories,
  getRelationshipTypes,
  getWorldsByStoryId,
  removeCharacterFromFaction,
  type Story,
  updateCharacter,
  updateCharacterRelationship,
} from "@/lib/actions/wiki";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";

interface CharactersClientProps {
  initialStories: Story[];
}

// Character Card Component - extracted to use hooks properly
function CharacterCard({
  character,
  onEdit,
  onDelete,
  onManageFactions,
  onManageRelationships,
  onPreview,
  profileUrl,
  bannerUrl,
}: {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
  onManageFactions: (id: string, name: string) => void;
  onManageRelationships: (id: string, name: string) => void;
  onPreview: (character: Character) => void;
  profileUrl: string | null;
  bannerUrl: string | null;
}) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Character Banner/Header */}
      <div className="relative h-32 overflow-hidden rounded-t-xl bg-linear-to-br from-green-400 via-emerald-400 to-teal-400">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={`${character.name} banner`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            unoptimized={true}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Profile Image - Overlapping the banner */}
      <div className="relative px-4">
        <div className="absolute -top-10 left-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={character.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg
                  className="h-10 w-10 text-gray-400"
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
            )}
          </div>
        </div>
      </div>

      {/* Content - adjusted padding for overlapping profile */}
      <div className="px-4 pt-12 pb-4">
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
        <div className="mb-2 space-y-2">
          <button
            type="button"
            onClick={() => onPreview(character)}
            className="w-full rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => onManageFactions(character.id, character.name)}
            className="w-full rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
          >
            Manage Factions
          </button>
          <button
            type="button"
            onClick={() => onManageRelationships(character.id, character.name)}
            className="w-full rounded-lg bg-pink-100 px-3 py-2 text-sm font-medium text-pink-700 transition-colors hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50"
          >
            Manage Relationships
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(character)}
            className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(character.id)}
            className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
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

  // Relationship management states
  const [showRelationshipManager, setShowRelationshipManager] = useState(false);
  const [managingRelationshipCharacter, setManagingRelationshipCharacter] =
    useState<{
      id: string;
      name: string;
    } | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Preview states
  const [previewCharacter, setPreviewCharacter] = useState<Character | null>(
    null,
  );

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: getPublishedStories,
    initialData: initialStories,
  });

  // Fetch worlds - for the filter (story-specific) and for character form (all worlds)
  const { data: worlds = [] } = useQuery({
    queryKey: ["worlds", selectedStoryId],
    queryFn: () => getWorldsByStoryId(selectedStoryId),
    enabled: !!selectedStoryId,
  });

  // Fetch all worlds for the character form
  const { data: allWorlds = [], isLoading: allWorldsLoading } = useQuery({
    queryKey: ["allWorlds"],
    queryFn: getAllWorlds,
  });

  // Fetch all characters by default, or filtered by story if one is selected
  const { data: characters = [], isLoading: charactersLoading } = useQuery({
    queryKey: ["characters", selectedStoryId],
    queryFn: () =>
      selectedStoryId
        ? getCharactersByStoryId(selectedStoryId)
        : getAllCharacters(),
  });

  // Fetch faction memberships for character
  const { data: entityMemberships = [] } = useQuery({
    queryKey: ["characterFactions", managingCharacter?.id],
    queryFn: () => getCharacterFactions(managingCharacter!.id),
    enabled: !!managingCharacter?.id && showFactionManager,
  });

  // Fetch available factions based on character's worlds
  const { data: factions = [] } = useQuery({
    queryKey: ["factions", managingCharacter?.id],
    queryFn: () => {
      if (!managingCharacter) return [];
      return getFactionsByCharacterWorldIds(managingCharacter.id);
    },
    enabled: !!managingCharacter?.id && showFactionManager,
  });

  // Fetch relationship types (global and story-specific)
  const { data: relationshipTypes = [] } = useQuery({
    queryKey: ["relationshipTypes", selectedStoryId],
    queryFn: () => getRelationshipTypes(selectedStoryId || undefined),
    enabled: showRelationshipManager,
  });

  // Fetch character relationships
  const { data: characterRelationships = [] } = useQuery({
    queryKey: ["characterRelationships", managingRelationshipCharacter?.id],
    queryFn: () =>
      getCharacterRelationshipRecords(managingRelationshipCharacter!.id),
    enabled: !!managingRelationshipCharacter?.id && showRelationshipManager,
  });

  // Fetch available characters for relationships
  const { data: availableCharactersForRelationship = [] } = useQuery({
    queryKey: [
      "availableCharactersForRelationship",
      managingRelationshipCharacter?.id,
      selectedStoryId,
    ],
    queryFn: async () => {
      if (!managingRelationshipCharacter) return [];
      // Get worlds for this character to filter available characters
      const worlds = await getCharacterWorlds(managingRelationshipCharacter.id);
      const worldIds = worlds.map((w) => w.world_id);
      return getAvailableCharactersForRelationship(
        managingRelationshipCharacter.id,
        worldIds,
      );
    },
    enabled: !!managingRelationshipCharacter?.id && showRelationshipManager,
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

  // Batch fetch all character images
  const imagePaths = filteredCharacters.flatMap((character) => [
    character.profile_image,
    character.banner_image,
  ]);
  const { signedUrls: imageUrls, loading: imagesLoading } =
    useBatchStorageUrls(imagePaths);

  const createMutation = useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      // Don't close form here - onComplete will handle it after uploads finish
      queryClient.invalidateQueries({
        queryKey: ["characters", selectedStoryId],
      });
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
      // Don't close form here - onComplete will handle it after uploads finish
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
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });
      toastWithSound.success("Character deleted successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete character: ${error.message}`);
    },
  });

  const addToFactionMutation = useMutation({
    mutationFn: addCharacterToFaction,
    onSuccess: () => {
      if (!managingCharacter) return;
      queryClient.invalidateQueries({
        queryKey: ["characterFactions", managingCharacter.id],
      });
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
    onSuccess: () => {
      if (!managingCharacter) return;
      queryClient.invalidateQueries({
        queryKey: ["characterFactions", managingCharacter.id],
      });
      toastWithSound.success("Character removed from faction!");
    },
    onError: (error) => {
      toastWithSound.error(
        `Failed to remove character from faction: ${error.message}`,
      );
    },
  });

  const addRelationshipMutation = useMutation({
    mutationFn: createCharacterRelationship,
    onSuccess: () => {
      if (!managingRelationshipCharacter) return;
      queryClient.invalidateQueries({
        queryKey: ["characterRelationships", managingRelationshipCharacter.id],
      });
      toastWithSound.success("Relationship added!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to add relationship: ${error.message}`);
    },
  });

  const updateRelationshipMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updateCharacterRelationship>[1];
    }) => updateCharacterRelationship(id, updates),
    onSuccess: () => {
      if (!managingRelationshipCharacter) return;
      queryClient.invalidateQueries({
        queryKey: ["characterRelationships", managingRelationshipCharacter.id],
      });
      toastWithSound.success("Relationship updated!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to update relationship: ${error.message}`);
    },
  });

  const deleteRelationshipMutation = useMutation({
    mutationFn: deleteCharacterRelationship,
    onSuccess: () => {
      if (!managingRelationshipCharacter) return;
      queryClient.invalidateQueries({
        queryKey: ["characterRelationships", managingRelationshipCharacter.id],
      });
      toastWithSound.success("Relationship deleted!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete relationship: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createCharacter>[0]) => {
    // Create character - images will be handled by the form's deferred upload
    const newCharacter = await createMutation.mutateAsync(data);
    return newCharacter;
  };

  const handleUpdate = async (data: Parameters<typeof updateCharacter>[1]) => {
    if (!editingCharacter) return undefined;
    const worldIds = data.world_ids || [];
    const updated = await updateMutation.mutateAsync({
      id: editingCharacter.id,
      data,
      worldIds,
    });
    return updated || undefined;
  };

  const handleComplete = () => {
    // Refresh to show uploaded images
    queryClient.invalidateQueries({
      queryKey: ["characters", selectedStoryId],
    });
    setShowForm(false);
    setEditingCharacter(null);
    toastWithSound.success(
      editingCharacter
        ? "Character updated successfully!"
        : "Character created successfully!",
    );
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  const handleEdit = async (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  const handleOpenFactionManager = (id: string, name: string) => {
    setManagingCharacter({ id, name });
    setShowFactionManager(true);
    // React Query will automatically fetch when enabled becomes true
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

  const handleOpenRelationshipManager = (id: string, name: string) => {
    setManagingRelationshipCharacter({ id, name });
    setShowRelationshipManager(true);
    // React Query will automatically fetch when enabled becomes true
  };

  const handleAddRelationship = async (data: {
    relatedCharacterId: string;
    relationshipTypeId: string;
    description?: string;
    isMutual?: boolean;
  }) => {
    if (!managingRelationshipCharacter) return;
    await addRelationshipMutation.mutateAsync({
      character_a_id: managingRelationshipCharacter.id,
      character_b_id: data.relatedCharacterId,
      relationship_type_id: data.relationshipTypeId,
      description: data.description,
      is_mutual: data.isMutual,
    });
  };

  const handleUpdateRelationship = async (
    relationshipId: string,
    data: {
      relationshipTypeId?: string;
      description?: string;
      isMutual?: boolean;
    },
  ) => {
    const updates: Parameters<typeof updateCharacterRelationship>[1] = {};
    if (data.relationshipTypeId)
      updates.relationship_type_id = data.relationshipTypeId;
    if (data.description !== undefined) updates.description = data.description;
    if (data.isMutual !== undefined) updates.is_mutual = data.isMutual;

    await updateRelationshipMutation.mutateAsync({
      id: relationshipId,
      updates,
    });
  };

  const handleDeleteRelationship = async (relationshipId: string) => {
    await deleteRelationshipMutation.mutateAsync(relationshipId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Characters
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all characters across your worlds
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCharacter(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-linear-to-r from-green-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          + New Character
        </button>
      </div>

      {/* Story & World Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Story (optional)
        </label>
        <select
          value={selectedStoryId}
          onChange={(e) => {
            setSelectedStoryId(e.target.value);
            setSelectedWorldFilters(new Set()); // Reset world filters when story changes
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Stories</option>
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

      {charactersLoading || imagesLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
            <div className="text-gray-500 dark:text-gray-400">
              {charactersLoading
                ? "Loading characters..."
                : "Loading images..."}
            </div>
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
            <CharacterCard
              key={character.id}
              character={character}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onManageFactions={handleOpenFactionManager}
              onManageRelationships={handleOpenRelationshipManager}
              onPreview={setPreviewCharacter}
              profileUrl={
                character.profile_image
                  ? (imageUrls.get(character.profile_image) ?? null)
                  : null
              }
              bannerUrl={
                character.banner_image
                  ? (imageUrls.get(character.banner_image) ?? null)
                  : null
              }
            />
          ))}
        </div>
      )}

      {showForm && (!editingCharacter || !characterWorldsLoading) && (
        <CharacterForm
          character={editingCharacter ?? undefined}
          preSelectedWorldIds={
            editingCharacter ? characterWorlds.map((cw) => cw.world_id) : []
          }
          availableWorlds={allWorlds}
          worldsLoading={
            editingCharacter ? characterWorldsLoading : allWorldsLoading
          }
          onSubmit={editingCharacter ? handleUpdate : handleCreate}
          onComplete={handleComplete}
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
            // React Query will clean up automatically
          }}
        />
      )}

      {showRelationshipManager && managingRelationshipCharacter && (
        <RelationshipManager
          characterId={managingRelationshipCharacter.id}
          characterName={managingRelationshipCharacter.name}
          relationships={characterRelationships}
          availableCharacters={availableCharactersForRelationship}
          relationshipTypes={relationshipTypes}
          onAdd={handleAddRelationship}
          onUpdate={handleUpdateRelationship}
          onDelete={handleDeleteRelationship}
          onClose={() => {
            setShowRelationshipManager(false);
            setManagingRelationshipCharacter(null);
            // React Query will clean up automatically
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

      {previewCharacter && (
        <PreviewModal
          isOpen={!!previewCharacter}
          onCloseAction={() => setPreviewCharacter(null)}
          title={`Preview: ${previewCharacter.name}`}
        >
          <InitialWikiDataProvider
            initialData={{
              params: { story: null, world: null },
              stories: [],
              worlds: [],
              characters: [],
              factions: [],
              characterDetail: null,
            }}
          >
            <CharacterDetail character={previewCharacter} />
          </InitialWikiDataProvider>
        </PreviewModal>
      )}
    </div>
  );
}
