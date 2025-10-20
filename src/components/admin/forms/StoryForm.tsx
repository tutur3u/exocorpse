"use client";

import ColorPicker from "@/components/shared/ColorPicker";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { Story } from "@/lib/actions/wiki";
import { useState } from "react";
import { useForm } from "react-hook-form";

type StoryFormData = {
  title: string;
  slug: string;
  description?: string;
  summary?: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_background_color?: string;
  theme_text_color?: string;
  theme_custom_css?: string;
  theme_background_image?: string;
  content?: string;
  is_published?: boolean;
  visibility?: "public" | "unlisted" | "private";
};

type StoryFormProps = {
  story?: Story;
  onSubmit: (data: StoryFormData) => Promise<void>;
  onCancel: () => void;
};

export default function StoryForm({
  story,
  onSubmit,
  onCancel,
}: StoryFormProps) {
  const [activeTab, setActiveTab] = useState<
    "basic" | "theme" | "content" | "publishing"
  >("basic");

  const form = useForm<StoryFormData>({
    defaultValues: {
      title: story?.title || "",
      slug: story?.slug || "",
      description: story?.description || "",
      summary: story?.summary || "",
      theme_primary_color: story?.theme_primary_color || "#3b82f6",
      theme_secondary_color: story?.theme_secondary_color || "#1e40af",
      theme_background_color: story?.theme_background_color || "#ffffff",
      theme_text_color: story?.theme_text_color || "#000000",
      theme_custom_css: story?.theme_custom_css || "",
      theme_background_image: story?.theme_background_image || "",
      content: story?.content || "",
      is_published: story?.is_published || false,
      visibility:
        (story?.visibility as "public" | "unlisted" | "private") || "private",
    },
  });

  const { register, handleSubmit: formHandleSubmit, setValue, watch } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch form values for components that need them
  const themePrimaryColor = watch("theme_primary_color");
  const themeSecondaryColor = watch("theme_secondary_color");
  const themeBackgroundColor = watch("theme_background_color");
  const themeTextColor = watch("theme_text_color");
  const themeBackgroundImage = watch("theme_background_image");
  const content = watch("content");
  const isPublished = watch("is_published");
  const visibility = watch("visibility");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: StoryFormData = {
        ...data,
        description: data.description || undefined,
        summary: data.summary || undefined,
        theme_primary_color: data.theme_primary_color || undefined,
        theme_secondary_color: data.theme_secondary_color || undefined,
        theme_background_color: data.theme_background_color || undefined,
        theme_text_color: data.theme_text_color || undefined,
        theme_custom_css: data.theme_custom_css || undefined,
        theme_background_image: data.theme_background_image || undefined,
        content: data.content || undefined,
      };

      await onSubmit(cleanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setValue("title", value, { shouldDirty: true });
    if (!story) {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slugValue, { shouldDirty: true });
    }
  };

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        onClick={handleBackdropClick}
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-2xl font-bold">
              {story ? "Edit Story" : "Create New Story"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-300 px-6 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "basic"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("theme")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "theme"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Theme & Style
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "content"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publishing")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "publishing"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Publishing
            </button>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Title *
                    </label>
                    <input
                      type="text"
                      {...register("title", { required: true })}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="My Fantasy Story"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Slug *
                    </label>
                    <input
                      type="text"
                      {...register("slug", { required: true })}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="my-fantasy-story"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly identifier (lowercase, hyphens only)
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Summary
                    </label>
                    <input
                      type="text"
                      {...register("summary")}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A brief one-line summary"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A detailed description of your story..."
                    />
                  </div>
                </div>
              )}

              {/* Theme & Style Tab */}
              {activeTab === "theme" && (
                <div className="space-y-4">
                  <ColorPicker
                    label="Primary Color"
                    value={themePrimaryColor || "#3b82f6"}
                    onChange={(value) =>
                      setValue("theme_primary_color", value, {
                        shouldDirty: true,
                      })
                    }
                    helpText="Main theme color for your story"
                  />

                  <ColorPicker
                    label="Secondary Color"
                    value={themeSecondaryColor || "#1e40af"}
                    onChange={(value) =>
                      setValue("theme_secondary_color", value, {
                        shouldDirty: true,
                      })
                    }
                    helpText="Accent color for highlights and buttons"
                  />

                  <ColorPicker
                    label="Background Color"
                    value={themeBackgroundColor || "#ffffff"}
                    onChange={(value) =>
                      setValue("theme_background_color", value, {
                        shouldDirty: true,
                      })
                    }
                    helpText="Background color for story pages"
                  />

                  <ColorPicker
                    label="Text Color"
                    value={themeTextColor || "#000000"}
                    onChange={(value) =>
                      setValue("theme_text_color", value, { shouldDirty: true })
                    }
                    helpText="Main text color"
                  />

                  <ImageUploader
                    label="Background Image"
                    value={themeBackgroundImage || ""}
                    onChange={(value) =>
                      setValue("theme_background_image", value, {
                        shouldDirty: true,
                      })
                    }
                    helpText="Optional background image for story pages"
                  />

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Custom CSS
                    </label>
                    <textarea
                      {...register("theme_custom_css")}
                      rows={6}
                      className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
                      placeholder=".story-page { /* Your custom CSS */ }"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Advanced: Add custom CSS for your story pages
                    </p>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <MarkdownEditor
                    label="Story Content"
                    value={content || ""}
                    onChange={(value) =>
                      setValue("content", value, { shouldDirty: true })
                    }
                    placeholder="# My Story\n\nWrite your story details here..."
                    helpText="Main content for your story page. Supports markdown formatting."
                    rows={15}
                  />
                </div>
              )}

              {/* Publishing Tab */}
              {activeTab === "publishing" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register("is_published")}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Published</span>
                    </label>
                    <p className="ml-6 text-xs text-gray-500">
                      Make this story visible based on visibility settings below
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Visibility
                    </label>
                    <select
                      {...register("visibility")}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="public">
                        Public - Visible to everyone
                      </option>
                      <option value="unlisted">
                        Unlisted - Visible with direct link
                      </option>
                      <option value="private">
                        Private - Only visible to you
                      </option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Control who can see this story
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-300">
                      Publishing Status
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      {isPublished
                        ? `✓ This story will be ${visibility} once saved.`
                        : "This story is currently unpublished and won't be visible to others regardless of visibility settings."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-300 px-6 py-4 dark:border-gray-600">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : story
                    ? "Update Story"
                    : "Create Story"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
