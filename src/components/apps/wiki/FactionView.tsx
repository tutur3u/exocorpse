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
    slug: string;
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
    <div className="bg-theme-primary flex min-h-full flex-col">
      {/* Faction Header with Banner */}
      {(faction.logo_url || faction.banner_image) && (
        <div className="relative h-48 overflow-hidden">
          <StorageImage
            src={faction.logo_url || faction.banner_image || ""}
            alt={faction.name}
            fill
            className="object-cover"
          />
          <div className="bg-theme-secondary pointer-events-none absolute inset-0 opacity-70" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <h1 className="text-theme-text mb-2 text-4xl font-bold drop-shadow-lg">
              {faction.name}
            </h1>
            {faction.summary && (
              <p className="text-theme-text text-lg drop-shadow-md">
                {faction.summary}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Header for factions without banner */}
      {!faction.logo_url && !faction.banner_image && (
        <div className="bg-theme-secondary border-b p-6 backdrop-blur-sm">
          <h1 className="text-theme mb-2 text-4xl font-bold">{faction.name}</h1>
          {faction.summary && (
            <p className="text-theme-text text-lg">{faction.summary}</p>
          )}
          {/* Faction Info Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {faction.faction_type && (
              <span className="text-theme-text bg-theme-primary rounded-full px-3 py-1 text-sm font-medium">
                {faction.faction_type}
              </span>
            )}
            {faction.status && (
              <span className="text-theme-text bg-theme-secondary rounded-full px-3 py-1 text-sm font-medium">
                {faction.status}
              </span>
            )}
            {faction.reputation && (
              <span className="text-theme-text bg-theme-primary rounded-full px-3 py-1 text-sm font-medium">
                Reputation: {faction.reputation}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-theme-secondary px-6">
        <div className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "overview"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "details"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("members")}
            className={`relative shrink-0 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === "members"
                ? "text-theme-text bg-theme-primary font-bold shadow-sm"
                : "text-theme-text hover:bg-theme-primary hover:text-theme-secondary"
            }`}
          >
            Members
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
                  <div className="text-theme-text bg-theme-secondary rounded-lg p-4 shadow-sm">
                    <p className="text-theme-text text-xs font-medium">
                      Power Level
                    </p>
                    <p className="text-theme-text mt-1 text-lg font-bold">
                      {faction.power_level}
                    </p>
                  </div>
                )}
                {faction.member_count !== null && (
                  <div className="text-theme-text bg-theme-secondary rounded-lg p-4 shadow-sm">
                    <p className="text-theme-text text-xs font-medium">
                      Members
                    </p>
                    <p className="text-theme-text mt-1 text-lg font-bold">
                      {faction.member_count}
                    </p>
                  </div>
                )}
                {faction.founding_date && (
                  <div className="text-theme-text bg-theme-secondary rounded-lg p-4 shadow-sm">
                    <p className="text-theme-text text-xs font-medium">
                      Founded
                    </p>
                    <p className="text-theme-text mt-1 text-lg font-bold">
                      {faction.founding_date}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {faction.description ? (
              <div className="text-theme-text prose prose-lg max-w-none">
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
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm">
                <h2 className="text-theme-text mb-4 text-2xl font-semibold">
                  Primary Goal
                </h2>
                <MarkdownRenderer
                  content={faction.primary_goal}
                  className="text-theme-text prose max-w-none"
                />
              </div>
            )}

            {/* Ideology */}
            {faction.ideology && (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm">
                <h2 className="text-theme-text mb-4 text-2xl font-semibold">
                  Ideology
                </h2>
                <MarkdownRenderer
                  content={faction.ideology}
                  className="text-theme-text prose max-w-none"
                />
              </div>
            )}

            {/* Content */}
            {faction.content && (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-6 shadow-sm">
                <h2 className="text-theme-text mb-4 text-2xl font-semibold">
                  Additional Details
                </h2>
                <MarkdownRenderer
                  content={faction.content}
                  className="text-theme-text prose max-w-none"
                />
              </div>
            )}

            {!faction.primary_goal && !faction.ideology && !faction.content && (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-8 text-center shadow-sm">
                <p className="text-theme-text">
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
                  <div className="text-theme-text font-medium">
                    Loading members...
                  </div>
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-theme-text bg-theme-secondary rounded-xl p-8 text-center shadow-sm">
                <svg
                  className="text-theme-text mx-auto h-12 w-12"
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
                <p className="text-theme-text mt-4">
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
                      if (member.characters?.slug && onCharacterClick) {
                        onCharacterClick(member.characters.slug);
                      }
                    }}
                    className="text-theme-text bg-theme-secondary w-full overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Member Header */}
                    <div className="text-theme-text flex justify-between p-4">
                      <div className="text-left">
                        <h3 className="text-theme-text mb-1 text-lg font-semibold">
                          {member.characters?.name}
                        </h3>
                        {member.characters?.nickname && (
                          <p className="text-theme-text text-sm">
                            &quot;{member.characters.nickname}&quot;
                          </p>
                        )}
                      </div>
                      {/* Status Badge */}
                      {member.is_current !== null && (
                        <div className="flex items-center gap-2 p-2">
                          <span
                            className={`inline-block rounded-full px-3 py-2 text-xs font-medium ${
                              member.is_current
                                ? "text-theme-text bg-theme-primary font-medium"
                                : "text-theme-text bg-theme-secondary font-medium"
                            }`}
                          >
                            {member.is_current
                              ? "Current Member"
                              : "Former Member"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="p-4">
                      <div className="grid gap-4 @md:grid-cols-2">
                        {/* Role & Rank */}
                        <div>
                          {member.role && (
                            <div className="mb-3">
                              <p className="text-theme-text text-xs font-medium">
                                ROLE
                              </p>
                              <p className="text-theme-text mt-1 text-sm font-medium">
                                {member.role}
                              </p>
                            </div>
                          )}
                          {member.rank && (
                            <div>
                              <p className="text-theme-text text-xs font-medium">
                                RANK
                              </p>
                              <p className="text-theme-text mt-1 text-sm font-medium">
                                {member.rank}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        <div>
                          {member.join_date && (
                            <div className="mb-3">
                              <p className="text-theme-text text-xs font-medium">
                                JOINED
                              </p>
                              <p className="text-theme-text mt-1 text-sm">
                                {member.join_date}
                              </p>
                            </div>
                          )}
                          {member.leave_date && (
                            <div>
                              <p className="text-theme-text text-xs font-medium">
                                LEFT
                              </p>
                              <p className="text-theme-text mt-1 text-sm">
                                {member.leave_date}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {member.notes && (
                        <div className="text-theme-text bg-theme-primary mt-4 rounded-lg p-3">
                          <p className="text-theme-text text-xs font-medium">
                            NOTES
                          </p>
                          <p className="text-theme-text mt-1 text-sm">
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
