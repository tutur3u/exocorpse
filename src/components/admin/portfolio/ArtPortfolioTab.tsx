"use client";

import ArtPieceForm from "@/components/admin/forms/ArtPieceForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import type { ArtPiece } from "@/lib/actions/portfolio";
import {
  createArtPiece,
  deleteArtPiece,
  getAllArtPiecesAdmin,
  updateArtPiece,
} from "@/lib/actions/portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type ArtPortfolioTabProps = {
  initialArtPieces: ArtPiece[];
  imageUrls: Map<string, string>;
};

export default function ArtPortfolioTab({
  initialArtPieces,
  imageUrls,
}: ArtPortfolioTabProps) {
  const queryClient = useQueryClient();
  const [artPieces, setArtPieces] = useState(initialArtPieces);
  const [showArtForm, setShowArtForm] = useState(false);
  const [editingArt, setEditingArt] = useState<ArtPiece | null>(null);
  const [deletingArt, setDeletingArt] = useState<ArtPiece | null>(null);

  const handleAddArt = () => {
    setEditingArt(null);
    setShowArtForm(true);
  };

  const handleEditArt = (art: ArtPiece) => {
    setEditingArt(art);
    setShowArtForm(true);
  };

  const handleArtSubmit = async (data: {
    title: string;
    slug: string;
    description?: string;
    image_url: string;
    thumbnail_url?: string;
    year?: number;
    created_date?: string;
    tags?: string[];
    is_featured?: boolean;
    artist_name?: string;
    artist_url?: string;
  }) => {
    try {
      if (editingArt) {
        const updated = await updateArtPiece(editingArt.id, {
          ...data,
        });
        setArtPieces((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success("Artwork updated successfully");
        return updated;
      } else {
        const newArt = await createArtPiece({
          ...data,
          display_order: artPieces.length,
        });
        setArtPieces((prev) => [newArt, ...prev]);
        toast.success("Artwork created successfully");
        return newArt;
      }
    } catch (error) {
      console.error("Failed to save artwork:", error);
      toast.error("Failed to save artwork");
      throw error;
    }
  };

  const handleArtComplete = async () => {
    // Refresh to show uploaded images
    try {
      const refreshedArt = await getAllArtPiecesAdmin();
      setArtPieces(refreshedArt);
    } catch (error) {
      console.error("Failed to refresh art pieces:", error);
    }
    setShowArtForm(false);
    setEditingArt(null);
  };

  const handleDeleteArt = async () => {
    if (!deletingArt) return;

    try {
      await deleteArtPiece(deletingArt.id);
      setArtPieces((prev) => prev.filter((item) => item.id !== deletingArt.id));
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });
      toast.success("Artwork deleted successfully");
    } catch (error) {
      console.error("Failed to delete artwork:", error);
      toast.error("Failed to delete artwork");
    } finally {
      setDeletingArt(null);
    }
  };

  return (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Art Portfolio
          </h2>
          <button
            type="button"
            onClick={handleAddArt}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Artwork
          </button>
        </div>

        {artPieces.length === 0 ? (
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
            <p className="mt-2 text-sm text-gray-500">No artwork yet</p>
            <button
              type="button"
              onClick={handleAddArt}
              className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Add your first artwork
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artPieces.map((art) => (
              <div
                key={art.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <StorageImage
                    src={art.image_url}
                    signedUrl={imageUrls.get(art.image_url)}
                    alt={art.title}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {art.title}
                  </h3>
                  {art.year && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {art.year}
                    </p>
                  )}
                  {art.tags && art.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {art.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditArt(art)}
                      className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingArt(art)}
                      className="flex-1 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      {showArtForm && (
        <ArtPieceForm
          artPiece={editingArt || undefined}
          onSubmit={handleArtSubmit}
          onComplete={handleArtComplete}
          onCancel={() => {
            setShowArtForm(false);
            setEditingArt(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingArt}
        title="Delete Artwork"
        message={`Are you sure you want to delete "${deletingArt?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={handleDeleteArt}
        onCancel={() => setDeletingArt(null)}
      />
    </>
  );
}
