"use client";

import ArtPieceForm from "@/components/admin/forms/ArtPieceForm";
import WritingPieceForm from "@/components/admin/forms/WritingPieceForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import type { ArtPiece, WritingPiece } from "@/lib/actions/portfolio";
import {
  createArtPiece,
  createWritingPiece,
  deleteArtPiece,
  deleteWritingPiece,
  updateArtPiece,
  updateWritingPiece,
} from "@/lib/actions/portfolio";
import { useState } from "react";
import { toast } from "sonner";

type PortfolioClientProps = {
  initialArtPieces: ArtPiece[];
  initialWritingPieces: WritingPiece[];
};

export default function PortfolioClient({
  initialArtPieces,
  initialWritingPieces,
}: PortfolioClientProps) {
  const [activeTab, setActiveTab] = useState<"art" | "writing">("art");

  // Art state
  const [artPieces, setArtPieces] = useState(initialArtPieces);
  const [showArtForm, setShowArtForm] = useState(false);
  const [editingArt, setEditingArt] = useState<ArtPiece | null>(null);
  const [deletingArt, setDeletingArt] = useState<ArtPiece | null>(null);

  // Writing state
  const [writingPieces, setWritingPieces] = useState(initialWritingPieces);
  const [showWritingForm, setShowWritingForm] = useState(false);
  const [editingWriting, setEditingWriting] = useState<WritingPiece | null>(
    null,
  );
  const [deletingWriting, setDeletingWriting] = useState<WritingPiece | null>(
    null,
  );

  // Art handlers
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
    tags?: string;
    is_featured?: boolean;
    artist_name?: string;
    artist_url?: string;
  }) => {
    try {
      // Convert tags string to array
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : undefined;

      if (editingArt) {
        const updated = await updateArtPiece(editingArt.id, {
          ...data,
          tags: tagsArray,
        });
        setArtPieces((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success("Artwork updated successfully");
      } else {
        const newArt = await createArtPiece({
          ...data,
          tags: tagsArray,
          display_order: artPieces.length,
        });
        setArtPieces((prev) => [newArt, ...prev]);
        toast.success("Artwork created successfully");
      }

      setShowArtForm(false);
      setEditingArt(null);
    } catch (error) {
      console.error("Failed to save artwork:", error);
      toast.error("Failed to save artwork");
      throw error;
    }
  };

  const handleDeleteArt = async () => {
    if (!deletingArt) return;

    try {
      await deleteArtPiece(deletingArt.id);
      setArtPieces((prev) => prev.filter((item) => item.id !== deletingArt.id));
      toast.success("Artwork deleted successfully");
    } catch (error) {
      console.error("Failed to delete artwork:", error);
      toast.error("Failed to delete artwork");
    } finally {
      setDeletingArt(null);
    }
  };

  // Writing handlers
  const handleAddWriting = () => {
    setEditingWriting(null);
    setShowWritingForm(true);
  };

  const handleEditWriting = (writing: WritingPiece) => {
    setEditingWriting(writing);
    setShowWritingForm(true);
  };

  const handleWritingSubmit = async (data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    year?: number;
    created_date?: string;
    tags?: string;
    is_featured?: boolean;
    word_count?: number;
  }) => {
    try {
      // Convert tags string to array
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : undefined;

      if (editingWriting) {
        const updated = await updateWritingPiece(editingWriting.id, {
          ...data,
          tags: tagsArray,
        });
        setWritingPieces((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success("Writing updated successfully");
      } else {
        const newWriting = await createWritingPiece({
          ...data,
          tags: tagsArray,
          display_order: writingPieces.length,
        });
        setWritingPieces((prev) => [newWriting, ...prev]);
        toast.success("Writing created successfully");
      }

      setShowWritingForm(false);
      setEditingWriting(null);
    } catch (error) {
      console.error("Failed to save writing:", error);
      toast.error("Failed to save writing");
      throw error;
    }
  };

  const handleDeleteWriting = async () => {
    if (!deletingWriting) return;

    try {
      await deleteWritingPiece(deletingWriting.id);
      setWritingPieces((prev) =>
        prev.filter((item) => item.id !== deletingWriting.id),
      );
      toast.success("Writing deleted successfully");
    } catch (error) {
      console.error("Failed to delete writing:", error);
      toast.error("Failed to delete writing");
    } finally {
      setDeletingWriting(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("art")}
              className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "art"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Art ({artPieces.length})
            </button>
            <button
              onClick={() => setActiveTab("writing")}
              className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === "writing"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Writing ({writingPieces.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "art" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Art Portfolio
                </h2>
                <button
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
                      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <StorageImage
                          src={art.image_url}
                          alt={art.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
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
                            onClick={() => handleEditArt(art)}
                            className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
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
          )}

          {activeTab === "writing" && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Writing Portfolio
                </h2>
                <button
                  onClick={handleAddWriting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Writing
                </button>
              </div>

              {writingPieces.length === 0 ? (
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No writing yet</p>
                  <button
                    onClick={handleAddWriting}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Add your first writing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {writingPieces.map((writing) => (
                    <div
                      key={writing.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {writing.title}
                          </h3>
                          {writing.excerpt && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              {writing.excerpt}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            {writing.year && <span>{writing.year}</span>}
                            {writing.word_count && (
                              <span>{writing.word_count} words</span>
                            )}
                            {writing.tags && writing.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {writing.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleEditWriting(writing)}
                            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingWriting(writing)}
                            className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
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
          )}
        </div>
      </div>

      {/* Forms */}
      {showArtForm && (
        <ArtPieceForm
          artPiece={editingArt || undefined}
          onSubmit={handleArtSubmit}
          onCancel={() => {
            setShowArtForm(false);
            setEditingArt(null);
          }}
        />
      )}

      {showWritingForm && (
        <WritingPieceForm
          writingPiece={editingWriting || undefined}
          onSubmit={handleWritingSubmit}
          onCancel={() => {
            setShowWritingForm(false);
            setEditingWriting(null);
          }}
        />
      )}

      {/* Delete Confirmations */}
      <ConfirmDialog
        isOpen={!!deletingArt}
        title="Delete Artwork"
        message={`Are you sure you want to delete "${deletingArt?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={handleDeleteArt}
        onCancel={() => setDeletingArt(null)}
      />

      <ConfirmDialog
        isOpen={!!deletingWriting}
        title="Delete Writing"
        message={`Are you sure you want to delete "${deletingWriting?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={handleDeleteWriting}
        onCancel={() => setDeletingWriting(null)}
      />
    </>
  );
}
