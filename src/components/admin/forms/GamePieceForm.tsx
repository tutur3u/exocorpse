"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import StorageImage from "@/components/shared/StorageImage";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import type { GamePiece, GamePieceGalleryImage } from "@/lib/actions/portfolio";
import {
  addGamePieceGalleryImage,
  deleteGamePieceGalleryImage,
  getGamePieceGalleryImages,
  updateGamePiece,
  updateGamePieceGalleryImage,
} from "@/lib/actions/portfolio";
import { deleteGameImage } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type GamePieceFormData = {
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  game_url?: string;
};

type GamePieceFormProps = {
  gamePiece?: GamePiece;
  onSubmit: (data: GamePieceFormData) => Promise<GamePiece>;
  onComplete: () => void;
  onCancel: () => void;
};

export default function GamePieceForm({
  gamePiece,
  onSubmit,
  onComplete,
  onCancel,
}: GamePieceFormProps) {
  const {
    setPendingFile,
    uploadPendingFiles,
    uploadProgress,
    hasPendingFiles,
  } = usePendingUploads();

  // Get form values from game piece data
  const getFormValues = (): GamePieceFormData => ({
    title: gamePiece?.title ?? "",
    slug: gamePiece?.slug ?? "",
    description: gamePiece?.description ?? "",
    cover_image_url: gamePiece?.cover_image_url ?? "",
    game_url: gamePiece?.game_url ?? "",
  });

  const form = useForm<GamePieceFormData>({
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

  const queryClient = useQueryClient();
  const coverImageUrl = watch("cover_image_url");
  const description = watch("description");

  // Reset form when game piece changes to clear dirty state
  useEffect(() => {
    reset(getFormValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePiece?.id, reset]);

  // Fetch gallery images with react-query
  const { data: galleryImages = [] } = useQuery<GamePieceGalleryImage[]>({
    queryKey: ["game-piece-gallery", gamePiece?.id],
    queryFn: () =>
      gamePiece?.id ? getGamePieceGalleryImages(gamePiece.id) : [],
    enabled: !!gamePiece?.id,
  });

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setValue("title", value, { shouldDirty: true });
    if (!gamePiece) {
      const slugValue = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const finalSlug = slugValue || `art-${Date.now()}`;
      setValue("slug", finalSlug, { shouldDirty: true });
    }
  };

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!data.title || data.title.trim() === "") {
        setError("Title is required");
        setLoading(false);
        return;
      }

      if (!data.slug || data.slug.trim() === "") {
        setError("Slug is required");
        setLoading(false);
        return;
      }

      // Clean up empty strings to undefined
      const cleanData: GamePieceFormData = cleanFormData(
        data,
        ["description", "cover_image_url", "game_url"],
        [],
      );

      // Submit the game piece data
      const result = await onSubmit(cleanData);

      // If we got a result and have pending files, upload them
      if (result && hasPendingFiles) {
        const uploadSuccess = await uploadPendingFiles(
          result.id,
          `portfolio/games/${result.id}`,
          async (updates) => {
            await updateGamePiece(result.id, updates);
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
      setError(
        err instanceof Error ? err.message : "Failed to save game piece",
      );
      setLoading(false);
    }
  });

  const handleDeleteGalleryImage = async (
    imageId: string,
    imageUrl: string,
  ) => {
    if (!confirm("Are you sure you want to delete this gallery image?")) {
      return;
    }

    try {
      await deleteGamePieceGalleryImage(imageId);
      toast.success("Gallery image deleted");

      // Delete from storage if it's not an external URL
      if (!imageUrl.startsWith("http")) {
        await deleteGameImage(imageUrl);
      }

      // Refetch gallery images
      if (gamePiece?.id) {
        queryClient.invalidateQueries({
          queryKey: ["game-piece-gallery", gamePiece.id],
        });
      }
    } catch (err) {
      console.error("Error deleting gallery image:", err);
      toast.error("Failed to delete gallery image");
    }
  };

  const handleMoveGalleryImage = async (
    imageId: string,
    direction: "up" | "down",
  ) => {
    if (!gamePiece?.id) return;

    try {
      const currentIndex = galleryImages.findIndex((img) => img.id === imageId);
      if (currentIndex === -1) return;

      // Can't move up if at the start, can't move down if at the end
      if (
        (direction === "up" && currentIndex === 0) ||
        (direction === "down" && currentIndex === galleryImages.length - 1)
      ) {
        return;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const targetImage = galleryImages[targetIndex];

      // Swap display orders
      const currentOrder = galleryImages[currentIndex].display_order || 0;
      const targetOrder = targetImage.display_order || 0;

      // Update both images
      await Promise.all([
        updateGamePieceGalleryImage(imageId, {
          display_order: targetOrder,
        }),
        updateGamePieceGalleryImage(targetImage.id, {
          display_order: currentOrder,
        }),
      ]);

      // Refetch gallery images to show new order
      queryClient.invalidateQueries({
        queryKey: ["game-piece-gallery", gamePiece.id],
      });

      toast.success(`Image moved ${direction}`);
    } catch (err) {
      console.error("Error moving gallery image:", err);
      toast.error("Failed to move image");
    }
  };

  const [showGalleryUploader, setShowGalleryUploader] = useState(false);
  const [newGalleryImage, setNewGalleryImage] = useState<string>("");
  const [newGalleryDescription, setNewGalleryDescription] =
    useState<string>("");
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const handleAddGalleryImage = async () => {
    if (!gamePiece?.id) {
      toast.error("Please save the game piece first");
      return;
    }

    if (!newGalleryImage || newGalleryImage.trim() === "") {
      toast.error("Please provide an image");
      return;
    }

    setUploadingGallery(true);

    try {
      // Get highest display order
      const maxOrder = galleryImages.reduce(
        (max, img) => Math.max(max, img.display_order || 0),
        0,
      );

      await addGamePieceGalleryImage({
        game_piece_id: gamePiece.id,
        image_url: newGalleryImage,
        description: newGalleryDescription || undefined,
        display_order: maxOrder + 1,
      });

      toast.success("Gallery image added");

      // Reset form and close uploader
      setNewGalleryImage("");
      setNewGalleryDescription("");
      setShowGalleryUploader(false);

      // Refetch gallery images
      queryClient.invalidateQueries({
        queryKey: ["game-piece-gallery", gamePiece.id],
      });
    } catch (err) {
      console.error("Error adding gallery image:", err);
      toast.error("Failed to add gallery image");
    } finally {
      setUploadingGallery(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {gamePiece ? "Edit Game" : "Add Game"}
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6 p-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register("title", {
                  required: true,
                  onChange: (e) => handleTitleChange(e.target.value),
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                {...register("slug", { required: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="url-friendly-name"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                URL-friendly identifier (e.g., &quot;my-game&quot;)
              </p>
            </div>

            {/* Description */}
            <MarkdownEditor
              label="Description"
              value={description || ""}
              onChange={(value) =>
                setValue("description", value, { shouldDirty: true })
              }
              placeholder="Enter a description for your game (supports markdown formatting)..."
              helpText="Describe your game using markdown. You can add formatting, lists, links, and more."
              rows={8}
            />

            {/* Game URL */}
            <div>
              <label
                htmlFor="game_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Game URL
              </label>
              <input
                type="url"
                id="game_url"
                {...register("game_url")}
                placeholder="https://example.com/game"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Cover Image */}
            <div>
              <ImageUploader
                label="Cover Image"
                value={coverImageUrl || ""}
                onChange={(url: string) => setValue("cover_image_url", url)}
                onFileSelect={(file) => {
                  setPendingFile("cover_image_url", file);
                }}
                onBeforeChange={async (oldValue) => {
                  if (oldValue && !oldValue.startsWith("http")) {
                    await deleteGameImage(oldValue);
                  }
                }}
                helpText="Upload a cover image for your game (16:9 aspect ratio recommended)"
                uploadPath={
                  gamePiece?.id ? `portfolio/games/${gamePiece.id}` : undefined
                }
              />
            </div>

            {/* Gallery Images Section */}
            {gamePiece && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Gallery Images
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowGalleryUploader(!showGalleryUploader)}
                    className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                  >
                    {showGalleryUploader ? "Cancel" : "Add Image"}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add multiple images to showcase your game
                </p>

                {/* Add Gallery Image Form */}
                {showGalleryUploader && (
                  <div className="mt-3 space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div>
                      <ImageUploader
                        label="Gallery Image *"
                        value={newGalleryImage}
                        onChange={setNewGalleryImage}
                        onFileSelect={(file) => {
                          setPendingFile("new_gallery_image", file);
                        }}
                        uploadPath={`portfolio/games/${gamePiece.id}/gallery`}
                        helpText="Upload an image for the gallery"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gallery_description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Description (Optional)
                      </label>
                      <textarea
                        id="gallery_description"
                        value={newGalleryDescription}
                        onChange={(e) =>
                          setNewGalleryDescription(e.target.value)
                        }
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Optional description for this image"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowGalleryUploader(false);
                          setNewGalleryImage("");
                          setNewGalleryDescription("");
                        }}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddGalleryImage}
                        disabled={uploadingGallery || !newGalleryImage}
                        className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {uploadingGallery ? "Adding..." : "Add Image"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Gallery Images Grid */}
                {galleryImages.length === 0 ? (
                  <div className="mt-3 rounded-md border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-600">
                    No gallery images yet. Click "Add Image" to get started.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {galleryImages.length} image
                      {galleryImages.length !== 1 ? "s" : ""} • Drag or use
                      buttons to reorder
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {galleryImages.map((img, index) => (
                        <div key={img.id} className="group relative">
                          <div className="relative aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                            <StorageImage
                              src={img.image_url}
                              alt={img.description || "Gallery image"}
                              className="h-full w-full object-cover"
                              fill
                            />
                            {img.description && (
                              <div className="absolute right-0 bottom-0 left-0 bg-black/60 px-2 py-1 text-xs text-white">
                                {img.description}
                              </div>
                            )}
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteGalleryImage(img.id, img.image_url)
                              }
                              className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                              title="Delete image"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                          {/* Move Controls */}
                          <div className="mt-2 flex justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveGalleryImage(img.id, "up")
                              }
                              disabled={index === 0}
                              title="Move up"
                              className="flex items-center justify-center rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveGalleryImage(img.id, "down")
                              }
                              disabled={index === galleryImages.length - 1}
                              title="Move down"
                              className="flex items-center justify-center rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {uploadProgress}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={() => handleExit(onCancel)}
                disabled={loading}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : gamePiece ? "Update" : "Create"}
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
