"use client";

import type { BlacklistedUser } from "@/lib/actions/blacklist";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface BlacklistReasonCardProps {
  user: BlacklistedUser;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function BlacklistReasonCard({
  user,
  isExpanded,
  onToggle,
}: BlacklistReasonCardProps) {
  return (
    <div className="overflow-hidden rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:cursor-pointer"
        aria-expanded={isExpanded}
        aria-controls={`blacklist-reason-${user.id}`}
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          reasoning
        </span>
        {isExpanded ? (
          <FaChevronUp
            className="h-3 w-3 shrink-0 text-gray-500 transition-transform"
            aria-hidden="true"
          />
        ) : (
          <FaChevronDown
            className="h-3 w-3 shrink-0 text-gray-500 transition-transform"
            aria-hidden="true"
          />
        )}
      </button>
      <section
        id={`blacklist-reason-${user.id}`}
        aria-hidden={!isExpanded}
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {user.reasoning && (
          <div className="overflow-y-auto bg-gray-50 px-3 py-3 text-gray-600 dark:bg-gray-900 dark:text-gray-400">
            {user.reasoning}
          </div>
        )}
      </section>
    </div>
  );
}
