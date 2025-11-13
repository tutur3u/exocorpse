"use client";

import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import StorageImage from "@/components/shared/StorageImage";
import type { InitialBlogData } from "@/contexts/InitialBlogDataContext";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  type BlogPost,
  getBlogPostBySlug,
  getPublishedBlogPostsPaginated,
} from "@/lib/actions/blog";
import { generatePaginationRange } from "@/lib/pagination";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

type BlogClientProps = {
  initialData: InitialBlogData;
};

export default function BlogClient({ initialData }: BlogClientProps) {
  const [params, setParams] = useQueryStates(
    {
      "blog-post": parseAsString,
      "blog-page": parseAsInteger,
      "blog-page-size": parseAsInteger,
    },
    {
      shallow: true,
      history: "push",
    },
  );

  const {
    "blog-post": postSlug,
    "blog-page": currentPageParam,
    "blog-page-size": pageSizeParam,
  } = params;

  // Use defaults if not specified
  const currentPage = currentPageParam ?? 1;
  const pageSize = pageSizeParam ?? DEFAULT_PAGE_SIZE;

  // Query for selected post
  const shouldUseInitialPost =
    initialData.selectedPost && postSlug === initialData.selectedPost.slug;

  const { data: selectedPost = null } = useQuery({
    queryKey: ["blog-post", postSlug],
    queryFn: () => (postSlug ? getBlogPostBySlug(postSlug) : null),
    enabled: !!postSlug,
    initialData: shouldUseInitialPost ? initialData.selectedPost : undefined,
  });

  // Query for paginated posts - use initial currentPage before clamping for comparison
  const shouldUseInitialPosts =
    initialData.posts.length > 0 &&
    currentPage === initialData.page &&
    pageSize === initialData.pageSize &&
    !postSlug;

  const {
    data: paginatedData = {
      data: [],
      total: 0,
      page: 1,
      pageSize: pageSize,
    },
    isLoading,
  } = useQuery({
    queryKey: ["blog-posts", currentPage, pageSize],
    queryFn: () => getPublishedBlogPostsPaginated(currentPage, pageSize),
    enabled: !postSlug,
    initialData: shouldUseInitialPosts
      ? {
          data: initialData.posts,
          total: initialData.total,
          page: initialData.page,
          pageSize: initialData.pageSize,
        }
      : undefined,
  });

  const posts = paginatedData.data || [];
  const total = paginatedData.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedCurrentPage = Math.min(currentPage, totalPages);

  // Batch fetch signed URLs for blog post cover images
  const coverImagePaths = [
    selectedPost?.cover_url,
    ...posts.map((post) => post.cover_url),
  ].filter((p): p is string => !!p && !p.startsWith("http"));

  const { signedUrls: coverImageUrls } = useBatchStorageUrls(coverImagePaths);

  // Sync router if currentPage was out of bounds
  useEffect(() => {
    if (clampedCurrentPage !== currentPage && !postSlug) {
      setParams({
        "blog-post": null,
        "blog-page": clampedCurrentPage,
        "blog-page-size": pageSize,
      });
    }
  }, [clampedCurrentPage, currentPage, postSlug, pageSize, setParams]);

  const handlePostSelect = (post: BlogPost) => {
    setParams({
      "blog-post": post.slug,
      "blog-page": currentPage,
      "blog-page-size": pageSize,
    });
  };

  const handleBackToList = () => {
    setParams({
      "blog-post": null,
      "blog-page": currentPage,
      "blog-page-size": pageSize,
    });
  };

  const handlePageChange = (page: number) => {
    setParams({
      "blog-post": null,
      "blog-page": page,
      "blog-page-size": pageSize,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // When changing page size, reset to page 1
    setParams({
      "blog-post": null,
      "blog-page": 1,
      "blog-page-size": newPageSize,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading blog posts...</div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="flex h-full flex-col">
        {/* Post Header */}
        <div className="border-b border-gray-700 bg-linear-to-br from-gray-900 to-gray-950 px-6 py-4">
          <button
            type="button"
            onClick={handleBackToList}
            className="mb-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-labelledby="back-icon-title"
            >
              <title id="back-icon-title">Back</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to all posts
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedPost.title}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              {new Date(selectedPost.published_at!).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </span>
          </div>
          {selectedPost.excerpt && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {selectedPost.excerpt}
            </p>
          )}
        </div>

        {/* Post Content */}
        <div className="flex-1 overflow-y-auto bg-linear-to-br from-gray-900 to-gray-950 px-6 py-6">
          {selectedPost.cover_url && (
            <div className="relative mb-6 h-64 w-full overflow-hidden md:h-96">
              <StorageImage
                src={selectedPost.cover_url}
                alt={selectedPost.title}
                signedUrl={coverImageUrls.get(selectedPost.cover_url)}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <MarkdownRenderer content={selectedPost.content} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 bg-linear-to-br from-gray-900 to-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Blog
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest posts and updates
            </p>
          </div>
          {/* Page Size Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="page-size"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              Posts per page:
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto bg-linear-to-br from-gray-900 to-gray-950 p-6">
        {posts.length === 0 && total === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
              <svg
                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-labelledby="empty-blog-title"
              >
                <title id="empty-blog-title">No posts yet</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              No posts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for new content!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <button
                  type="button"
                  key={post.id}
                  onClick={() => handlePostSelect(post)}
                  className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  {post.cover_url && (
                    <div className="relative h-48 w-full shrink-0 overflow-hidden">
                      <StorageImage
                        src={post.cover_url}
                        alt={post.title}
                        signedUrl={coverImageUrls.get(post.cover_url)}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mb-3 line-clamp-3 text-gray-600 dark:text-gray-400">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span>
                        {new Date(post.published_at!).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Read more →
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="space-y-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                {/* Results Info */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  {Math.min((clampedCurrentPage - 1) * pageSize + 1, total)}-
                  {Math.min(clampedCurrentPage * pageSize, total)} of {total}{" "}
                  posts
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(Math.max(clampedCurrentPage - 1, 1))
                    }
                    disabled={clampedCurrentPage === 1}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:enabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:enabled:bg-gray-700"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {generatePaginationRange(
                      clampedCurrentPage,
                      totalPages,
                    ).map((pageNum, idx) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-gray-500 dark:text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            clampedCurrentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handlePageChange(
                        Math.min(clampedCurrentPage + 1, totalPages),
                      )
                    }
                    disabled={clampedCurrentPage === totalPages}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:enabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:enabled:bg-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
