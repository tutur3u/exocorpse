"use client";

import {
  getBlacklistedUsersPaginated,
  type BlacklistedUser,
} from "@/lib/actions/blacklist";
import { generatePaginationRange } from "@/lib/pagination";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, useQueryStates } from "nuqs";
import { useEffect } from "react";

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
          <div className="space-y-2">
            {blacklistedUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">{user.username}</h3>
                  {user.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(user.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {user.reasoning && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.reasoning}
                  </p>
                )}
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
                      className={`min-w-[2rem] rounded px-3 py-1 text-sm font-medium transition-colors ${
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
