"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import { usePendingUploads } from "@/hooks/usePendingUploads";
import type { GamePiece, GamePieceGalleryImage } from "@/lib/actions/portfolio";
import {
  addGamePieceGalleryImage,
  deleteGamePieceGalleryImage,
  getGamePieceGalleryImages,
  updateGamePiece,
} from "@/lib/actions/portfolio";
import { deleteGameImage } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type GamePieceFormData = {
  title: string;
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

  const coverImageUrl = watch("cover_image_url");

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

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Validate required title
      if (!data.title || data.title.trim() === "") {
        setError("Title is required");
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
    } catch (err) {
      console.error("Error deleting gallery image:", err);
      toast.error("Failed to delete gallery image");
    }
  };

  const handleAddGalleryImage = async (file: File) => {
    if (!gamePiece?.id) {
      toast.error("Please save the game piece first");
      return;
    }

    try {
      // Upload the image first
      toast.info("Uploading gallery image...");

      // Get highest display order
      const maxOrder = galleryImages.reduce(
        (max, img) => Math.max(max, img.display_order || 0),
        0,
      );

      // For now, store as a placeholder - actual upload will happen via ImageUploader
      // This is a simplified approach - you might want to implement proper upload flow
      const newImage = await addGamePieceGalleryImage({
        game_piece_id: gamePiece.id,
        image_url: "uploading...", // Placeholder
        display_order: maxOrder + 1,
      });

      // Invalidate the query to refetch gallery images
      // This is a simplified way to update the list.
      // A more robust solution would involve a state management library
      // or re-fetching the data directly.
      // For now, we'll just add it to the current list and let react-query
      // handle the refetching based on the queryKey.
      // If you need immediate UI update, you might need to manage a local state
      // or re-fetch the data directly.
      // setGalleryImages((prev) => [...prev, newImage]); // This line is removed
      toast.success("Gallery image added");
    } catch (err) {
      console.error("Error adding gallery image:", err);
      toast.error("Failed to add gallery image");
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
                {...register("title", { required: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gallery Images
                </label>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add multiple images to showcase your game
                </p>
                {/* The gallery images are now fetched via react-query */}
                {galleryImages.length === 0 ? (
                  <div className="mt-2 text-sm text-gray-500">
                    No gallery images yet
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <img
                          src={img.image_url}
                          alt={img.description || "Gallery image"}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteGalleryImage(img.id, img.image_url)
                          }
                          className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
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
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Gallery image management coming soon. For now, images can be
                  added via database.
                </p>
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
