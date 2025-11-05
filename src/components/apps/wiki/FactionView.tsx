"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import { type Faction, getFactionMembers } from "@/lib/actions/wiki";
import { useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";

type FactionViewProps = {
  faction: Faction;
  onCharacterClick?: (characterSlug: string) => void;
};

interface FactionMember {
  id: string;
  character_id: string;
  faction_id: string;
  role: string | null;
  rank: string | null;
  join_date: string | null;
  leave_date: string | null;
  is_current: boolean | null;
  notes: string | null;
  characters?: {
    id: string;
    name: string;
    nickname?: string | null;
    profile_image?: string | null;
  };
}

export default function FactionView({
  faction,
  onCharacterClick,
}: FactionViewProps) {
  const [activeTab, setActiveTab] = useQueryState(
    "faction-tab",
    parseAsStringLiteral(["overview", "details", "members"] as const)
      .withDefault("overview")
      .withOptions({ history: "push", shallow: true }),
  );

  // Use React Query to fetch members only when the members tab is active
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["faction-members", faction.id],
    queryFn: () => getFactionMembers(faction.id),
    enabled: activeTab === "members",
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "members"
                ? "bg-white text-blue-600 shadow-sm dark:bg-gray-900 dark:text-blue-400"
                : "text-gray-600 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200"
            }`}
          >
            Members
            {activeTab === "members" && (
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

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="animate-fadeIn mx-auto max-w-4xl">
            {membersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                  <div className="font-medium text-gray-500 dark:text-gray-400">
                    Loading members...
                  </div>
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  This faction has no members yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      if (member.characters && onCharacterClick) {
                        onCharacterClick(member.characters.id);
                      }
                    }}
                    className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Member Header */}
                    <div className="border-b border-gray-100 p-4 text-left dark:border-gray-700">
                      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {member.characters?.name}
                      </h3>
                      {member.characters?.nickname && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          &quot;{member.characters.nickname}&quot;
                        </p>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="p-4">
                      <div className="grid gap-4 @md:grid-cols-2">
                        {/* Role & Rank */}
                        <div>
                          {member.role && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                ROLE
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {member.role}
                              </p>
                            </div>
                          )}
                          {member.rank && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                RANK
                              </p>
                              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {member.rank}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        <div>
                          {member.join_date && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                JOINED
                              </p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {member.join_date}
                              </p>
                            </div>
                          )}
                          {member.leave_date && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                LEFT
                              </p>
                              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {member.leave_date}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {member.is_current !== null && (
                        <div className="mt-3 flex gap-2">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                              member.is_current
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {member.is_current
                              ? "Current Member"
                              : "Former Member"}
                          </span>
                        </div>
                      )}

                      {/* Notes */}
                      {member.notes && (
                        <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            NOTES
                          </p>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {member.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
