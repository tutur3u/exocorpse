"use client";

import ColorPickerGroup from "@/components/admin/forms/ColorPickerGroup";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import { deleteFile } from "@/lib/actions/storage";
import type { Faction } from "@/lib/actions/wiki";
import { updateFaction } from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FactionFormData = {
  world_id: string;
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  faction_type?: string;
  founding_date?: string;
  status?: string;
  primary_goal?: string;
  ideology?: string;
  reputation?: string;
  power_level?: string;
  member_count?: number;
  logo_url?: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_text_color?: string;
  banner_image?: string;
  content?: string;
};

type FactionFormProps = {
  faction?: Faction;
  worldId: string;
  onSubmit: (data: FactionFormData) => Promise<Faction | void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function FactionForm({
  faction,
  worldId,
  onSubmit,
  onComplete,
  onCancel,
}: FactionFormProps) {
  const {
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    hasPendingFiles,
  } = usePendingUploads();

  const [activeTab, setActiveTab] = useState<
    "basic" | "details" | "visuals" | "content"
  >("basic");

  const form = useForm<FactionFormData>({
    defaultValues: {
      world_id: worldId,
      name: faction?.name || "",
      slug: faction?.slug || "",
      description: faction?.description || "",
      summary: faction?.summary || "",
      faction_type: faction?.faction_type || "",
      founding_date: faction?.founding_date || "",
      status: faction?.status || "active",
      primary_goal: faction?.primary_goal || "",
      ideology: faction?.ideology || "",
      reputation: faction?.reputation || "",
      power_level: faction?.power_level || "",
      member_count: faction?.member_count ?? undefined,
      logo_url: faction?.logo_url || "",
      theme_primary_color: faction?.theme_primary_color || "#3b82f6",
      theme_secondary_color: faction?.theme_secondary_color || "#1e40af",
      theme_text_color: faction?.theme_text_color || "#000000",
      banner_image: faction?.banner_image || "",
      content: faction?.content || "",
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
  const themeTextColor = watch("theme_text_color");
  const logoUrl = watch("logo_url");
  const bannerImage = watch("banner_image");
  const content = watch("content");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined and handle number fields
      const cleanData: FactionFormData = cleanFormData(
        data,
        [
          "description",
          "summary",
          "faction_type",
          "founding_date",
          "status",
          "primary_goal",
          "ideology",
          "reputation",
          "power_level",
          "logo_url",
          "color_scheme",
          "banner_image",
          "content",
        ],
        ["member_count"],
      );

      // Submit the faction data
      const result = await onSubmit(cleanData);

      // If we got a result and have pending files, upload them
      if (result && hasPendingFiles) {
        const uploadSuccess = await uploadPendingFiles(
          result.id,
          `factions/${result.id}`,
          async (updates) => {
            await updateFaction(result.id, updates);
          },
        );

        if (!uploadSuccess) {
          setError("Failed to upload images. Please try again.");
          setLoading(false);
          return;
        }
      }

      // All done - close the form and refresh
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  const handleNameChange = (value: string) => {
    setValue("name", value, { shouldDirty: true });
    if (!faction) {
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
        role="button"
        tabIndex={0}
        aria-label="Close and discard changes"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="faction-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="faction-form-title" className="text-2xl font-bold">
              {faction ? "Edit Faction" : "Create New Faction"}
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
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Characteristics
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
              {/* Error Display */}
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3">
                    <svg
                      className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {uploadProgress}
                    </p>
                  </div>
                </div>
              )}

              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="faction-name"
                      className="mb-1 block text-sm font-medium"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="faction-name"
                      {...register("name", {
                        required: true,
                        onChange: (e) => handleNameChange(e.target.value),
                      })}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Exocorpse"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faction-slug"
                      className="mb-1 block text-sm font-medium"
                    >
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="faction-slug"
                      {...register("slug", { required: true })}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="exocorpse"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      URL-friendly identifier (lowercase, hyphens only)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="faction-summary"
                      className="mb-1 block text-sm font-medium"
                    >
                      Summary
                    </label>
                    <input
                      type="text"
                      id="faction-summary"
                      {...register("summary")}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A brief one-line summary"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faction-description"
                      className="mb-1 block text-sm font-medium"
                    >
                      Description
                    </label>
                    <textarea
                      id="faction-description"
                      {...register("description")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A detailed description of the faction..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="faction-faction-type"
                        className="mb-1 block text-sm font-medium"
                      >
                        Faction Type
                      </label>
                      <input
                        type="text"
                        id="faction-faction-type"
                        {...register("faction_type")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="corporation, government, guild, etc."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="faction-status"
                        className="mb-1 block text-sm font-medium"
                      >
                        Status
                      </label>
                      <select
                        id="faction-status"
                        {...register("status")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        <option value="active">Active</option>
                        <option value="defunct">Defunct</option>
                        <option value="hidden">Hidden</option>
                        <option value="dormant">Dormant</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="faction-founding-date"
                        className="mb-1 block text-sm font-medium"
                      >
                        Founding Date
                      </label>
                      <input
                        type="text"
                        id="faction-founding-date"
                        {...register("founding_date")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="2015, 500 years ago, etc."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="faction-member-count"
                        className="mb-1 block text-sm font-medium"
                      >
                        Member Count
                      </label>
                      <input
                        type="number"
                        id="faction-member-count"
                        {...register("member_count", { valueAsNumber: true })}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="1000"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Characteristics Tab */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="faction-primary-goal"
                      className="mb-1 block text-sm font-medium"
                    >
                      Primary Goal
                    </label>
                    <textarea
                      {...register("primary_goal")}
                      id="faction-primary-goal"
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What is this faction trying to achieve?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faction-ideology"
                      className="mb-1 block text-sm font-medium"
                    >
                      Ideology
                    </label>
                    <textarea
                      id="faction-ideology"
                      {...register("ideology")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What beliefs and principles guide this faction?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faction-reputation"
                      className="mb-1 block text-sm font-medium"
                    >
                      Reputation
                    </label>
                    <textarea
                      id="faction-reputation"
                      {...register("reputation")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="How is this faction perceived by others?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faction-power-level"
                      className="mb-1 block text-sm font-medium"
                    >
                      Power Level
                    </label>
                    <select
                      id="faction-power-level"
                      {...register("power_level")}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="">Select power level...</option>
                      <option value="local">
                        Local - Limited to a single area
                      </option>
                      <option value="regional">
                        Regional - Spans multiple areas
                      </option>
                      <option value="global">
                        Global - World-spanning influence
                      </option>
                      <option value="universal">
                        Universal - Multi-world presence
                      </option>
                    </select>
                  </div>
                </div>
              )}

              {/* Visuals Tab */}
              {activeTab === "visuals" && (
                <div className="space-y-4">
                  <ImageUploader
                    label="Logo"
                    value={logoUrl || ""}
                    onChange={(value) =>
                      setValue("logo_url", value, { shouldDirty: true })
                    }
                    onFileSelect={(file) => setPendingFile("logo_url", file)}
                    uploadPath={
                      faction ? `factions/${faction.id}/logo` : undefined
                    }
                    enableUpload={!!faction}
                    onBeforeChange={handleDeleteOldImage}
                    helpText={
                      faction
                        ? "Faction logo or emblem - uploads to secure storage"
                        : "Save faction first to enable image uploads"
                    }
                  />

                  <ColorPickerGroup
                    configs={[
                      {
                        fieldName: "theme_primary_color",
                        label: "Primary Color",
                        valueProp: themePrimaryColor,
                        defaultValue: "#3b82f6",
                        helpText: "Main theme color for this faction",
                        onChange: (value) =>
                          setValue("theme_primary_color", value, {
                            shouldDirty: true,
                          }),
                      },
                      {
                        fieldName: "theme_secondary_color",
                        label: "Secondary Color",
                        valueProp: themeSecondaryColor,
                        defaultValue: "#1e40af",
                        helpText: "Accent color for this faction",
                        onChange: (value) =>
                          setValue("theme_secondary_color", value, {
                            shouldDirty: true,
                          }),
                      },
                      {
                        fieldName: "theme_text_color",
                        label: "Text Color",
                        valueProp: themeTextColor,
                        defaultValue: "#000000",
                        helpText: "Text color for this faction",
                        onChange: (value) =>
                          setValue("theme_text_color", value, {
                            shouldDirty: true,
                          }),
                      },
                    ]}
                  />

                  <ImageUploader
                    label="Banner Image"
                    value={bannerImage || ""}
                    onChange={(value) =>
                      setValue("banner_image", value, { shouldDirty: true })
                    }
                    onFileSelect={(file) =>
                      setPendingFile("banner_image", file)
                    }
                    uploadPath={
                      faction ? `factions/${faction.id}/banner` : undefined
                    }
                    enableUpload={!!faction}
                    onBeforeChange={handleDeleteOldImage}
                    helpText={
                      faction
                        ? "Banner image for faction pages - uploads to secure storage"
                        : "Save faction first to enable image uploads"
                    }
                  />
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  <MarkdownEditor
                    label="Faction Lore"
                    value={content || ""}
                    onChange={(value) =>
                      setValue("content", value, { shouldDirty: true })
                    }
                    placeholder="# History\n\nDescribe the faction's history, structure, notable achievements, and current operations..."
                    helpText="Detailed history and lore. Supports markdown formatting."
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
                  : faction
                    ? "Update Faction"
                    : "Create Faction"}
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
