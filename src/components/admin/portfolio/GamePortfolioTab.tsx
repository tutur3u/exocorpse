"use client";

import GamePieceForm from "@/components/admin/forms/GamePieceForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import type { GamePiece } from "@/lib/actions/portfolio";
import {
  createGamePiece,
  deleteGamePiece,
  getAllGamePiecesAdmin,
  updateGamePiece,
} from "@/lib/actions/portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type GamePortfolioTabProps = {
  initialGamePieces: GamePiece[];
  imageUrls: Map<string, string>;
};

export default function GamePortfolioTab({
  initialGamePieces,
  imageUrls,
}: GamePortfolioTabProps) {
  const queryClient = useQueryClient();
  const [gamePieces, setGamePieces] = useState(initialGamePieces);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<GamePiece | null>(null);
  const [deletingGame, setDeletingGame] = useState<GamePiece | null>(null);

  const handleAddGame = () => {
    setEditingGame(null);
    setShowGameForm(true);
  };

  const handleEditGame = (game: GamePiece) => {
    setEditingGame(game);
    setShowGameForm(true);
  };

  const handleGameSubmit = async (data: {
    title: string;
    slug: string;
    description?: string;
    cover_image_url?: string;
    game_url?: string;
  }) => {
    try {
      if (editingGame) {
        const updated = await updateGamePiece(editingGame.id, {
          ...data,
        });
        setGamePieces((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success("Game updated successfully");
        return updated;
      } else {
        const newGame = await createGamePiece({
          ...data,
        });
        setGamePieces((prev) => [newGame, ...prev]);
        toast.success("Game created successfully");
        return newGame;
      }
    } catch (error) {
      console.error("Failed to save game:", error);
      toast.error("Failed to save game");
      throw error;
    }
  };

  const handleGameComplete = async () => {
    // Refresh to show uploaded images
    try {
      const refreshedGames = await getAllGamePiecesAdmin();
      setGamePieces(refreshedGames);
    } catch (error) {
      console.error("Failed to refresh game pieces:", error);
    }
    setShowGameForm(false);
    setEditingGame(null);
  };

  const handleDeleteGame = async () => {
    if (!deletingGame) return;

    try {
      await deleteGamePiece(deletingGame.id);
      setGamePieces((prev) =>
        prev.filter((item) => item.id !== deletingGame.id),
      );
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });
      toast.success("Game deleted successfully");
    } catch (error) {
      console.error("Failed to delete game:", error);
      toast.error("Failed to delete game");
    } finally {
      setDeletingGame(null);
    }
  };

  return (
    <>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Game Portfolio
          </h2>
          <button
            type="button"
            onClick={handleAddGame}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Game
          </button>
        </div>

        {gamePieces.length === 0 ? (
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
                d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No games yet</p>
            <button
              type="button"
              onClick={handleAddGame}
              className="mt-4 text-sm text-blue-600 hover:text-blue-500"
            >
              Add your first game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gamePieces.map((game) => (
              <div
                key={game.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                {game.cover_image_url && (
                  <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <StorageImage
                      src={game.cover_image_url}
                      signedUrl={imageUrls.get(game.cover_image_url)}
                      alt={game.title}
                      width={400}
                      height={225}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-col p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {game.title}
                  </h3>
                  {game.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {game.description}
                    </p>
                  )}
                  {game.game_url && (
                    <a
                      href={game.game_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                      Play Game →
                    </a>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditGame(game)}
                      className="flex-1 rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingGame(game)}
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
      {showGameForm && (
        <GamePieceForm
          gamePiece={editingGame || undefined}
          onSubmit={handleGameSubmit}
          onComplete={handleGameComplete}
          onCancel={() => {
            setShowGameForm(false);
            setEditingGame(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGame}
        title="Delete Game"
        message={`Are you sure you want to delete "${deletingGame?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        onConfirm={handleDeleteGame}
        onCancel={() => setDeletingGame(null)}
      />
    </>
  );
}
