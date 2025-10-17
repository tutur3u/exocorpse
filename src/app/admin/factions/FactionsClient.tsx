"use client";

import FactionManager, {
  type FactionMembership,
} from "@/components/admin/FactionManager";
import FactionForm from "@/components/admin/forms/FactionForm";
import {
  addCharacterToFaction,
  createFaction,
  deleteFaction,
  type Faction,
  getCharactersByWorldId,
  getFactionMembers,
  getFactionsByWorldId,
  getPublishedStories,
  getWorldsByStoryId,
  removeCharacterFromFaction,
  type Story,
  updateFaction,
} from "@/lib/actions/wiki";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toastWithSound from "@/lib/toast";

interface FactionsClientProps {
  initialStories: Story[];
}

export default function FactionsClient({
  initialStories,
}: FactionsClientProps) {
  const queryClient = useQueryClient();
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [selectedWorldId, setSelectedWorldId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null);

  // Member management states
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [managingFaction, setManagingFaction] = useState<{
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

  const { data: factions = [], isLoading: factionsLoading } = useQuery({
    queryKey: ["factions", selectedWorldId],
    queryFn: () => getFactionsByWorldId(selectedWorldId),
    enabled: !!selectedWorldId,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ["characters", selectedWorldId],
    queryFn: () => getCharactersByWorldId(selectedWorldId),
    enabled: !!selectedWorldId,
  });

  const createMutation = useMutation({
    mutationFn: createFaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["factions", selectedWorldId],
      });
      setShowForm(false);
      toastWithSound.success("Faction created successfully!");
    },
    onError: (error) => {
  toastWithSound.error(`Failed to create faction: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateFaction>[1];
    }) => updateFaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["factions", selectedWorldId],
      });
      setEditingFaction(null);
      setShowForm(false);
      toastWithSound.success("Faction updated successfully!");
    },
    onError: (error) => {
  toastWithSound.error(`Failed to update faction: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["factions", selectedWorldId],
      });
      toastWithSound.success("Faction deleted successfully!");
    },
    onError: (error) => {
  toastWithSound.error(`Failed to delete faction: ${error.message}`);
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: addCharacterToFaction,
    onSuccess: async () => {
      if (!managingFaction) return;
      const memberships = await getFactionMembers(managingFaction.id);
      setEntityMemberships(memberships);
      toastWithSound.success("Member added to faction!");
    },
    onError: (error) => {
  toastWithSound.error(`Failed to add member to faction: ${error.message}`);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeCharacterFromFaction,
    onSuccess: async () => {
      if (!managingFaction) return;
      const memberships = await getFactionMembers(managingFaction.id);
      setEntityMemberships(memberships);
      toastWithSound.success("Member removed from faction!");
    },
    onError: (error) => {
  toastWithSound.error(`Failed to remove member from faction: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createFaction>[0]) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: Parameters<typeof updateFaction>[1]) => {
    if (!editingFaction) return;
    await updateMutation.mutateAsync({ id: editingFaction.id, data });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this faction?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const handleOpenMemberManager = async (id: string, name: string) => {
    setManagingFaction({ id, name });
    setShowMemberManager(true);
    const memberships = await getFactionMembers(id);
    setEntityMemberships(memberships);
  };

  const handleAddMember = async (characterId: string, role?: string) => {
    if (!managingFaction) return;
    await addMemberMutation.mutateAsync({
      character_id: characterId,
      faction_id: managingFaction.id,
      role,
      is_current: true,
    });
  };

  const handleRemoveMember = async (membershipId: string) => {
    await removeMemberMutation.mutateAsync(membershipId);
  };

  const selectedWorld = worlds.find((w) => w.id === selectedWorldId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Factions
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage factions and organizations within your worlds
          </p>
        </div>
        {selectedWorldId && (
          <button
            onClick={() => {
              setEditingFaction(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            + New Faction
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
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <svg
              className="h-8 w-8 text-purple-600 dark:text-purple-400"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Select a world to manage factions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a story and world from the dropdowns above
          </p>
        </div>
      ) : factionsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Loading factions...
          </div>
        </div>
      ) : factions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
            <svg
              className="h-8 w-8 text-purple-600 dark:text-purple-400"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No factions in {selectedWorld?.name}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first faction for this world
          </p>
          <button
            onClick={() => {
              setEditingFaction(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create First Faction
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {factions.map((faction) => (
            <div
              key={faction.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Faction Header */}
              <div className="relative h-24 overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {faction.name}
                </h4>
                {faction.summary && (
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {faction.summary}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-2">
                  <button
                    onClick={() =>
                      handleOpenMemberManager(faction.id, faction.name)
                    }
                    className="w-full rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  >
                    Manage Members
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingFaction(faction);
                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faction.id)}
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
        <FactionForm
          faction={editingFaction || undefined}
          worldId={selectedWorldId}
          onSubmit={editingFaction ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingFaction(null);
          }}
        />
      )}

      {showMemberManager && managingFaction && (
        <FactionManager
          type="faction"
          entityId={managingFaction.id}
          entityName={managingFaction.name}
          availableEntities={characters}
          memberships={entityMemberships}
          onAdd={handleAddMember}
          onRemove={handleRemoveMember}
          onClose={() => {
            setShowMemberManager(false);
            setManagingFaction(null);
            setEntityMemberships([]);
          }}
        />
      )}
    </div>
  );
}
