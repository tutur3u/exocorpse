import type { World } from "@/lib/actions/wiki";
import { useState } from "react";

type WorldFormProps = {
  world?: World;
  storyId: string;
  onSubmit: (data: {
    story_id: string;
    name: string;
    slug: string;
    description?: string;
    summary?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function WorldForm({
  world,
  storyId,
  onSubmit,
  onCancel,
}: WorldFormProps) {
  const [name, setName] = useState(world?.name || "");
  const [slug, setSlug] = useState(world?.slug || "");
  const [description, setDescription] = useState(world?.description || "");
  const [summary, setSummary] = useState(world?.summary || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        story_id: storyId,
        name,
        slug,
        description: description || undefined,
        summary: summary || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!world) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      );
    }
  };

  return (
    <div
      className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      onClick={onCancel}
    >
      <div
        className="animate-slideUp w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-2xl font-bold">
          {world ? "Edit World" : "Create New World"}
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
              placeholder="Terra Nova"
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
              placeholder="terra-nova"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="A brief one-line summary"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
              placeholder="A detailed description of your world..."
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
              {loading ? "Saving..." : world ? "Update World" : "Create World"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
