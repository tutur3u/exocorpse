"use client";

import WritingPieceForm from "@/components/admin/forms/WritingPieceForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import type { WritingPiece } from "@/lib/actions/portfolio";
import {
  createWritingPiece,
  deleteWritingPiece,
  getAllWritingPiecesAdmin,
  updateWritingPiece,
} from "@/lib/actions/portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type WritingPortfolioTabProps = {
  initialWritingPieces: WritingPiece[];
  imageUrls: Map<string, string>;
};

export default function WritingPortfolioTab({
  initialWritingPieces,
  imageUrls,
}: WritingPortfolioTabProps) {
  const queryClient = useQueryClient();
  const [writingPieces, setWritingPieces] = useState(initialWritingPieces);
  const [showWritingForm, setShowWritingForm] = useState(false);
  const [editingWriting, setEditingWriting] = useState<WritingPiece | null>(
    null,
  );
  const [deletingWriting, setDeletingWriting] = useState<WritingPiece | null>(
    null,
  );

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
    cover_image?: string;
    thumbnail_url?: string;
    year?: number;
    created_date?: string;
    tags?: string[];
    is_featured?: boolean;
    word_count?: number;
  }) => {
    try {
      if (editingWriting) {
        const updated = await updateWritingPiece(editingWriting.id, {
          ...data,
        });
        setWritingPieces((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success("Writing updated successfully");
        return updated;
      } else {
        const newWriting = await createWritingPiece({
          ...data,
          display_order: writingPieces.length,
        });
        setWritingPieces((prev) => [newWriting, ...prev]);
        toast.success("Writing created successfully");
        return newWriting;
      }
    } catch (error) {
      console.error("Failed to save writing:", error);
      toast.error("Failed to save writing");
      throw error;
    }
  };

  const handleWritingComplete = async () => {
    // Refresh the writing list to show uploaded images
    try {
      const refreshedWriting = await getAllWritingPiecesAdmin();
      setWritingPieces(refreshedWriting);
    } catch (error) {
      console.error("Failed to refresh writing pieces:", error);
    }

    setShowWritingForm(false);
    setEditingWriting(null);
  };

  const handleDeleteWriting = async () => {
    if (!deletingWriting) return;

    try {
      await deleteWritingPiece(deletingWriting.id);
      setWritingPieces((prev) =>
        prev.filter((item) => item.id !== deletingWriting.id),
      );
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });
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
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Writing Portfolio
          </h2>
          <button
            type="button"
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
              type="button"
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
                className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start gap-4 p-4">
                  {writing.cover_image && (
                    <div className="shrink-0">
                      <StorageImage
                        src={writing.cover_image}
                        signedUrl={imageUrls.get(writing.cover_image)}
                        alt={writing.title}
                        width={128}
                        height={96}
                        className="h-24 w-32 rounded object-cover"
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {writing.title}
                      </h3>
                      {writing.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
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
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditWriting(writing)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingWriting(writing)}
                        className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      {showWritingForm && (
        <WritingPieceForm
          writingPiece={editingWriting || undefined}
          onSubmit={handleWritingSubmit}
          onComplete={handleWritingComplete}
          onCancel={() => {
            setShowWritingForm(false);
            setEditingWriting(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
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
