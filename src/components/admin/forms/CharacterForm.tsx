"use client";

import ColorPicker from "@/components/shared/ColorPicker";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { MultiSelect } from "@/components/shared/MultiSelect";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { Character, CharacterDetail, World } from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";

type CharacterFormData = {
  world_ids: string[]; // Changed from world_id to world_ids
  name: string;
  slug: string;
  nickname?: string;
  title?: string;
  age?: number;
  age_description?: string;
  species?: string;
  gender?: string;
  pronouns?: string;
  height?: string;
  weight?: string;
  build?: string;
  hair_color?: string;
  eye_color?: string;
  skin_tone?: string;
  distinguishing_features?: string;
  status?: "alive" | "deceased" | "unknown" | "missing" | "imprisoned";
  occupation?: string;
  personality_summary?: string;
  likes?: string;
  dislikes?: string;
  fears?: string;
  goals?: string;
  backstory?: string;
  lore?: string;
  skills?: string;
  abilities?: string;
  strengths?: string;
  weaknesses?: string;
  profile_image?: string;
  banner_image?: string;
  color_scheme?: string;
};

type CharacterFormProps = {
  character?: Character | CharacterDetail;
  worldId?: string;
  preSelectedWorldIds?: string[]; // Pre-selected world IDs when editing
  availableWorlds?: World[]; // Add available worlds for multi-select
  worldsLoading?: boolean; // Loading state for worlds query
  onSubmit: (data: CharacterFormData) => Promise<void>;
  onCancel: () => void;
};

export default function CharacterForm({
  character,
  worldId,
  preSelectedWorldIds = [],
  availableWorlds = [],
  worldsLoading = false,
  onSubmit,
  onCancel,
}: CharacterFormProps) {
  const [activeTab, setActiveTab] = useState<
    "basic" | "physical" | "personality" | "history" | "abilities" | "visuals"
  >("basic");

  // Extract world_ids from character if editing
  const getInitialWorldIds = (): string[] => {
    // If editing a character, use the preSelectedWorldIds from the query
    // (which correctly represents the character's worlds, even if empty)
    if (character) {
      return preSelectedWorldIds;
    }

    // For new characters, use the current worldId if provided
    return worldId ? [worldId] : [];
  };

  const form = useForm<CharacterFormData>({
    defaultValues: {
      world_ids: getInitialWorldIds(),
      name: character?.name || "",
      slug: character?.slug || "",
      nickname: character?.nickname || "",
      title: character?.title || "",
      age: character?.age ?? undefined,
      age_description: character?.age_description || "",
      species: character?.species || "",
      gender: character?.gender || "",
      pronouns: character?.pronouns || "",
      height: character?.height || "",
      weight: character?.weight || "",
      build: character?.build || "",
      hair_color: character?.hair_color || "",
      eye_color: character?.eye_color || "",
      skin_tone: character?.skin_tone || "",
      distinguishing_features: character?.distinguishing_features || "",
      status:
        (character?.status as
          | "alive"
          | "deceased"
          | "unknown"
          | "missing"
          | "imprisoned") || "alive",
      occupation: character?.occupation || "",
      personality_summary: character?.personality_summary || "",
      likes: character?.likes || "",
      dislikes: character?.dislikes || "",
      fears: character?.fears || "",
      goals: character?.goals || "",
      backstory: character?.backstory || "",
      lore: character?.lore || "",
      skills: character?.skills || "",
      abilities: character?.abilities || "",
      strengths: character?.strengths || "",
      weaknesses: character?.weaknesses || "",
      profile_image: character?.profile_image || "",
      banner_image: character?.banner_image || "",
      color_scheme: character?.color_scheme || "#3b82f6",
    },
  });

  const { register, handleSubmit: formHandleSubmit, setValue, watch } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch form values for components that need them
  const profileImage = watch("profile_image");
  const bannerImage = watch("banner_image");
  const colorScheme = watch("color_scheme");
  const selectedWorldIds = watch("world_ids");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Ensure at least one world is selected
      if (!data.world_ids || data.world_ids.length === 0) {
        setError("Please select at least one world for this character");
        setLoading(false);
        return;
      }

      // Clean up empty strings to undefined and handle number fields
      const cleanData: CharacterFormData = cleanFormData(
        data,
        [
          "nickname",
          "title",
          "age_description",
          "species",
          "gender",
          "pronouns",
          "height",
          "weight",
          "build",
          "hair_color",
          "eye_color",
          "skin_tone",
          "distinguishing_features",
          "status",
          "occupation",
          "personality_summary",
          "likes",
          "dislikes",
          "fears",
          "goals",
          "backstory",
          "lore",
          "skills",
          "abilities",
          "strengths",
          "weaknesses",
          "profile_image",
          "banner_image",
          "color_scheme",
        ],
        ["age"],
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
    if (!character) {
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

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="character-form-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="character-form-title" className="text-2xl font-bold">
              {character ? "Edit Character" : "Create New Character"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-gray-300 px-6 dark:border-gray-600">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "basic"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("physical")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "physical"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Physical
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("personality")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "personality"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Personality
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "history"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              History & Lore
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("abilities")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "abilities"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Abilities
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("visuals")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "visuals"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Visuals
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
                  {/* World Selection */}
                  {availableWorlds.length > 0 && (
                    <div>
                      {worldsLoading ? (
                        <div className="rounded border border-gray-300 px-4 py-3 dark:border-gray-600">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Loading worlds...
                          </p>
                        </div>
                      ) : (
                        <MultiSelect
                          items={availableWorlds.map((world) => ({
                            id: world.id,
                            name: world.name,
                          }))}
                          selectedIds={selectedWorldIds || []}
                          onChange={(ids) =>
                            setValue("world_ids", ids, { shouldDirty: true })
                          }
                          label="Worlds"
                          placeholder="Search or select worlds..."
                          helperText="This character can exist in multiple worlds"
                          required
                          variant="form"
                        />
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="character-name"
                        className="mb-1 block text-sm font-medium"
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="character-name"
                        {...register("name", {
                          required: true,
                          onChange: (e) => handleNameChange(e.target.value),
                        })}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-nickname"
                        className="mb-1 block text-sm font-medium"
                      >
                        Nickname
                      </label>
                      <input
                        type="text"
                        id="character-nickname"
                        {...register("nickname")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Johnny"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="character-slug"
                        className="mb-1 block text-sm font-medium"
                      >
                        Slug *
                      </label>
                      <input
                        type="text"
                        id="character-slug"
                        {...register("slug", { required: true })}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="john-doe"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-title"
                        className="mb-1 block text-sm font-medium"
                      >
                        Title
                      </label>
                      <input
                        type="text"
                        id="character-title"
                        {...register("title")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Dr., Agent, Commander, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="character-age"
                        className="mb-1 block text-sm font-medium"
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        id="character-age"
                        {...register("age", { valueAsNumber: true })}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="28"
                        min="0"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-age-description"
                        className="mb-1 block text-sm font-medium"
                      >
                        Age Description
                      </label>
                      <input
                        type="text"
                        id="character-age-description"
                        {...register("age_description")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="early 20s, ancient, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="character-species"
                        className="mb-1 block text-sm font-medium"
                      >
                        Species
                      </label>
                      <input
                        type="text"
                        id="character-species"
                        {...register("species")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Human, Elf, etc."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-gender"
                        className="mb-1 block text-sm font-medium"
                      >
                        Gender
                      </label>
                      <input
                        type="text"
                        id="character-gender"
                        {...register("gender")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Male, Female, Non-binary, etc."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-pronouns"
                        className="mb-1 block text-sm font-medium"
                      >
                        Pronouns
                      </label>
                      <input
                        type="text"
                        id="character-pronouns"
                        {...register("pronouns")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="he/him, she/her, they/them"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="character-status"
                        className="mb-1 block text-sm font-medium"
                      >
                        Status
                      </label>
                      <select
                        id="character-status"
                        {...register("status")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        <option value="alive">Alive</option>
                        <option value="deceased">Deceased</option>
                        <option value="unknown">Unknown</option>
                        <option value="missing">Missing</option>
                        <option value="imprisoned">Imprisoned</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="character-occupation"
                        className="mb-1 block text-sm font-medium"
                      >
                        Occupation
                      </label>
                      <input
                        type="text"
                        id="character-occupation"
                        {...register("occupation")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Mercenary, Scholar, etc."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Tab */}
              {activeTab === "physical" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="character-height"
                        className="mb-1 block text-sm font-medium"
                      >
                        Height
                      </label>
                      <input
                        type="text"
                        id="character-height"
                        {...register("height")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="6'2&quot;, 185 cm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-weight"
                        className="mb-1 block text-sm font-medium"
                      >
                        Weight
                      </label>
                      <input
                        type="text"
                        id="character-weight"
                        {...register("weight")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="180 lbs, 80 kg"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-build"
                        className="mb-1 block text-sm font-medium"
                      >
                        Build
                      </label>
                      <input
                        type="text"
                        id="character-build"
                        {...register("build")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Athletic, Slender, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="character-hair-color"
                        className="mb-1 block text-sm font-medium"
                      >
                        Hair Color
                      </label>
                      <input
                        type="text"
                        id="character-hair-color"
                        {...register("hair_color")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Black, Blonde, etc."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-eye-color"
                        className="mb-1 block text-sm font-medium"
                      >
                        Eye Color
                      </label>
                      <input
                        type="text"
                        id="character-eye-color"
                        {...register("eye_color")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Brown, Blue, etc."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="character-skin-tone"
                        className="mb-1 block text-sm font-medium"
                      >
                        Skin Tone
                      </label>
                      <input
                        type="text"
                        id="character-skin-tone"
                        {...register("skin_tone")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="Fair, Tan, Dark, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="character-distinguishing-features"
                      className="mb-1 block text-sm font-medium"
                    >
                      Distinguishing Features
                    </label>
                    <textarea
                      id="character-distinguishing-features"
                      {...register("distinguishing_features")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Scars, tattoos, cybernetic implants, glowing eyes, etc..."
                    />
                  </div>
                </div>
              )}

              {/* Personality Tab */}
              {activeTab === "personality" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="character-personality-summary"
                      className="mb-1 block text-sm font-medium"
                    >
                      Personality Summary
                    </label>
                    <textarea
                      id="character-personality-summary"
                      {...register("personality_summary")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="A brief description of their personality..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-likes"
                      className="mb-1 block text-sm font-medium"
                    >
                      Likes
                    </label>
                    <textarea
                      id="character-likes"
                      {...register("likes")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What they enjoy or appreciate..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-dislikes"
                      className="mb-1 block text-sm font-medium"
                    >
                      Dislikes
                    </label>
                    <textarea
                      id="character-dislikes"
                      {...register("dislikes")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What they dislike or avoid..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-fears"
                      className="mb-1 block text-sm font-medium"
                    >
                      Fears
                    </label>
                    <textarea
                      id="character-fears"
                      {...register("fears")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Their deepest fears..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-goals"
                      className="mb-1 block text-sm font-medium"
                    >
                      Goals
                    </label>
                    <textarea
                      id="character-goals"
                      {...register("goals")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What they're trying to achieve..."
                    />
                  </div>
                </div>
              )}

              {/* History & Lore Tab */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <MarkdownEditor
                    label="Backstory"
                    value={watch("backstory") || ""}
                    onChange={(value) =>
                      setValue("backstory", value, { shouldDirty: true })
                    }
                    placeholder="# Backstory\n\nDescribe their personal history, how they came to be who they are..."
                    helpText="Character's personal history and background. Supports markdown."
                    rows={12}
                  />

                  <MarkdownEditor
                    label="Additional Lore"
                    value={watch("lore") || ""}
                    onChange={(value) =>
                      setValue("lore", value, { shouldDirty: true })
                    }
                    placeholder="# Additional Lore\n\nAny extra world-building details, connections to other characters or events..."
                    helpText="Extra lore and world-building details. Supports markdown."
                    rows={8}
                  />
                </div>
              )}

              {/* Abilities Tab */}
              {activeTab === "abilities" && (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="character-skills"
                      className="mb-1 block text-sm font-medium"
                    >
                      Skills
                    </label>
                    <textarea
                      id="character-skills"
                      {...register("skills")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Combat, hacking, piloting, etc..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-abilities"
                      className="mb-1 block text-sm font-medium"
                    >
                      Abilities
                    </label>
                    <textarea
                      id="character-abilities"
                      {...register("abilities")}
                      rows={4}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Special powers, magic, superhuman traits..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-strengths"
                      className="mb-1 block text-sm font-medium"
                    >
                      Strengths
                    </label>
                    <textarea
                      id="character-strengths"
                      {...register("strengths")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="What they excel at..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="character-weaknesses"
                      className="mb-1 block text-sm font-medium"
                    >
                      Weaknesses
                    </label>
                    <textarea
                      id="character-weaknesses"
                      {...register("weaknesses")}
                      rows={3}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Their vulnerabilities and limitations..."
                    />
                  </div>
                </div>
              )}

              {/* Visuals Tab */}
              {activeTab === "visuals" && (
                <div className="space-y-4">
                  <ImageUploader
                    label="Profile Image"
                    value={profileImage || ""}
                    onChange={(value) =>
                      setValue("profile_image", value, { shouldDirty: true })
                    }
                    helpText="Main character portrait"
                  />

                  <ImageUploader
                    label="Banner Image"
                    value={bannerImage || ""}
                    onChange={(value) =>
                      setValue("banner_image", value, { shouldDirty: true })
                    }
                    helpText="Banner image for character page"
                  />

                  <ColorPicker
                    label="Color Scheme"
                    value={colorScheme || "#3b82f6"}
                    onChange={(value) =>
                      setValue("color_scheme", value, { shouldDirty: true })
                    }
                    helpText="Theme color for this character"
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
                  : character
                    ? "Update Character"
                    : "Create Character"}
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
