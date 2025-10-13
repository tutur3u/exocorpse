"use client";

import { useState } from "react";
import type { Character } from "@/lib/actions/wiki";

type CharacterFormProps = {
  character?: Character;
  worldId: string;
  onSubmit: (data: {
    world_id: string;
    name: string;
    slug: string;
    nickname?: string;
    personality_summary?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function CharacterForm({
  character,
  worldId,
  onSubmit,
  onCancel,
}: CharacterFormProps) {
  const [name, setName] = useState(character?.name || "");
  const [slug, setSlug] = useState(character?.slug || "");
  const [nickname, setNickname] = useState(character?.nickname || "");
  const [personalitySummary, setPersonalitySummary] = useState(
    character?.personality_summary || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        world_id: worldId,
        name,
        slug,
        nickname: nickname || undefined,
        personality_summary: personalitySummary || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!character) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">
          {character ? "Edit Character" : "Create New Character"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="john-doe"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Johnny"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Personality Summary
            </label>
            <textarea
              value={personalitySummary}
              onChange={(e) => setPersonalitySummary(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="A brief description of their personality..."
            />
          </div>

          {error && (
            <div className="rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
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
  );
}
