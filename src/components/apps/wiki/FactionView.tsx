"use client";

import { type Faction } from "@/lib/actions/wiki";

type FactionViewProps = {
  faction: Faction;
};

export default function FactionView({ faction }: FactionViewProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {faction.name}
          </h1>
          {faction.summary && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {faction.summary}
            </p>
          )}
        </div>

        {/* Type Badge */}
        <div className="flex flex-wrap gap-2">
          {faction.faction_type && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {faction.faction_type}
            </span>
          )}
          {faction.status && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {faction.status}
            </span>
          )}
          {faction.reputation && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Reputation: {faction.reputation}
            </span>
          )}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {faction.power_level && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Power Level
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {faction.power_level}
              </p>
            </div>
          )}
          {faction.member_count !== null && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Members
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {faction.member_count}
              </p>
            </div>
          )}
          {faction.founding_date && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Founded
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {faction.founding_date}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {faction.description && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {faction.description}
            </p>
          </div>
        )}

        {/* Primary Goal */}
        {faction.primary_goal && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
            <h2 className="mb-3 text-xl font-semibold text-purple-900 dark:text-purple-100">
              Primary Goal
            </h2>
            <p className="whitespace-pre-wrap text-purple-800 dark:text-purple-200">
              {faction.primary_goal}
            </p>
          </div>
        )}

        {/* Ideology */}
        {faction.ideology && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
            <h2 className="mb-3 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
              Ideology
            </h2>
            <p className="whitespace-pre-wrap text-indigo-800 dark:text-indigo-200">
              {faction.ideology}
            </p>
          </div>
        )}

        {/* Content */}
        {faction.content && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <h2 className="mb-3 text-xl font-semibold text-blue-900 dark:text-blue-100">
              Additional Details
            </h2>
            <p className="whitespace-pre-wrap text-blue-800 dark:text-blue-200">
              {faction.content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
