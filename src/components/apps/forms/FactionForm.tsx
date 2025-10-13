import ColorPicker from "@/components/shared/ColorPicker";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import type { Faction } from "@/lib/actions/wiki";
import { useState } from "react";

type FactionFormProps = {
  faction?: Faction;
  worldId: string;
  onSubmit: (data: {
    world_id: string;
    name: string;
    slug: string;
    description?: string;
    summary?: string;
    faction_type?: string;
    founding_date?: string;
    status?: string;
    primary_goal?: string;
    ideology?: string;
    reputation?: string;
    power_level?: string;
    member_count?: number;
    logo_url?: string;
    color_scheme?: string;
    banner_image?: string;
    content?: string;
  }) => Promise<void>;
  onCancel: () => void;
};

export default function FactionForm({
  faction,
  worldId,
  onSubmit,
  onCancel,
}: FactionFormProps) {
  const [activeTab, setActiveTab] = useState<
    "basic" | "details" | "visuals" | "content"
  >("basic");

  // Basic Info
  const [name, setName] = useState(faction?.name || "");
  const [slug, setSlug] = useState(faction?.slug || "");
  const [description, setDescription] = useState(faction?.description || "");
  const [summary, setSummary] = useState(faction?.summary || "");
  const [factionType, setFactionType] = useState(faction?.faction_type || "");
  const [foundingDate, setFoundingDate] = useState(
    faction?.founding_date || "",
  );
  const [status, setStatus] = useState(faction?.status || "active");
  const [memberCount, setMemberCount] = useState(
    faction?.member_count?.toString() || "",
  );

  // Characteristics
  const [primaryGoal, setPrimaryGoal] = useState(faction?.primary_goal || "");
  const [ideology, setIdeology] = useState(faction?.ideology || "");
  const [reputation, setReputation] = useState(faction?.reputation || "");
  const [powerLevel, setPowerLevel] = useState(faction?.power_level || "");

  // Visuals
  const [logoUrl, setLogoUrl] = useState(faction?.logo_url || "");
  const [colorScheme, setColorScheme] = useState(
    faction?.color_scheme || "#3b82f6",
  );
  const [bannerImage, setBannerImage] = useState(faction?.banner_image || "");

  // Content
  const [content, setContent] = useState(faction?.content || "");

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
        description: description || undefined,
        summary: summary || undefined,
        faction_type: factionType || undefined,
        founding_date: foundingDate || undefined,
        status: status || undefined,
        primary_goal: primaryGoal || undefined,
        ideology: ideology || undefined,
        reputation: reputation || undefined,
        power_level: powerLevel || undefined,
        member_count: memberCount ? parseInt(memberCount) : undefined,
        logo_url: logoUrl || undefined,
        color_scheme: colorScheme || undefined,
        banner_image: bannerImage || undefined,
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
    if (!faction) {
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
            {faction ? "Edit Faction" : "Create New Faction"}
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
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "details"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Characteristics
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
                    placeholder="Exocorpse"
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
                    placeholder="exocorpse"
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
                    placeholder="A detailed description of the faction..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Faction Type
                    </label>
                    <input
                      type="text"
                      value={factionType}
                      onChange={(e) => setFactionType(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="corporation, government, guild, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <option value="active">Active</option>
                      <option value="defunct">Defunct</option>
                      <option value="hidden">Hidden</option>
                      <option value="dormant">Dormant</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Founding Date
                    </label>
                    <input
                      type="text"
                      value={foundingDate}
                      onChange={(e) => setFoundingDate(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="2015, 500 years ago, etc."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Member Count
                    </label>
                    <input
                      type="number"
                      value={memberCount}
                      onChange={(e) => setMemberCount(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      placeholder="1000"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Characteristics Tab */}
            {activeTab === "details" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Primary Goal
                  </label>
                  <textarea
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="What is this faction trying to achieve?"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Ideology
                  </label>
                  <textarea
                    value={ideology}
                    onChange={(e) => setIdeology(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="What beliefs and principles guide this faction?"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Reputation
                  </label>
                  <textarea
                    value={reputation}
                    onChange={(e) => setReputation(e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                    placeholder="How is this faction perceived by others?"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Power Level
                  </label>
                  <select
                    value={powerLevel}
                    onChange={(e) => setPowerLevel(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">Select power level...</option>
                    <option value="local">
                      Local - Limited to a single area
                    </option>
                    <option value="regional">
                      Regional - Spans multiple areas
                    </option>
                    <option value="global">
                      Global - World-spanning influence
                    </option>
                    <option value="universal">
                      Universal - Multi-world presence
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Visuals Tab */}
            {activeTab === "visuals" && (
              <div className="space-y-4">
                <ImageUploader
                  label="Logo"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  helpText="Faction logo or emblem"
                />

                <ColorPicker
                  label="Color Scheme"
                  value={colorScheme}
                  onChange={setColorScheme}
                  helpText="Primary color representing this faction"
                />

                <ImageUploader
                  label="Banner Image"
                  value={bannerImage}
                  onChange={setBannerImage}
                  helpText="Banner image for faction pages"
                />
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <MarkdownEditor
                  label="Faction Lore"
                  value={content}
                  onChange={setContent}
                  placeholder="# History\n\nDescribe the faction's history, structure, notable achievements, and current operations..."
                  helpText="Detailed history and lore. Supports markdown formatting."
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
              {loading
                ? "Saving..."
                : faction
                  ? "Update Faction"
                  : "Create Faction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
