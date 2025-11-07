"use client";

import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import ColorPalettePicker from "@/components/shared/ColorPalettePicker";
import ColorPicker from "@/components/shared/ColorPicker";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { MultiSelect } from "@/components/shared/MultiSelect";
import StorageImage from "@/components/shared/StorageImage";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import { deleteCharacterOutfitImage, deleteFile } from "@/lib/actions/storage";
import type { Character, CharacterDetail, World } from "@/lib/actions/wiki";
import {
  createCharacterGalleryItem,
  createCharacterOutfit,
  deleteCharacterGalleryItem,
  deleteCharacterOutfit,
  getCharacterGallery,
  getCharacterOutfits,
  updateCharacter,
  updateCharacterGalleryItem,
  updateCharacterOutfit,
} from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Tables } from "../../../../supabase/types";
import GalleryItemForm from "./GalleryItemForm";
import OutfitItemForm from "./OutfitItemForm";

type CharacterGalleryItem = Tables<"character_gallery">;
type CharacterOutfitItem = Tables<"character_outfits">;

type CharacterFormData = {
  world_ids: string[]; // Changed from world_id to world_ids
  name: string;
  slug: string;
  nickname?: string;
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
  backstory?: string;
  lore?: string;
  abilities?: string;
  profile_image?: string;
  banner_image?: string;
  color_scheme?: string;
  color_palette?: string[];
  featured_image?: string;
  quote?: string;
  description?: string;
  fanwork_policy?: string;
};

type CharacterFormProps = {
  character?: Character | CharacterDetail;
  worldId?: string;
  preSelectedWorldIds?: string[]; // Pre-selected world IDs when editing
  availableWorlds?: World[]; // Add available worlds for multi-select
  worldsLoading?: boolean; // Loading state for worlds query
  onSubmit: (data: CharacterFormData) => Promise<Character | void>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function CharacterForm({
  character,
  worldId,
  preSelectedWorldIds = [],
  availableWorlds = [],
  worldsLoading = false,
  onSubmit,
  onComplete,
  onCancel,
}: CharacterFormProps) {
  const queryClient = useQueryClient();
  const {
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    hasPendingFiles,
  } = usePendingUploads();

  const [activeTab, setActiveTab] = useState<
    | "basic"
    | "physical"
    | "personality"
    | "history"
    | "abilities"
    | "visuals"
    | "outfits"
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

  // Get form values from character data
  const getFormValues = (): CharacterFormData => ({
    world_ids: getInitialWorldIds(),
    name: character?.name ?? "",
    slug: character?.slug ?? "",
    nickname: character?.nickname ?? "",
    age: character?.age ?? undefined,
    species: character?.species ?? "",
    gender: character?.gender ?? "",
    pronouns: character?.pronouns ?? "",
    height: character?.height ?? "",
    weight: character?.weight ?? "",
    build: character?.build ?? "",
    hair_color: character?.hair_color ?? "",
    eye_color: character?.eye_color ?? "",
    skin_tone: character?.skin_tone ?? "",
    distinguishing_features: character?.distinguishing_features ?? "",
    status:
      (character?.status as
        | "alive"
        | "deceased"
        | "unknown"
        | "missing"
        | "imprisoned") ?? "alive",
    occupation: character?.occupation ?? "",
    personality_summary: character?.personality_summary ?? "",
    backstory: character?.backstory ?? "",
    lore: character?.lore ?? "",
    abilities: character?.abilities ?? "",
    profile_image: character?.profile_image ?? "",
    banner_image: character?.banner_image ?? "",
    color_scheme: character?.color_scheme ?? "#3b82f6",
    color_palette: character?.color_palette ?? [],
    featured_image: character?.featured_image ?? "",
    quote: character?.quote ?? "",
    description: character?.description ?? "",
    fanwork_policy: character?.fanwork_policy ?? "",
  });

  const form = useForm<CharacterFormData>({
    defaultValues: getFormValues(),
  });

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    watch,
    reset,
  } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when character changes to clear dirty state
  useEffect(() => {
    reset(getFormValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character?.id, reset]);

  // UI state
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] =
    useState<CharacterGalleryItem | null>(null);
  const [showOutfitForm, setShowOutfitForm] = useState(false);
  const [editingOutfitItem, setEditingOutfitItem] =
    useState<CharacterOutfitItem | null>(null);
  const [deleteGalleryConfirm, setDeleteGalleryConfirm] = useState(false);
  const [galleryItemToDelete, setGalleryItemToDelete] =
    useState<CharacterGalleryItem | null>(null);
  const [deleteOutfitConfirm, setDeleteOutfitConfirm] = useState(false);
  const [outfitItemToDelete, setOutfitItemToDelete] =
    useState<CharacterOutfitItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFeaturedImagePicker, setShowFeaturedImagePicker] = useState(false);

  // Watch form values for components that need them
  const profileImage = watch("profile_image");
  const bannerImage = watch("banner_image");
  const colorScheme = watch("color_scheme");
  const colorPalette = watch("color_palette");
  const selectedWorldIds = watch("world_ids");
  const featuredImage = watch("featured_image");

  // Fetch gallery items using react-query
  const { data: galleryItems = [], isLoading: loadingGallery } = useQuery({
    queryKey: ["character-gallery", character?.id],
    queryFn: () => getCharacterGallery(character?.id || ""),
    enabled: !!character?.id,
    retry: 1,
  });

  // Fetch outfit items using react-query
  const { data: outfitItems = [], isLoading: loadingOutfits } = useQuery({
    queryKey: ["character-outfits", character?.id],
    queryFn: () => getCharacterOutfits(character?.id || ""),
    enabled: !!character?.id,
    retry: 1,
  });

  // Batch fetch all gallery and outfit image URLs
  // Collect all image paths from gallery and outfit items
  const imagePaths = useMemo(() => {
    const paths: (string | null)[] = [];

    // Add gallery item images and thumbnails
    galleryItems.forEach((item) => {
      if (item.image_url) paths.push(item.image_url);
      if (item.thumbnail_url) paths.push(item.thumbnail_url);
    });

    // Add outfit item images and reference images
    outfitItems.forEach((item) => {
      if (item.image_url) paths.push(item.image_url);
      if (item.reference_images && Array.isArray(item.reference_images)) {
        item.reference_images.forEach((refImg) => {
          if (refImg) paths.push(refImg);
        });
      }
    });

    // Filter out HTTP URLs and data URLs, keep only storage paths
    return paths.filter(
      (p): p is string =>
        !!p &&
        !p.startsWith("http://") &&
        !p.startsWith("https://") &&
        !p.startsWith("data:"),
    );
  }, [galleryItems, outfitItems]);

  const { signedUrls: imageUrls } = useBatchStorageUrls(imagePaths);

  // Collect all candidate images for featured image selection
  const featuredImageCandidates: {
    id: string;
    url: string;
    caption?: string;
  }[] = useMemo(() => {
    if (!character) return [];
    const items: { id: string; url: string; caption?: string }[] = [];

    // Gallery items
    galleryItems.forEach((item) => {
      if (item.image_url) {
        items.push({
          id: item.id,
          url: item.image_url,
          caption: item.title,
        });
      }
    });

    // Outfit items
    outfitItems.forEach((item) => {
      if (item.image_url) {
        items.push({
          id: item.id,
          url: item.image_url,
          caption: item.name,
        });
      }
    });

    // Deduplicate by URL just in case
    const seen = new Set<string>();
    return items.filter((it) => {
      if (seen.has(it.url)) return false;
      seen.add(it.url);
      return true;
    });
  }, [character, galleryItems, outfitItems]);

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
          "backstory",
          "lore",
          "abilities",
          "profile_image",
          "banner_image",
          "color_scheme",
          "featured_image",
          "quote",
          "description",
          "fanwork_policy",
          "color_palette",
        ],
        ["age"],
      );

      // Submit the character data
      const result = await onSubmit(cleanData);

      // If we got a result and have pending files, upload them
      if (result && hasPendingFiles) {
        const uploadSuccess = await uploadPendingFiles(
          result.id,
          `characters/${result.id}`,
          async (updates) => {
            await updateCharacter(result.id, updates);
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

  // Helper function to delete old image from storage
  const handleDeleteOldImage = async (oldValue: string, newValue: string) => {
    // Only delete if:
    // 1. The old value exists and is a storage path (not a URL or data URL)
    // 2. The new value is different from the old value
    // 3. The old value is specifically in the featured image path
    //    (don't delete shared images from gallery/outfits/etc)
    if (
      oldValue &&
      oldValue !== newValue &&
      !oldValue.startsWith("http://") &&
      !oldValue.startsWith("https://") &&
      !oldValue.startsWith("data:") &&
      character &&
      oldValue.includes(`characters/${character.id}/featured`)
    ) {
      try {
        await deleteFile(oldValue);
      } catch (error) {
        console.error("Failed to delete old image:", error);
        // Don't throw - we still want to allow the new image to be set
      }
    }
  };

  // Gallery handlers
  const handleAddGalleryItem = () => {
    setEditingGalleryItem(null);
    setShowGalleryForm(true);
  };

  const handleEditGalleryItem = (item: CharacterGalleryItem) => {
    setEditingGalleryItem(item);
    setShowGalleryForm(true);
  };

  const handleGalleryFormSubmit = async (data: {
    title: string;
    description?: string;
    image_url: string;
    thumbnail_url?: string;
    artist_name?: string;
    artist_url?: string;
    commission_date?: string;
    tags?: string[];
    is_featured?: boolean;
  }) => {
    if (!character?.id) {
      toast.error(
        "Please save the character first before adding gallery items",
      );
      return undefined;
    }

    try {
      if (editingGalleryItem) {
        // Update existing item
        const updated = await updateCharacterGalleryItem(
          editingGalleryItem.id,
          data,
        );
        queryClient.invalidateQueries({
          queryKey: ["character-gallery", character?.id],
        });
        toast.success("Gallery item updated");
        return updated;
      } else {
        // Create new item
        const newItem = await createCharacterGalleryItem({
          character_id: character.id,
          ...data,
          display_order: galleryItems.length,
        });
        queryClient.invalidateQueries({
          queryKey: ["character-gallery", character?.id],
        });
        toast.success("Gallery item added");
        return newItem;
      }
    } catch (err) {
      console.error("Failed to save gallery item:", err);
      toast.error("Failed to save gallery item");
      throw err;
    }
  };

  const handleGalleryComplete = () => {
    setShowGalleryForm(false);
    setEditingGalleryItem(null);
  };

  const handleConfirmDeleteGalleryItem = async () => {
    if (!galleryItemToDelete) return;

    setIsDeleting(true);
    try {
      // Delete from database
      await deleteCharacterGalleryItem(galleryItemToDelete.id);
      queryClient.invalidateQueries({
        queryKey: ["character-gallery", character?.id],
      });

      // Invalidate storage analytics
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });

      toast.success("Gallery item deleted");
      setDeleteGalleryConfirm(false);
      setGalleryItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
      toast.error("Failed to delete gallery item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Outfit handlers
  const handleAddOutfitItem = () => {
    setEditingOutfitItem(null);
    setShowOutfitForm(true);
  };

  const handleEditOutfitItem = (item: CharacterOutfitItem) => {
    setEditingOutfitItem(item);
    setShowOutfitForm(true);
  };

  const handleOutfitFormSubmit = async (data: {
    name: string;
    description?: string;
    image_url?: string;
    reference_images?: string[];
    color_palette?: string;
    notes?: string;
    is_default?: boolean;
    outfit_type_id?: string;
  }) => {
    if (!character?.id) {
      toast.error("Please save the character first before adding outfit items");
      return undefined;
    }

    try {
      if (editingOutfitItem) {
        // Update existing item
        const updated = await updateCharacterOutfit(editingOutfitItem.id, data);
        queryClient.invalidateQueries({
          queryKey: ["character-outfits", character?.id],
        });
        toast.success("Outfit updated");
        return updated;
      } else {
        // Create new item
        const newItem = await createCharacterOutfit({
          character_id: character.id,
          ...data,
          display_order: outfitItems.length,
        });
        queryClient.invalidateQueries({
          queryKey: ["character-outfits", character?.id],
        });
        toast.success("Outfit added");
        return newItem;
      }
    } catch (err) {
      console.error("Failed to save outfit:", err);
      toast.error("Failed to save outfit");
      throw err;
    }
  };

  const handleOutfitComplete = () => {
    setShowOutfitForm(false);
    setEditingOutfitItem(null);
  };

  const handleConfirmDeleteOutfitItem = async () => {
    if (!outfitItemToDelete) return;

    setIsDeleting(true);
    try {
      // Delete from DB
      const deletedFromDB = await deleteCharacterOutfit(outfitItemToDelete.id);
      // Then Delete images from storage
      const deletePromises: Promise<unknown>[] = [];

      // Delete main image if it's a storage path
      if (
        outfitItemToDelete.image_url &&
        !outfitItemToDelete.image_url.startsWith("http") &&
        !outfitItemToDelete.image_url.startsWith("data:") &&
        outfitItemToDelete.image_url.includes("characters/") &&
        deletedFromDB
      ) {
        deletePromises.push(
          deleteCharacterOutfitImage(outfitItemToDelete.image_url).catch(
            (err) => {
              console.error("Error deleting outfit image:", err);
              return undefined;
            },
          ),
        );
      }

      // Delete reference images if they're storage paths
      if (
        outfitItemToDelete.reference_images &&
        outfitItemToDelete.reference_images.length > 0 &&
        deletedFromDB
      ) {
        outfitItemToDelete.reference_images.forEach((refImage) => {
          if (
            !refImage.startsWith("http") &&
            !refImage.startsWith("data:") &&
            refImage.includes("characters/")
          ) {
            deletePromises.push(
              deleteCharacterOutfitImage(refImage).catch((err) => {
                console.error("Error deleting outfit reference image:", err);
                return undefined;
              }),
            );
          }
        });
      }

      // Wait for all storage deletions to complete
      await Promise.all(deletePromises);

      queryClient.invalidateQueries({
        queryKey: ["character-outfits", character?.id],
      });

      // Invalidate storage analytics
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });

      toast.success("Outfit deleted");
      setDeleteOutfitConfirm(false);
      setOutfitItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete outfit:", err);
      toast.error("Failed to delete outfit");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black p-4"
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
          <div className="shrink-0 px-6 pt-6 pb-4">
            <h2 id="character-form-title" className="text-2xl font-bold">
              {character ? "Edit Character" : "Create New Character"}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-gray-300 px-6 dark:border-gray-600">
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
            <button
              type="button"
              onClick={() => setActiveTab("outfits")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === "outfits"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Outfits
            </button>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
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
                        htmlFor="character-quote"
                        className="mb-1 block text-sm font-medium"
                      >
                        Quote
                      </label>
                      <input
                        type="text"
                        id="character-quote"
                        {...register("quote")}
                        className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                        placeholder="The only limit is your mind."
                      />
                    </div>
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
                  </div>

                  <div>
                    <MarkdownEditor
                      label="Description"
                      value={watch("description") || ""}
                      onChange={(value) =>
                        setValue("description", value, { shouldDirty: true })
                      }
                      placeholder="# Description\n\nA brief overview of the character's background, personality, and role in the story..."
                      helpText="Brief description of a character. Supports markdown."
                      rows={5}
                    />
                  </div>
                </div>
              )}

              {/* Physical Tab */}
              {activeTab === "physical" && (
                <div className="space-y-4">
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <MarkdownEditor
                      label="Personality Summary"
                      value={watch("personality_summary") || ""}
                      onChange={(value) =>
                        setValue("personality_summary", value, {
                          shouldDirty: true,
                        })
                      }
                      placeholder="# Personality Summary\n\nDescribe their personality traits, quirks, and motivations..."
                      helpText="Character's personality summary. Supports markdown."
                      rows={12}
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
                    <MarkdownEditor
                      label="Abilities & Skills"
                      value={watch("abilities") || ""}
                      onChange={(value) =>
                        setValue("abilities", value, { shouldDirty: true })
                      }
                      placeholder="# Abilities & Skills\n\nDescribe their special powers, skills, and talents..."
                      helpText="Character's abilities and skills. Supports markdown."
                      rows={12}
                    />
                  </div>
                </div>
              )}

              {/* Visuals Tab */}
              {activeTab === "visuals" && (
                <div className="space-y-6">
                  <ImageUploader
                    label="Profile Image"
                    value={profileImage || ""}
                    onChange={(value) =>
                      setValue("profile_image", value, { shouldDirty: true })
                    }
                    onFileSelect={(file) =>
                      setPendingFile("profile_image", file)
                    }
                    uploadPath={
                      character
                        ? `characters/${character.id}/profile`
                        : undefined
                    }
                    enableUpload={!!character}
                    onBeforeChange={handleDeleteOldImage}
                    disableUrlInput={!!character}
                    helpText={
                      character
                        ? "Main character portrait - uploads to secure storage"
                        : "Enter an image URL. Upload will be available after creation."
                    }
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
                      character
                        ? `characters/${character.id}/banner`
                        : undefined
                    }
                    enableUpload={!!character}
                    onBeforeChange={handleDeleteOldImage}
                    disableUrlInput={!!character}
                    helpText={
                      character
                        ? "Banner image for character page - uploads to secure storage"
                        : "Enter an image URL. Upload will be available after creation."
                    }
                  />

                  <ColorPicker
                    label="Color Scheme"
                    value={colorScheme || "#3b82f6"}
                    onChange={(value) =>
                      setValue("color_scheme", value, { shouldDirty: true })
                    }
                    helpText="Theme color for this character"
                  />

                  {/* Featured Image Section */}
                  {character && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Featured Image
                      </label>
                      <div className="space-y-2 rounded-md border border-gray-200 p-3 dark:border-gray-700">
                        <ImageUploader
                          label="Featured Image"
                          value={featuredImage || ""}
                          onChange={(value) =>
                            setValue("featured_image", value, {
                              shouldDirty: true,
                            })
                          }
                          uploadPath={
                            character
                              ? `characters/${character.id}/featured`
                              : undefined
                          }
                          enableUpload={!!character}
                          onBeforeChange={handleDeleteOldImage}
                          helpText="Upload a new image or choose from existing gallery/outfit images."
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowFeaturedImagePicker(true)}
                            className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                          >
                            Choose from existing
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gallery Section */}
                  <div className="border-t border-gray-300 pt-6 dark:border-gray-600">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          Gallery ({galleryItems.length})
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {character
                            ? "Manage character artwork and images"
                            : "Save the character first to add gallery items"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddGalleryItem}
                        disabled={!character}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add Image
                      </button>
                    </div>

                    {loadingGallery ? (
                      <div className="py-8 text-center text-sm text-gray-500">
                        Loading gallery...
                      </div>
                    ) : galleryItems.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          {character
                            ? "No gallery items yet"
                            : "Create the character first to add gallery items"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 @lg:grid-cols-4">
                        {galleryItems.map((item) => (
                          <div
                            key={item.id}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                          >
                            <StorageImage
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover"
                              signedUrl={imageUrls.get(item.image_url) ?? null}
                            />
                            {item.is_featured && (
                              <div className="absolute top-2 left-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                                Featured
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => handleEditGalleryItem(item)}
                                className="rounded bg-white px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setGalleryItemToDelete(item);
                                  setDeleteGalleryConfirm(true);
                                }}
                                className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-2">
                              <p className="truncate text-xs font-medium text-white">
                                {item.title}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "outfits" && (
                <div className="space-y-6">
                  {/* Color Palette Picker */}
                  <ColorPalettePicker
                    label="Color Palette"
                    value={colorPalette || []}
                    onChange={(value) =>
                      setValue("color_palette", value, { shouldDirty: true })
                    }
                    maxColors={6}
                    helpText="Define up to 6 colors that represent this character's visual theme"
                  />

                  <div>
                    <MarkdownEditor
                      label="Fanwork Policy"
                      value={watch("fanwork_policy") || ""}
                      onChange={(value) =>
                        setValue("fanwork_policy", value, { shouldDirty: true })
                      }
                      placeholder="# Fanwork Policy\n\nDescribe the character's fanwork policy..."
                      helpText="Character's fanwork policy. Supports markdown."
                      rows={12}
                    />
                  </div>
                  {/* Outfits Section */}
                  <div className="border-t border-gray-300 pt-6 dark:border-gray-600">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          Outfits ({outfitItems.length})
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {character
                            ? "Manage character outfits and costumes"
                            : "Save the character first to add outfits"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOutfitItem}
                        disabled={!character}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add Outfit
                      </button>
                    </div>

                    {loadingOutfits ? (
                      <div className="py-8 text-center text-sm text-gray-500">
                        Loading outfits...
                      </div>
                    ) : outfitItems.length === 0 ? (
                      <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          {character
                            ? "No outfits yet"
                            : "Create the character first to add outfits"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4 @lg:grid-cols-4">
                        {outfitItems.map((item) => (
                          <div
                            key={item.id}
                            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                          >
                            {item.image_url ? (
                              <StorageImage
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                signedUrl={
                                  imageUrls.get(item.image_url) ?? null
                                }
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <svg
                                  className="h-12 w-12 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                  />
                                </svg>
                              </div>
                            )}
                            {item.is_default && (
                              <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
                                Default
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => handleEditOutfitItem(item)}
                                className="rounded bg-white px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOutfitItemToDelete(item);
                                  setDeleteOutfitConfirm(true);
                                }}
                                className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                            <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-2">
                              <p className="truncate text-xs font-medium text-white">
                                {item.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-300 px-6 py-4 dark:border-gray-600">
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

      {showGalleryForm && character?.id && (
        <GalleryItemForm
          characterId={character.id}
          galleryItem={editingGalleryItem || undefined}
          onSubmit={handleGalleryFormSubmit}
          onComplete={handleGalleryComplete}
          onCancel={() => {
            setShowGalleryForm(false);
            setEditingGalleryItem(null);
          }}
        />
      )}

      {showOutfitForm && character?.id && (
        <OutfitItemForm
          characterId={character.id}
          outfitItem={editingOutfitItem || undefined}
          onSubmit={handleOutfitFormSubmit}
          onComplete={handleOutfitComplete}
          onCancel={() => {
            setShowOutfitForm(false);
            setEditingOutfitItem(null);
          }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteGalleryConfirm}
        onConfirm={handleConfirmDeleteGalleryItem}
        onCancel={() => {
          setDeleteGalleryConfirm(false);
          setGalleryItemToDelete(null);
        }}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />

      <ConfirmDeleteDialog
        isOpen={deleteOutfitConfirm}
        onConfirm={handleConfirmDeleteOutfitItem}
        onCancel={() => {
          setDeleteOutfitConfirm(false);
          setOutfitItemToDelete(null);
        }}
        title="Delete Outfit"
        message="Are you sure you want to delete this outfit? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
      />

      {/* Featured Image Picker Modal */}
      {showFeaturedImagePicker && character && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowFeaturedImagePicker(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-lg bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Choose existing image</h3>
              <button
                type="button"
                className="rounded px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowFeaturedImagePicker(false)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              {featuredImageCandidates.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No images available yet. Upload gallery or outfit images
                  first.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {featuredImageCandidates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="group relative aspect-square overflow-hidden rounded-md border border-gray-200 text-left hover:ring-2 hover:ring-blue-500 dark:border-gray-700"
                      onClick={() => {
                        setValue("featured_image", item.url, {
                          shouldDirty: true,
                        });
                        setShowFeaturedImagePicker(false);
                      }}
                    >
                      <StorageImage
                        src={item.url}
                        signedUrl={imageUrls.get(item.url) ?? null}
                        alt={item.caption || "Example"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                        <span className="rounded bg-white/80 px-2 py-1 text-xs font-medium text-gray-900">
                          Select
                        </span>
                      </div>
                      {item.caption && (
                        <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-2">
                          <p className="truncate text-xs font-medium text-white">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
