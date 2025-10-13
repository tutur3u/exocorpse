import ColorPicker from "@/components/shared/ColorPicker";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
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
    world_type?: string;
    size?: string;
    population?: number;
    theme_primary_color?: string;
    theme_secondary_color?: string;
    theme_background_image?: string;
    theme_map_image?: string;
    content?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function WorldForm({
  world,
  storyId,
  onSubmit,
  onCancel,
}: WorldFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "visuals" | "content">(
    "basic",
  );

  // Basic Info
  const [name, setName] = useState(world?.name || "");
  const [slug, setSlug] = useState(world?.slug || "");
  const [description, setDescription] = useState(world?.description || "");
  const [summary, setSummary] = useState(world?.summary || "");
  const [worldType, setWorldType] = useState(world?.world_type || "");
  const [size, setSize] = useState(world?.size || "");
  const [population, setPopulation] = useState(
    world?.population?.toString() || "",
  );

  // Visuals
  const [themePrimaryColor, setThemePrimaryColor] = useState(
    world?.theme_primary_color || "#3b82f6",
  );
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(
    world?.theme_secondary_color || "#1e40af",
  );
  const [themeBackgroundImage, setThemeBackgroundImage] = useState(
    world?.theme_background_image || "",
  );
  const [themeMapImage, setThemeMapImage] = useState(
    world?.theme_map_image || "",
  );

  // Content
  const [content, setContent] = useState(world?.content || "");

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
        world_type: worldType || undefined,
        size: size || undefined,
        population: population ? parseInt(population) : undefined,
        theme_primary_color: themePrimaryColor || undefined,
        theme_secondary_color: themeSecondaryColor || undefined,
        theme_background_image: themeBackgroundImage || undefined,
        theme_map_image: themeMapImage || undefined,
        content: content || undefined,
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
        className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold">
            {world ? "Edit World" : "Create New World"}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-300 px-6 dark:border-gray-600">
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
            onClick={() => setActiveTab("visuals")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "visuals"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Visuals
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
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Name *
                  </label>
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
                  <label className="mb-1 block text-sm font-medium">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="terra-nova"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    URL-friendly identifier (lowercase, hyphens only)
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Summary
                  </label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      World Type
                    </label>
                    <input
                      type="text"
                      value={worldType}
                      onChange={(e) => setWorldType(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="planet, dimension, realm, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Size
                    </label>
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="Continental, Global, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Population
                  </label>
                  <input
                    type="number"
                    value={population}
                    onChange={(e) => setPopulation(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="450000000"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Total population (optional)
                  </p>
                </div>
              </div>
            )}

            {/* Visuals Tab */}
            {activeTab === "visuals" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize the visual appearance of this world. These settings
                  can override the story theme.
                </p>

                <ColorPicker
                  label="Primary Color"
                  value={themePrimaryColor}
                  onChange={setThemePrimaryColor}
                  helpText="Main theme color for this world (overrides story theme)"
                />

                <ColorPicker
                  label="Secondary Color"
                  value={themeSecondaryColor}
                  onChange={setThemeSecondaryColor}
                  helpText="Accent color for this world"
                />

                <ImageUploader
                  label="Background Image"
                  value={themeBackgroundImage}
                  onChange={setThemeBackgroundImage}
                  helpText="Background image for world pages"
                />

                <ImageUploader
                  label="World Map"
                  value={themeMapImage}
                  onChange={setThemeMapImage}
                  helpText="Map image showing this world's geography"
                />
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <MarkdownEditor
                  label="World Lore"
                  value={content}
                  onChange={setContent}
                  placeholder="# World Geography\n\nDescribe your world's history, geography, cultures, and lore..."
                  helpText="Detailed lore and world-building content. Supports markdown formatting."
                  rows={15}
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-300 px-6 py-4 dark:border-gray-600">
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
