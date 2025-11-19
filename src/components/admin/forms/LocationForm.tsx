"use client";

import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import LocationGalleryItemForm from "@/components/admin/forms/LocationGalleryItemForm";
import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import StorageImage from "@/components/shared/StorageImage";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import { deleteFile } from "@/lib/actions/storage";
import type { Location, World } from "@/lib/actions/wiki";
import {
  createLocationGalleryItem,
  deleteLocationGalleryItem,
  getLocationGallery,
  updateLocation,
  updateLocationGalleryItem,
} from "@/lib/actions/wiki";
import { cleanFormData } from "@/lib/forms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Tables } from "../../../../supabase/types";

type LocationGalleryItem = Tables<"locations_gallery_images">;

type LocationFormData = {
  world_id: string;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  geography?: string;
  history?: string;
  image_url?: string;
  banner_image?: string;
  map_image?: string;
  parent_location_id?: string;
};

type LocationFormProps = {
  location?: Location;
  worldId?: string;
  availableWorlds?: World[];
  availableLocations?: Location[];
  onSubmit: (data: LocationFormData) => Promise<Location | void>;
  onComplete: () => void;
  onCancel: () => void;
};

type LocationFormTab = "basic" | "content" | "images" | "gallery";

export default function LocationForm({
  location,
  worldId,
  availableWorlds = [],
  availableLocations = [],
  onSubmit,
  onComplete,
  onCancel,
}: LocationFormProps) {
  const queryClient = useQueryClient();
  const {
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    hasPendingFiles,
  } = usePendingUploads();

  const [activeTab, setActiveTab] = useState<LocationFormTab>("basic");
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] =
    useState<LocationGalleryItem | null>(null);
  const [deleteGalleryConfirm, setDeleteGalleryConfirm] = useState(false);
  const [galleryItemToDelete, setGalleryItemToDelete] =
    useState<LocationGalleryItem | null>(null);

  const form = useForm<LocationFormData>({
    defaultValues: {
      world_id: worldId || location?.world_id || "",
      name: location?.name || "",
      slug: location?.slug || "",
      summary: location?.summary || "",
      description: location?.description || "",
      geography: location?.geography || "",
      history: location?.history || "",
      image_url: location?.image_url || "",
      banner_image: location?.banner_image || "",
      map_image: location?.map_image || "",
      parent_location_id: location?.parent_location_id || "",
    },
  });

  const { register, handleSubmit: formHandleSubmit, setValue, watch } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch form values
  const selectedWorldId = watch("world_id");
  const imageUrl = watch("image_url");
  const bannerImage = watch("banner_image");
  const mapImage = watch("map_image");
  const summary = watch("summary");
  const description = watch("description");
  const geography = watch("geography");
  const history = watch("history");

  // Fetch gallery items for existing location
  const {
    data: galleryItems = [],
    isLoading: loadingGallery,
    refetch: refetchGallery,
  } = useQuery({
    queryKey: ["location-gallery", location?.id],
    queryFn: () => getLocationGallery(location?.id || ""),
    enabled: !!location?.id,
    retry: 1,
  });

  // Batch fetch all gallery image URLs
  const imagePaths = useMemo(() => {
    const paths: (string | null)[] = [];

    // Add gallery item images and thumbnails
    galleryItems.forEach((item) => {
      if (item.image_url) paths.push(item.image_url);
      if (item.thumbnail_url) paths.push(item.thumbnail_url);
    });

    // Filter out HTTP URLs and data URLs, keep only storage paths
    return paths.filter(
      (p): p is string =>
        !!p &&
        !p.startsWith("http://") &&
        !p.startsWith("https://") &&
        !p.startsWith("data:"),
    );
  }, [galleryItems]);

  const { signedUrls: imageUrls } = useBatchStorageUrls(imagePaths);

  // Sync world_id when worldId prop changes
  useEffect(() => {
    if (worldId && !location) {
      setValue("world_id", worldId);
    }
  }, [worldId, location, setValue]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined and handle number fields
      const cleanData: LocationFormData = cleanFormData(data, [
        "summary",
        "description",
        "geography",
        "history",
        "image_url",
        "banner_image",
        "map_image",
        "parent_location_id",
      ]);

      // Submit the location data
      const result = await onSubmit(cleanData);

      // If we got a result and have pending files, upload them
      if (result && hasPendingFiles) {
        const uploadSuccess = await uploadPendingFiles(
          result.id,
          `locations/${result.id}`,
          async (updates) => {
            await updateLocation(result.id, updates);
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
    const slugValue = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", slugValue, { shouldDirty: true });
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
    if (
      oldValue &&
      oldValue !== newValue &&
      !oldValue.startsWith("http://") &&
      !oldValue.startsWith("https://") &&
      !oldValue.startsWith("data:") &&
      location &&
      oldValue.includes(`locations/${location.id}/`)
    ) {
      try {
        await deleteFile(oldValue);
      } catch (error) {
        console.error("Failed to delete old image:", error);
      }
    }
  };

  // Gallery handlers
  const handleAddGalleryItem = () => {
    setEditingGalleryItem(null);
    setShowGalleryForm(true);
  };

  const handleEditGalleryItem = (item: LocationGalleryItem) => {
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
    if (!location?.id) {
      toast.error("Please save the location first before adding gallery items");
      return undefined;
    }

    try {
      if (editingGalleryItem) {
        // Update existing item
        const updated = await updateLocationGalleryItem(
          editingGalleryItem.id,
          data,
        );
        queryClient.invalidateQueries({
          queryKey: ["location-gallery", location?.id],
        });
        toast.success("Gallery item updated");
        return updated;
      } else {
        // Create new item
        const newItem = await createLocationGalleryItem({
          location: location.id,
          ...data,
          display_order: galleryItems.length,
        });
        queryClient.invalidateQueries({
          queryKey: ["location-gallery", location?.id],
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

    try {
      // Delete from database
      await deleteLocationGalleryItem(galleryItemToDelete.id);

      // Refresh gallery items
      await refetchGallery();
      queryClient.invalidateQueries({
        queryKey: ["location-gallery", location?.id],
      });

      toast.success("Gallery item deleted");
    } catch (err) {
      console.error("Failed to delete gallery item:", err);
      toast.error("Failed to delete gallery item");
    } finally {
      setDeleteGalleryConfirm(false);
      setGalleryItemToDelete(null);
    }
  };

  // Filter locations to exclude self and descendants (to prevent circular parent relationships)
  const availableParentLocations = useMemo(() => {
    if (!location) return availableLocations;

    // For simplicity, just exclude the current location
    // In a more robust implementation, you'd also exclude all descendants
    return availableLocations.filter((loc) => loc.id !== location.id);
  }, [availableLocations, location]);

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
          className="animate-slideUp flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="location-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="location-form-title" className="text-2xl font-bold">
              {location ? "Edit Location" : "Create New Location"}
            </h2>
          </div>

          {/* Tabs */}
          {/* Tabs */}
          {/* Tabs - Mobile Dropdown */}
          <div className="border-b border-gray-300 px-6 pb-4 sm:hidden dark:border-gray-600">
            <label htmlFor="tabs" className="sr-only">
              Select a tab
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as LocationFormTab)}
            >
              <option value="basic">Basic Info</option>
              <option value="content">Content</option>
              <option value="images">Images</option>
              <option value="gallery">Gallery</option>
            </select>
          </div>

          {/* Tabs - Desktop */}
          <div className="hidden gap-1 border-b border-gray-300 px-6 sm:flex dark:border-gray-600">
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
              onClick={() => setActiveTab("images")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "images"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Images
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "gallery"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Gallery
              {galleryItems.length > 0 && (
                <span className="ml-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                  {galleryItems.length}
                </span>
              )}
            </button>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Error Display */}
              {error && (
                <div
                  className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20"
                  role="alert"
                  aria-live="assertive"
                >
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
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      World *
                    </label>
                    <select
                      {...register("world_id", { required: true })}
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a world</option>
                      {availableWorlds.map((world) => (
                        <option key={world.id} value={world.id}>
                          {world.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register("name", { required: true })}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter location name"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Slug *
                    </label>
                    <input
                      type="text"
                      {...register("slug", { required: true })}
                      className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
                      placeholder="location-slug"
                    />
                  </div>

                  {/* Parent Location */}
                  {selectedWorldId && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Parent Location
                      </label>
                      <select
                        {...register("parent_location_id")}
                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">None (Top Level)</option>
                        {availableParentLocations
                          .filter((loc) => loc.world_id === selectedWorldId)
                          .map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Optional: Set if this location is within another
                        location
                      </p>
                    </div>
                  )}

                  {/* Summary */}
                  <div>
                    <MarkdownEditor
                      label="Summary"
                      value={summary || ""}
                      onChange={(value) =>
                        setValue("summary", value, { shouldDirty: true })
                      }
                      placeholder="Brief summary of the location..."
                    />
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <MarkdownEditor
                      label="Description"
                      value={description || ""}
                      onChange={(value) =>
                        setValue("description", value, { shouldDirty: true })
                      }
                      placeholder="Detailed description of the location..."
                    />
                  </div>

                  {/* Geography */}
                  <div>
                    <MarkdownEditor
                      label="Geography"
                      value={geography || ""}
                      onChange={(value) =>
                        setValue("geography", value, { shouldDirty: true })
                      }
                      placeholder="Geographical features, terrain, climate..."
                    />
                  </div>

                  {/* History */}
                  <div>
                    <MarkdownEditor
                      label="History"
                      value={history || ""}
                      onChange={(value) =>
                        setValue("history", value, { shouldDirty: true })
                      }
                      placeholder="Historical information, founding, significant events..."
                    />
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  {/* Main Image */}
                  <div>
                    <ImageUploader
                      label="Main Image"
                      value={imageUrl || ""}
                      onChange={(value) =>
                        setValue("image_url", value, { shouldDirty: true })
                      }
                      onFileSelect={(file) => setPendingFile("image_url", file)}
                      uploadPath={
                        location ? `locations/${location.id}/main` : undefined
                      }
                      enableUpload={!!location}
                      onBeforeChange={handleDeleteOldImage}
                      disableUrlInput={!!location}
                      helpText={
                        location
                          ? "Main location image - uploads to secure storage"
                          : "Upload will be available after creation."
                      }
                    />
                  </div>

                  {/* Banner Image */}
                  <div>
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
                        location ? `locations/${location.id}/banner` : undefined
                      }
                      enableUpload={!!location}
                      onBeforeChange={handleDeleteOldImage}
                      disableUrlInput={!!location}
                      helpText={
                        location
                          ? "Banner image for the location page"
                          : "Upload will be available after creation."
                      }
                    />
                  </div>

                  {/* Map Image */}
                  <div>
                    <ImageUploader
                      label="Map Image"
                      value={mapImage || ""}
                      onChange={(value) =>
                        setValue("map_image", value, { shouldDirty: true })
                      }
                      onFileSelect={(file) => setPendingFile("map_image", file)}
                      uploadPath={
                        location ? `locations/${location.id}/map` : undefined
                      }
                      enableUpload={!!location}
                      onBeforeChange={handleDeleteOldImage}
                      disableUrlInput={!!location}
                      helpText={
                        location
                          ? "Map or layout of the location"
                          : "Upload will be available after creation."
                      }
                    />
                  </div>
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        Gallery ({galleryItems.length})
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {location
                          ? "Manage location images and artwork"
                          : "Save the location first to add gallery items"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddGalleryItem}
                      disabled={!location}
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
                        {location
                          ? "No gallery items yet"
                          : "Create the location first to add gallery items"}
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
                          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancelClick}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : location ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showGalleryForm && location?.id && (
        <LocationGalleryItemForm
          locationId={location.id}
          galleryItem={editingGalleryItem || undefined}
          onSubmit={handleGalleryFormSubmit}
          onComplete={handleGalleryComplete}
          onCancel={() => {
            setShowGalleryForm(false);
            setEditingGalleryItem(null);
          }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteGalleryConfirm}
        title="Delete Gallery Item"
        message="Are you sure you want to delete this gallery item? This action cannot be undone."
        onConfirm={handleConfirmDeleteGalleryItem}
        onCancel={() => {
          setDeleteGalleryConfirm(false);
          setGalleryItemToDelete(null);
        }}
      />

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
