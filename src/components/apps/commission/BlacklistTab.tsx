"use client";

import {
  getBlacklistedUsersPaginated,
  type BlacklistedUser,
} from "@/lib/actions/blacklist";
import { generatePaginationRange } from "@/lib/pagination";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

interface BlacklistTabProps {
  initialBlacklistedUsers: BlacklistedUser[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
}

export default function BlacklistTab({
  initialBlacklistedUsers,
  initialTotal,
  initialPage,
  initialPageSize,
}: BlacklistTabProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const [params, setParams] = useQueryStates(
    {
      "blacklist-page": parseAsInteger,
      "blacklist-page-size": parseAsInteger,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  const currentPageParam = params["blacklist-page"];
  const pageSizeParam = params["blacklist-page-size"];

  const currentPage = currentPageParam ?? initialPage ?? 1;
  const pageSize = pageSizeParam ?? initialPageSize ?? DEFAULT_PAGE_SIZE;

  // Query for paginated blacklisted users
  const shouldUseInitialBlacklist =
    initialBlacklistedUsers.length > 0 &&
    currentPage === initialPage &&
    pageSize === initialPageSize;

  const {
    data: paginatedData = {
      data: [],
      total: 0,
      page: 1,
      pageSize: pageSize,
    },
    isLoading,
  } = useQuery({
    queryKey: ["blacklisted-users", currentPage, pageSize],
    queryFn: () => getBlacklistedUsersPaginated(currentPage, pageSize),
    initialData: shouldUseInitialBlacklist
      ? {
          data: initialBlacklistedUsers,
          total: initialTotal,
          page: initialPage,
          pageSize: initialPageSize,
        }
      : undefined,
  });

  const blacklistedUsers = paginatedData.data || [];
  const total = paginatedData.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedCurrentPage = Math.min(currentPage, totalPages);

  // Sync router if currentPage was out of bounds
  useEffect(() => {
    if (clampedCurrentPage !== currentPage) {
      setParams({
        "blacklist-page": clampedCurrentPage,
        "blacklist-page-size": pageSize,
      });
    }
  }, [clampedCurrentPage, currentPage, pageSize, setParams]);

  const handlePageChange = (page: number) => {
    setParams({
      "blacklist-page": page,
      "blacklist-page-size": pageSize,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // When changing page size, reset to page 1
    setParams({
      "blacklist-page": 1,
      "blacklist-page-size": newPageSize,
    });
  };

  const paginationRange = generatePaginationRange(
    clampedCurrentPage,
    totalPages,
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Blacklisted Users</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        The following users are not permitted to commission work.
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading blacklisted users...</div>
        </div>
      ) : blacklistedUsers.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">No blacklisted users found.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {blacklistedUsers.map((user) => (
              <div
                key={user.id}
                className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedUserId(
                      expandedUserId === user.id ? null : user.id,
                    )
                  }
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                  aria-expanded={expandedUserId === user.id}
                  aria-controls={`blacklist-panel-${user.id}`}
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {user.username}
                    </h3>
                    {user.timestamp && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(user.timestamp).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                  {expandedUserId === user.id ? (
                    <FaChevronUp
                      className="h-4 w-4 shrink-0 text-blue-500 transition-transform"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaChevronDown
                      className="h-4 w-4 shrink-0 text-gray-400 transition-transform"
                      aria-hidden="true"
                    />
                  )}
                </button>
                <section
                  id={`blacklist-panel-${user.id}`}
                  aria-hidden={expandedUserId !== user.id}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedUserId === user.id
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    {user.reasoning || (
                      <p className="text-gray-500 italic dark:text-gray-400">
                        No reasoning provided.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Items per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {(clampedCurrentPage - 1) * pageSize + 1} to{" "}
                {Math.min(clampedCurrentPage * pageSize, total)} of {total}{" "}
                users
              </span>
            </div>

            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handlePageChange(clampedCurrentPage - 1)}
                  disabled={clampedCurrentPage === 1}
                  className="rounded px-3 py-1 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
                >
                  Previous
                </button>

                {paginationRange.map((page, idx) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-8 rounded px-3 py-1 text-sm font-medium transition-colors ${
                        page === clampedCurrentPage
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => handlePageChange(clampedCurrentPage + 1)}
                  disabled={clampedCurrentPage === totalPages}
                  className="rounded px-3 py-1 text-sm font-medium transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
