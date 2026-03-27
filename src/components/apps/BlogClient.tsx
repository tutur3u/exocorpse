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

function formatPublishedDate(value: string | null | undefined) {
  if (!value) {
    return "Unscheduled";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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
      <div className="@container relative flex h-full flex-col overflow-hidden bg-[#07090f] text-[#f6efe3]">
        <div className="pointer-events-none absolute inset-0 opacity-95">
          <div className="absolute top-[-8rem] left-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[#8b162a]/18 blur-3xl" />
          <div className="absolute top-[18%] right-[-7rem] h-[22rem] w-[22rem] rounded-full bg-[#2846b6]/18 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[18%] h-[18rem] w-[18rem] rounded-full bg-[#c1904d]/12 blur-3xl" />
          <div className="absolute inset-y-0 left-[8%] hidden w-px bg-gradient-to-b from-transparent via-white/8 to-transparent @2xl:block" />
          <div className="absolute inset-y-0 right-[10%] hidden w-px bg-gradient-to-b from-transparent via-white/5 to-transparent @2xl:block" />
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(10,14,24,0.96),rgba(8,10,16,0.82))] backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 @md:px-6 @lg:px-8 @xl:py-8">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d1ba93]/18 bg-[rgba(12,18,30,0.82)] px-4 py-2 text-xs font-medium tracking-[0.2em] text-[#eadfc9] uppercase transition hover:border-[#d23b4b]/36 hover:text-white"
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
                Archive
              </button>

              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#d23b4b]/25 bg-[rgba(48,14,23,0.84)] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.22em] text-[#ffd3b1] uppercase">
                    Blog Dispatch
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.68rem] tracking-[0.2em] text-[#cfc6b2] uppercase">
                    {formatPublishedDate(selectedPost.published_at)}
                  </span>
                </div>

                <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-none font-semibold text-[#f9f1e3] @md:text-5xl @xl:text-6xl">
                  {selectedPost.title}
                </h1>

                {selectedPost.excerpt && (
                  <p className="mt-5 max-w-3xl text-base leading-8 text-[#d4c9b5] @md:text-lg">
                    {selectedPost.excerpt}
                  </p>
                )}
              </div>
            </div>
          </div>

          <article className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 @md:px-6 @lg:px-8 @xl:py-8">
            {selectedPost.cover_url && (
              <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[rgba(10,12,18,0.7)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
                <div className="relative aspect-[16/10] w-full @lg:aspect-[16/8.5]">
                  <StorageImage
                    src={selectedPost.cover_url}
                    alt={selectedPost.title}
                    signedUrl={coverImageUrls.get(selectedPost.cover_url)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 960px"
                  />
                </div>
              </div>
            )}

            <div className="mx-auto w-full max-w-[46rem] rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(12,15,24,0.94),rgba(8,10,16,0.98))] p-6 shadow-[0_26px_70px_rgba(0,0,0,0.32)] @md:p-8">
              <MarkdownRenderer
                content={selectedPost.content}
                className="text-[#ece3d1]"
              />
            </div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="@container relative flex h-full flex-col overflow-hidden bg-[#07090f] text-[#f4ece0]">
      <div className="pointer-events-none absolute inset-0 opacity-95">
        <div className="absolute top-[-8rem] left-[-7rem] h-[22rem] w-[22rem] rounded-full bg-[#8b162a]/16 blur-3xl" />
        <div className="absolute top-[12%] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#1f3fa5]/16 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[22%] h-[18rem] w-[18rem] rounded-full bg-[#b88a4a]/12 blur-3xl" />
      </div>

      <div className="relative flex h-full flex-col">
        <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(10,14,24,0.96),rgba(8,10,16,0.82))]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 @md:px-6 @lg:px-8">
            <div className="flex flex-col gap-5 @xl:flex-row @xl:items-end @xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-[0.72rem] font-semibold tracking-[0.3em] text-[#b69f7a] uppercase">
                  Public Archive
                </p>
                <h1 className="mt-3 font-serif text-4xl leading-none font-semibold text-[#faf1e3] @md:text-5xl">
                  Blog dispatches
                </h1>
                <p className="mt-4 text-base leading-8 text-[#d1c5b2]">
                  Recent writings, updates, and field notes from the EXOCORPSE
                  terminal.
                </p>
              </div>

              <div className="grid gap-3 @sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/8 bg-[rgba(12,16,28,0.82)] p-4">
                  <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#998a73] uppercase">
                    Total posts
                  </p>
                  <p className="mt-3 font-serif text-3xl font-semibold text-[#fff6e8]">
                    {total}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-[rgba(12,16,28,0.82)] p-4">
                  <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#998a73] uppercase">
                    Current page
                  </p>
                  <p className="mt-3 font-serif text-3xl font-semibold text-[#fff6e8]">
                    {clampedCurrentPage}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/8 bg-[rgba(12,16,28,0.82)] p-4">
                  <label
                    htmlFor="page-size"
                    className="text-[0.68rem] font-semibold tracking-[0.22em] text-[#998a73] uppercase"
                  >
                    Page size
                  </label>
                  <select
                    id="page-size"
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    className="mt-3 w-full rounded-xl border border-white/10 bg-[#0e1422] px-3 py-2 text-sm text-[#f4ecdd] transition outline-none focus:border-[#d23b4b]/60"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 @md:px-6 @lg:px-8">
            {posts.length === 0 && total === 0 ? (
              <div className="rounded-[1.8rem] border border-white/8 bg-[rgba(12,16,28,0.84)] p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#d23b4b]/25 bg-[rgba(48,14,23,0.84)] text-[#ffd3b1]">
                  <svg
                    className="h-8 w-8"
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
                <h3 className="font-serif text-2xl font-semibold text-[#fff6e8]">
                  No posts yet
                </h3>
                <p className="mt-3 text-[#c9bea9]">
                  Check back later for new transmissions.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
                  {posts.map((post) => (
                    <button
                      type="button"
                      key={post.id}
                      onClick={() => handlePostSelect(post)}
                      className="group overflow-hidden rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(12,16,28,0.92),rgba(8,10,16,0.96))] text-left shadow-[0_20px_55px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:border-[#d23b4b]/24"
                    >
                      <div className="grid h-full @md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                        {post.cover_url ? (
                          <div className="relative min-h-[15rem] overflow-hidden @md:h-full">
                            <StorageImage
                              src={post.cover_url}
                              alt={post.title}
                              signedUrl={coverImageUrls.get(post.cover_url)}
                              fill
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                              sizes="(max-width: 1024px) 100vw, 40vw"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,16,0.06),rgba(6,8,14,0.45))]" />
                          </div>
                        ) : (
                          <div className="min-h-[15rem] bg-[radial-gradient(circle_at_top_left,rgba(210,59,75,0.18),transparent_42%),linear-gradient(180deg,rgba(20,24,37,0.92),rgba(8,10,16,0.98))]" />
                        )}

                        <div className="flex flex-col p-5 @md:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.66rem] tracking-[0.2em] text-[#cfc6b2] uppercase">
                              {formatPublishedDate(post.published_at)}
                            </span>
                            <span className="rounded-full border border-[#d23b4b]/20 bg-[rgba(48,14,23,0.74)] px-3 py-1 text-[0.66rem] tracking-[0.2em] text-[#ffd5b7] uppercase">
                              {Math.max(
                                1,
                                Math.round(
                                  post.content
                                    .trim()
                                    .split(/\s+/)
                                    .filter(Boolean).length / 220,
                                ),
                              )}{" "}
                              min read
                            </span>
                          </div>

                          <h3 className="mt-4 font-serif text-3xl leading-tight font-semibold text-[#fff6e8]">
                            {post.title}
                          </h3>

                          <p className="mt-4 text-base leading-7 text-[#cdbfa8]">
                            {post.excerpt ||
                              "Open the post to read the full entry from the archive."}
                          </p>

                          <span className="mt-auto pt-6 text-sm font-medium tracking-[0.2em] text-[#f5dfba] uppercase transition group-hover:text-white">
                            Open post
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="space-y-4 border-t border-white/8 pt-6">
                    <div className="text-center text-sm text-[#b9ac98]">
                      Showing{" "}
                      {Math.min((clampedCurrentPage - 1) * pageSize + 1, total)}
                      -{Math.min(clampedCurrentPage * pageSize, total)} of{" "}
                      {total} posts
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handlePageChange(Math.max(clampedCurrentPage - 1, 1))
                        }
                        disabled={clampedCurrentPage === 1}
                        className="rounded-full border border-white/10 bg-[rgba(12,16,28,0.82)] px-4 py-2 text-sm text-[#f4ecdd] transition hover:enabled:border-[#d23b4b]/28 disabled:cursor-not-allowed disabled:opacity-45"
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
                              className="px-2 text-[#8f8576]"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              type="button"
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-10 rounded-full px-3 py-2 text-sm transition ${
                                clampedCurrentPage === pageNum
                                  ? "bg-[#d23b4b] text-white"
                                  : "border border-white/10 bg-[rgba(12,16,28,0.82)] text-[#f4ecdd] hover:border-[#d23b4b]/28"
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
                        className="rounded-full border border-white/10 bg-[rgba(12,16,28,0.82)] px-4 py-2 text-sm text-[#f4ecdd] transition hover:enabled:border-[#d23b4b]/28 disabled:cursor-not-allowed disabled:opacity-45"
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
      </div>
    </div>
  );
}
