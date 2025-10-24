"use client";

import ColorPicker from "@/components/shared/ColorPicker";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { deleteFile } from "@/lib/actions/storage";
import type { World } from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";

type WorldFormData = {
  story_id: string;
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  world_type?: string;
  size?: string;
  population?: number;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_background_image?: string;
  theme_map_image?: string;
  content?: string;
};

type WorldFormProps = {
  world?: World;
  storyId: string;
  onSubmit: (data: WorldFormData) => Promise<void>;
  onCancel: () => void;
};

export default function WorldForm({
  world,
  storyId,
  onSubmit,
  onCancel,
}: WorldFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "visuals" | "content">(
    "basic",
  );

  const form = useForm<WorldFormData>({
    defaultValues: {
      story_id: storyId,
      name: world?.name || "",
      slug: world?.slug || "",
      description: world?.description || "",
      summary: world?.summary || "",
      world_type: world?.world_type || "",
      size: world?.size || "",
      population: world?.population ?? undefined,
      theme_primary_color: world?.theme_primary_color || "#3b82f6",
      theme_secondary_color: world?.theme_secondary_color || "#1e40af",
      theme_background_image: world?.theme_background_image || "",
      theme_map_image: world?.theme_map_image || "",
      content: world?.content || "",
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
  const themeBackgroundImage = watch("theme_background_image");
  const themeMapImage = watch("theme_map_image");
  const content = watch("content");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined and handle number fields
      const cleanData: WorldFormData = cleanFormData(
        data,
        [
          "description",
          "summary",
          "world_type",
          "size",
          "theme_primary_color",
          "theme_secondary_color",
          "theme_background_image",
          "theme_map_image",
          "content",
        ],
        ["population"],
      );

      await onSubmit(cleanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  const handleNameChange = (value: string) => {
    setValue("name", value, { shouldDirty: true });
    if (!world) {
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

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  // Helper function to delete old image from storage
  const handleDeleteOldImage = async (oldValue: string, newValue: string) => {
    // Only delete if:
    // 1. The old value exists and is a storage path (not a URL or data URL)
    // 2. The new value is different from the old value
    // 3. The old value is not a full URL (starts with http/https) or data URL
    if (
      oldValue &&
      oldValue !== newValue &&
      !oldValue.startsWith("http://") &&
      !oldValue.startsWith("https://") &&
      !oldValue.startsWith("data:")
    ) {
      try {
        await deleteFile(oldValue);
      } catch (error) {
        console.error("Failed to delete old image:", error);
        // Don't throw - we still want to allow the new image to be set
      }
    }
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close and discard changes"
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="world-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="world-form-title" className="text-2xl font-bold">
              {world ? "Edit World" : "Create New World"}
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
              onClick={() => setActiveTab("visuals")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "visuals"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Visuals
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
                    <label
                      htmlFor="world-name"
                      className="mb-1 block text-sm font-medium"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="world-name"
                      {...register("name", {
                        required: true,
                        onChange: (e) => handleNameChange(e.target.value),
                      })}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Terra Nova"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="world-slug"
                      className="mb-1 block text-sm font-medium"
                    >
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="world-slug"
                      {...register("slug", { required: true })}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="terra-nova"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly identifier (lowercase, hyphens only)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="world-summary"
                      className="mb-1 block text-sm font-medium"
                    >
                      Summary
                    </label>
                    <input
                      type="text"
                      id="world-summary"
                      {...register("summary")}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A brief one-line summary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="world-description"
                      className="mb-1 block text-sm font-medium"
                    >
                      Description
                    </label>
                    <textarea
                      id="world-description"
                      {...register("description")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A detailed description of your world..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="world-world-type"
                        className="mb-1 block text-sm font-medium"
                      >
                        World Type
                      </label>
                      <input
                        type="text"
                        id="world-world-type"
                        {...register("world_type")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="planet, dimension, realm, etc."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="world-size"
                        className="mb-1 block text-sm font-medium"
                      >
                        Size
                      </label>
                      <input
                        type="text"
                        id="world-size"
                        {...register("size")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Continental, Global, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="world-population"
                      className="mb-1 block text-sm font-medium"
                    >
                      Population
                    </label>
                    <input
                      type="number"
                      id="world-population"
                      {...register("population", { valueAsNumber: true })}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="450000000"
                      min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Total population (optional)
                    </p>
                  </div>
                </div>
              )}

              {/* Visuals Tab */}
              {activeTab === "visuals" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customize the visual appearance of this world. These
                    settings can override the story theme.
                  </p>

                  <ColorPicker
                    label="Primary Color"
                    value={themePrimaryColor || "#3b82f6"}
                    onChange={(value) =>
                      setValue("theme_primary_color", value, {
                        shouldDirty: true,
                      })
                    }
                    helpText="Main theme color for this world (overrides story theme)"
                  />

                  <ColorPicker
                    label="Secondary Color"
                    value={themeSecondaryColor || "#1e40af"}
                    onChange={(value) =>
                      setValue("theme_secondary_color", value, {
                        shouldDirty: true,
                      })
                    }
                    helpText="Accent color for this world"
                  />

                  <ImageUploader
                    label="Background Image"
                    value={themeBackgroundImage || ""}
                    onChange={(value) =>
                      setValue("theme_background_image", value, {
                        shouldDirty: true,
                      })
                    }
                    uploadPath={
                      world ? `worlds/${world.id}/background` : undefined
                    }
                    enableUpload={!!world}
                    onBeforeChange={handleDeleteOldImage}
                    helpText={
                      world
                        ? "Background image for world pages - uploads to secure storage"
                        : "Save world first to enable image uploads"
                    }
                  />

                  <ImageUploader
                    label="World Map"
                    value={themeMapImage || ""}
                    onChange={(value) =>
                      setValue("theme_map_image", value, { shouldDirty: true })
                    }
                    uploadPath={world ? `worlds/${world.id}/map` : undefined}
                    enableUpload={!!world}
                    onBeforeChange={handleDeleteOldImage}
                    helpText={
                      world
                        ? "Map image showing this world's geography - uploads to secure storage"
                        : "Save world first to enable image uploads"
                    }
                  />
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <MarkdownEditor
                    label="World Lore"
                    value={content || ""}
                    onChange={(value) =>
                      setValue("content", value, { shouldDirty: true })
                    }
                    placeholder="# World Geography\n\nDescribe your world's history, geography, cultures, and lore..."
                    helpText="Detailed lore and world-building content. Supports markdown formatting."
                    rows={15}
                  />
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
                  : world
                    ? "Update World"
                    : "Create World"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
