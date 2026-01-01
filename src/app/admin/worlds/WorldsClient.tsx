"use client";

import CopyLinkButton from "@/components/admin/CopyLinkButton";
import WorldForm from "@/components/admin/forms/WorldForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  createWorld,
  deleteWorld,
  getAllWorlds,
  getAllStories,
  type Story,
  updateWorld,
  type World,
} from "@/lib/actions/wiki";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

interface WorldsClientProps {
  initialStories: Story[];
  initialWorlds: World[];
}

export default function WorldsClient({
  initialStories,
  initialWorlds,
}: WorldsClientProps) {
  const queryClient = useQueryClient();
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: getAllStories,
    initialData: initialStories,
  });

  const { data: allWorlds = [] } = useQuery({
    queryKey: ["worlds"],
    queryFn: getAllWorlds,
    initialData: initialWorlds,
  });

  // Filter worlds by selected story (client-side)
  const worlds = useMemo(() => {
    if (!selectedStoryId) return allWorlds;
    return allWorlds.filter((world) => world.story_id === selectedStoryId);
  }, [allWorlds, selectedStoryId]);

  // Batch fetch all world background images for optimal performance
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const worldImagePaths = worlds
    .map((w) => w.theme_background_image)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: worldImageUrls } = useBatchStorageUrls(worldImagePaths);

  const createMutation = useMutation({
    mutationFn: createWorld,
    onSuccess: () => {
      // Don't close form here - onComplete will handle it after uploads finish
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
    onError: (error) => {
      toastWithSound.error(`Failed to create world: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateWorld>[1];
    }) => updateWorld(id, data),
    onSuccess: () => {
      // Don't close form here - onComplete will handle it after uploads finish
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
    onError: (error) => {
      toastWithSound.error(`Failed to update world: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorld,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
      toastWithSound.success("World deleted successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete world: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createWorld>[0]) => {
    const newWorld = await createMutation.mutateAsync(data);
    return newWorld;
  };

  const handleUpdate = async (data: Parameters<typeof updateWorld>[1]) => {
    if (!editingWorld) return undefined;
    const updated = await updateMutation.mutateAsync({
      id: editingWorld.id,
      data,
    });
    return updated || undefined;
  };

  const handleComplete = () => {
    // Refresh to show uploaded images
    queryClient.invalidateQueries({ queryKey: ["worlds"] });
    setShowForm(false);
    setEditingWorld(null);
    toastWithSound.success(
      editingWorld
        ? "World updated successfully!"
        : "World created successfully!",
    );
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  const selectedStory = stories.find((s) => s.id === selectedStoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Worlds
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage worlds within your stories
          </p>
        </div>
        <button
          onClick={() => {
            setEditingWorld(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          + New World
        </button>
      </div>

      {/* Story Filter (Optional) */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Story (Optional)
        </label>
        <select
          value={selectedStoryId}
          onChange={(e) => setSelectedStoryId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Worlds</option>
          {stories.map((story) => (
            <option key={story.id} value={story.id}>
              {story.title}
            </option>
          ))}
        </select>
      </div>

      {worlds.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30">
            <svg
              className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedStoryId
              ? `No worlds in ${selectedStory?.title}`
              : "No worlds yet"}
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {selectedStoryId
              ? "Create your first world for this story"
              : "Create your first world to get started"}
          </p>
          <button
            onClick={() => {
              if (!selectedStoryId) {
                toastWithSound.error(
                  "Please select a story first to create a world",
                );
                return;
              }
              setEditingWorld(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-linear-to-r from-indigo-600 to-cyan-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create Your First World
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world) => (
            <div
              key={world.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Cover Image / Gradient */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-indigo-400 via-cyan-400 to-teal-400">
                {world.theme_background_image ? (
                  <>
                    <StorageImage
                      src={world.theme_background_image}
                      signedUrl={worldImageUrls.get(
                        world.theme_background_image,
                      )}
                      alt={world.name}
                      width={400}
                      height={192}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {world.name}
                </h4>
                {world.summary && (
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {world.summary}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingWorld(world);
                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <CopyLinkButton
                    slug={world.slug}
                    type="world"
                    storySlug={
                      stories.find((s) => s.id === world.story_id)?.slug
                    }
                    variant="icon"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const storySlug = stories.find(
                        (s) => s.id === world.story_id,
                      )?.slug;
                      window.open(
                        `/?story=${storySlug}&world=${world.slug}`,
                        "_blank",
                      );
                    }}
                    className="rounded-lg bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    title="View"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <title>Open</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(world.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    title="Delete"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <title>Delete</title>
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
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <WorldForm
          world={editingWorld || undefined}
          storyId={editingWorld?.story_id || selectedStoryId}
          onSubmit={editingWorld ? handleUpdate : handleCreate}
          availableStories={stories}
          onComplete={handleComplete}
          onCancel={() => {
            setShowForm(false);
            setEditingWorld(null);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete World"
          message="Are you sure you want to delete this world? This action cannot be undone."
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
