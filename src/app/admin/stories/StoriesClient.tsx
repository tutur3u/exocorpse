"use client";

import StoryForm from "@/components/admin/forms/StoryForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
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

  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowForm(false);
      toastWithSound.success("Story created successfully!");
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
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setEditingStory(null);
      setShowForm(false);
      toastWithSound.success("Story updated successfully!");
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
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: Parameters<typeof updateStory>[1]) => {
    if (!editingStory) return;
    await updateMutation.mutateAsync({ id: editingStory.id, data });
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
          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          + New Story
        </button>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
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
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
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
              <div
                className="relative h-32 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                style={
                  story.theme_background_image
                    ? {
                        backgroundImage: `url(${story.theme_background_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Status Badge */}
                {story.is_published && (
                  <div className="absolute top-2 right-2 rounded-full bg-green-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Published
                  </div>
                )}
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
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingStory(story);
                      setShowForm(true);
                    }}
                    className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
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

      {showForm && (
        <StoryForm
          story={editingStory || undefined}
          onSubmit={editingStory ? handleUpdate : handleCreate}
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
