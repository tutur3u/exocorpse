"use client";

import CopyLinkButton from "@/components/admin/CopyLinkButton";
import StoryForm from "@/components/admin/forms/StoryForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  createStory,
  deleteStory,
  getPublishedStories,
  type Story,
  updateStory,
} from "@/lib/actions/wiki";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface StoriesClientProps {
  initialStories: Story[];
}

export default function StoriesClient({ initialStories }: StoriesClientProps) {
  const queryClient = useQueryClient();
  const { data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: getPublishedStories,
    initialData: initialStories,
  });

  // Batch fetch all story background images for optimal performance
  // Only fetch signed URLs for storage paths (non-HTTP URLs)
  const storyImagePaths = stories
    .map((s) => s.theme_background_image)
    .filter((p): p is string => !!p && !p.startsWith("http"));
  const { signedUrls: storyImageUrls } = useBatchStorageUrls(storyImagePaths);

  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      // Don't invalidate here - handleComplete will do it after uploads finish
      // to avoid redundant refetches and UI flicker
    },
    onError: (error) => {
      toastWithSound.error(`Failed to create story: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateStory>[1];
    }) => updateStory(id, data),
    onSuccess: () => {
      // Don't invalidate here - handleComplete will do it after uploads finish
      // to avoid redundant refetches and UI flicker
    },
    onError: (error) => {
      toastWithSound.error(`Failed to update story: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toastWithSound.success("Story deleted successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete story: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createStory>[0]) => {
    const newStory = await createMutation.mutateAsync(data);
    return newStory;
  };

  const handleUpdate = async (data: Parameters<typeof updateStory>[1]) => {
    if (!editingStory) return undefined;
    const updated = await updateMutation.mutateAsync({
      id: editingStory.id,
      data,
    });
    return updated || undefined;
  };

  const handleComplete = () => {
    // Refresh to show uploaded images
    queryClient.invalidateQueries({ queryKey: ["stories"] });
    setShowForm(false);
    setEditingStory(null);
    toastWithSound.success(
      editingStory
        ? "Story updated successfully!"
        : "Story created successfully!",
    );
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Stories
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your story universes
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStory(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          + New Story
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No stories yet
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first story to get started
          </p>
          <button
            onClick={() => {
              setEditingStory(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create Your First Story
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Cover Image / Gradient */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-blue-500 via-purple-500 to-pink-500">
                {story.theme_background_image ? (
                  <>
                    <StorageImage
                      src={story.theme_background_image}
                      signedUrl={storyImageUrls.get(
                        story.theme_background_image,
                      )}
                      alt={story.title}
                      width={400}
                      height={192}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                )}

                {/* Status Badges */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {story.visibility === "unlisted" ? (
                    <div className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Unlisted</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      Unlisted
                    </div>
                  ) : story.visibility === "private" ? (
                    <div className="flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Private</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Private
                    </div>
                  ) : story.is_published ? (
                    <div className="flex items-center gap-1 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Public</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Public
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 rounded-full bg-gray-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Draft</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Draft
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {story.title}
                </h4>
                {story.summary && (
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                    {story.summary}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStory(story);
                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <CopyLinkButton
                    slug={story.slug}
                    type="story"
                    variant="icon"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      window.open(`/?story=${story.slug}`, "_blank")
                    }
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
                    onClick={() => handleDelete(story.id)}
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
        <StoryForm
          story={editingStory || undefined}
          onSubmit={editingStory ? handleUpdate : handleCreate}
          onComplete={handleComplete}
          onCancel={() => {
            setShowForm(false);
            setEditingStory(null);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Story"
          message="Are you sure you want to delete this story? This action cannot be undone."
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
