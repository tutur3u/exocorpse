"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { type Faction } from "@/lib/actions/wiki";
import { parseAsStringLiteral, useQueryState } from "nuqs";

type FactionViewProps = {
  faction: Faction;
};

export default function FactionView({ faction }: FactionViewProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "faction-tab",
    parseAsStringLiteral(["overview", "details"] as const)
      .withDefault("overview")
      .withOptions({ history: "push", shallow: true }),
  );

  return (
    <div className="flex min-h-full flex-col bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Faction Header with Banner */}
      {(faction.logo_url || faction.banner_image) && (
        <div className="relative h-48 overflow-hidden">
          <StorageImage
            src={faction.logo_url || faction.banner_image || ""}
            alt={faction.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/50 to-black/90" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h1 className="mb-2 text-4xl font-bold text-white drop-shadow-lg">
              {faction.name}
            </h1>
            {faction.summary && (
              <p className="text-lg text-gray-200 drop-shadow-md">
                {faction.summary}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header for factions without banner */}
      {!faction.logo_url && !faction.banner_image && (
        <div className="border-b bg-white/50 p-6 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50">
          <h1 className="mb-2 bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
            {faction.name}
          </h1>
          {faction.summary && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {faction.summary}
            </p>
          )}
          {/* Faction Info Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {faction.faction_type && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {faction.faction_type}
              </span>
            )}
            {faction.status && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                {faction.status}
              </span>
            )}
            {faction.reputation && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                Reputation: {faction.reputation}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b bg-gray-50/50 px-6 dark:border-gray-800 dark:bg-gray-900/30">
        <div className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-linear-to-r from-purple-600 to-pink-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "details"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            }`}
          >
            Details
            {activeTab === "details" && (
              <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-linear-to-r from-purple-600 to-pink-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-fadeIn mx-auto max-w-4xl space-y-6">
            {/* Key Stats */}
            {(faction.power_level ||
              faction.member_count !== null ||
              faction.founding_date) && (
              <div className="grid grid-cols-2 gap-4 @md:grid-cols-3">
                {faction.power_level && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Power Level
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                      {faction.power_level}
                    </p>
                  </div>
                )}
                {faction.member_count !== null && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Members
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                      {faction.member_count}
                    </p>
                  </div>
                )}
                {faction.founding_date && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Founded
                    </p>
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                      {faction.founding_date}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {faction.description ? (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <MarkdownRenderer content={faction.description} />
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                <p className="text-gray-500 dark:text-gray-400">
                  No overview available for this faction yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="animate-fadeIn mx-auto max-w-4xl space-y-6">
            {/* Primary Goal */}
            {faction.primary_goal && (
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 shadow-sm dark:border-purple-800 dark:bg-purple-900/20">
                <h2 className="mb-4 text-2xl font-semibold text-purple-900 dark:text-purple-100">
                  Primary Goal
                </h2>
                <MarkdownRenderer
                  content={faction.primary_goal}
                  className="prose dark:prose-invert max-w-none"
                />
              </div>
            )}

            {/* Ideology */}
            {faction.ideology && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/20">
                <h2 className="mb-4 text-2xl font-semibold text-indigo-900 dark:text-indigo-100">
                  Ideology
                </h2>
                <MarkdownRenderer
                  content={faction.ideology}
                  className="prose dark:prose-invert max-w-none"
                />
              </div>
            )}

            {/* Content */}
            {faction.content && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-800 dark:bg-blue-900/20">
                <h2 className="mb-4 text-2xl font-semibold text-blue-900 dark:text-blue-100">
                  Additional Details
                </h2>
                <MarkdownRenderer
                  content={faction.content}
                  className="prose dark:prose-invert max-w-none"
                />
              </div>
            )}

            {!faction.primary_goal && !faction.ideology && !faction.content && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                <p className="text-gray-500 dark:text-gray-400">
                  No additional details available for this faction yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
