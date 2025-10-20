"use client";

import ColorPicker from "@/components/shared/ColorPicker";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { Faction } from "@/lib/actions/wiki";
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
  color_scheme?: string;
  banner_image?: string;
  content?: string;
};

type FactionFormProps = {
  faction?: Faction;
  worldId: string;
  onSubmit: (data: FactionFormData) => Promise<void>;
  onCancel: () => void;
};

export default function FactionForm({
  faction,
  worldId,
  onSubmit,
  onCancel,
}: FactionFormProps) {
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
      color_scheme: faction?.color_scheme || "#3b82f6",
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
  const colorScheme = watch("color_scheme");
  const logoUrl = watch("logo_url");
  const bannerImage = watch("banner_image");
  const content = watch("content");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: FactionFormData = {
        ...data,
        description: data.description || undefined,
        summary: data.summary || undefined,
        faction_type: data.faction_type || undefined,
        founding_date: data.founding_date || undefined,
        status: data.status || undefined,
        primary_goal: data.primary_goal || undefined,
        ideology: data.ideology || undefined,
        reputation: data.reputation || undefined,
        power_level: data.power_level || undefined,
        logo_url: data.logo_url || undefined,
        color_scheme: data.color_scheme || undefined,
        banner_image: data.banner_image || undefined,
        content: data.content || undefined,
      };

      await onSubmit(cleanData);
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
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Exocorpse"
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
                      placeholder="exocorpse"
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
                      placeholder="A detailed description of the faction..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Faction Type
                      </label>
                      <input
                        type="text"
                        {...register("faction_type")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="corporation, government, guild, etc."
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Status
                      </label>
                      <select
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
                      <label className="mb-1 block text-sm font-medium">
                        Founding Date
                      </label>
                      <input
                        type="text"
                        {...register("founding_date")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="2015, 500 years ago, etc."
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Member Count
                      </label>
                      <input
                        type="number"
                        {...register("member_count")}
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
                    <label className="mb-1 block text-sm font-medium">
                      Primary Goal
                    </label>
                    <textarea
                      {...register("primary_goal")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What is this faction trying to achieve?"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Ideology
                    </label>
                    <textarea
                      {...register("ideology")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What beliefs and principles guide this faction?"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Reputation
                    </label>
                    <textarea
                      {...register("reputation")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="How is this faction perceived by others?"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Power Level
                    </label>
                    <select
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
                    helpText="Faction logo or emblem"
                  />

                  <ColorPicker
                    label="Color Scheme"
                    value={colorScheme || "#3b82f6"}
                    onChange={(value) =>
                      setValue("color_scheme", value, { shouldDirty: true })
                    }
                    helpText="Primary color representing this faction"
                  />

                  <ImageUploader
                    label="Banner Image"
                    value={bannerImage || ""}
                    onChange={(value) =>
                      setValue("banner_image", value, { shouldDirty: true })
                    }
                    helpText="Banner image for faction pages"
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
