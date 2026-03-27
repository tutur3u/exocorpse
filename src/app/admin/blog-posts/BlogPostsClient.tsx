"use client";

import BlogPostForm from "@/components/admin/forms/BlogPostForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import StorageImage from "@/components/shared/StorageImage";
import { useBatchStorageUrls } from "@/hooks/useStorageUrl";
import {
  type BlogPost,
  createBlogPost,
  deleteBlogPost,
  getAllBlogPostsPaginated,
  getBlogPostById,
  updateBlogPost,
} from "@/lib/actions/blog";
import { generatePaginationRange } from "@/lib/pagination";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  FilePenLine,
  FileText,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

type BlogPostsClientProps = {
  initialData: {
    data: BlogPost[];
    total: number;
    page: number;
    pageSize: number;
  };
  pageSize?: number;
};

type StatusKey = "draft" | "scheduled" | "published";

const availablePageSizes = [6, 9, 12, 18, 24, 48, 96, 100];

function formatShortDate(dateString: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function getLiveBlogHref(slug: string) {
  const params = new URLSearchParams({
    "blog-post": slug,
  });

  return `/?${params.toString()}`;
}

function getPostStatus(post: BlogPost): {
  key: StatusKey;
  label: string;
  chipClassName: string;
  accentClassName: string;
  iconClassName: string;
  summary: string;
} {
  if (!post.published_at) {
    return {
      key: "draft",
      label: "Draft",
      chipClassName:
        "border-zinc-700/80 bg-zinc-900 text-zinc-200 dark:border-zinc-700/80 dark:bg-zinc-900 dark:text-zinc-200",
      accentClassName: "bg-zinc-500",
      iconClassName: "bg-zinc-800 text-zinc-100",
      summary: "Private until a publish date is assigned.",
    };
  }

  const publishDate = new Date(post.published_at);
  const now = new Date();

  if (publishDate > now) {
    return {
      key: "scheduled",
      label: "Scheduled",
      chipClassName:
        "border-amber-700/60 bg-amber-500/10 text-amber-200 dark:border-amber-700/60 dark:bg-amber-500/10 dark:text-amber-200",
      accentClassName: "bg-amber-400",
      iconClassName: "bg-amber-500 text-zinc-950",
      summary: `Queued for ${publishDate.toLocaleString()}.`,
    };
  }

  return {
    key: "published",
    label: "Published",
    chipClassName:
      "border-emerald-700/60 bg-emerald-500/10 text-emerald-200 dark:border-emerald-700/60 dark:bg-emerald-500/10 dark:text-emerald-200",
    accentClassName: "bg-emerald-400",
    iconClassName: "bg-emerald-500 text-zinc-950",
    summary: `Live since ${publishDate.toLocaleString()}.`,
  };
}

export default function BlogPostsClient({
  initialData,
  pageSize = 9,
}: BlogPostsClientProps) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [currentPageSize, setCurrentPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(pageSize),
  );
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [openingEditorId, setOpeningEditorId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["admin-blog-posts", currentPage, currentPageSize],
    queryFn: () => getAllBlogPostsPaginated(currentPage, currentPageSize),
    initialData:
      currentPage === initialData.page &&
      currentPageSize === initialData.pageSize
        ? initialData
        : undefined,
  });

  const posts = paginatedData?.data || [];
  const total = paginatedData?.total || 0;
  const totalPages = Math.ceil(total / currentPageSize);

  const coverImagePaths = posts
    .map((post) => post.cover_url)
    .filter((path): path is string => !!path && !path.startsWith("http"));
  const { signedUrls: coverImageUrls } = useBatchStorageUrls(coverImagePaths);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, setCurrentPage, totalPages]);

  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onError: (error) => {
      toastWithSound.error(`Failed to create blog post: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateBlogPost>[1];
    }) => updateBlogPost(id, data),
    onError: (error) => {
      toastWithSound.error(`Failed to update blog post: ${error.message}`);
    },
  });

  const fetchPostMutation = useMutation({
    mutationFn: getBlogPostById,
    onError: (error) => {
      toastWithSound.error(`Failed to load blog post: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["storageAnalytics"] });
      toastWithSound.success("Blog post deleted successfully.");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete blog post: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createBlogPost>[0]) => {
    return await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: Parameters<typeof updateBlogPost>[1]) => {
    if (!editingPost) return undefined;
    return await updateMutation.mutateAsync({ id: editingPost.id, data });
  };

  const handleComplete = () => {
    const successMessage = editingPost
      ? "Blog post updated successfully."
      : "Blog post created successfully.";

    queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    setShowForm(false);
    setEditingPost(null);
    toastWithSound.success(successMessage);
  };

  const handleStartCreate = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  const handleStartEdit = async (postId: string) => {
    setOpeningEditorId(postId);

    try {
      const latestPost = await fetchPostMutation.mutateAsync(postId);

      if (!latestPost) {
        toastWithSound.error("That blog post could not be loaded for editing.");
        return;
      }

      setEditingPost(latestPost);
      setShowForm(true);
    } finally {
      setOpeningEditorId(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  let publishedCount = 0;
  let scheduledCount = 0;
  let draftCount = 0;

  for (const post of posts) {
    const status = getPostStatus(post);
    if (status.key === "published") publishedCount += 1;
    if (status.key === "scheduled") scheduledCount += 1;
    if (status.key === "draft") draftCount += 1;
  }

  const trimmedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const status = getPostStatus(post);
    const matchesStatus = statusFilter === "all" || status.key === statusFilter;

    if (!matchesStatus) return false;
    if (!trimmedSearchTerm) return true;

    return [post.title, post.slug, post.excerpt || "", post.content]
      .join(" ")
      .toLowerCase()
      .includes(trimmedSearchTerm);
  });

  return (
    <div className="@container space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-[linear-gradient(180deg,_rgba(9,12,20,0.98),_rgba(13,14,18,0.98))] shadow-[0_30px_90px_-45px_rgba(0,0,0,0.55)]">
        <div className="border-b border-zinc-800/90 bg-[radial-gradient(circle_at_top_left,_rgba(145,49,44,0.28),_transparent_38%),linear-gradient(180deg,_rgba(24,16,18,0.88),_rgba(15,15,18,0.25))] px-5 py-5 @lg:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold tracking-[0.34em] text-red-300 uppercase">
                Editorial Desk
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-50">
                Blog post management
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Manage drafts, scheduled drops, and published entries without
                the layout overwhelming the content.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
            >
              <Plus className="h-4 w-4" />
              New Post
            </button>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-4 @md:grid-cols-3 @lg:px-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-100">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
                  Drafts
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">
                  {draftCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-900/60 bg-amber-500/8 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-zinc-950">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-amber-300 uppercase">
                  Scheduled
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">
                  {scheduledCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-900/60 bg-emerald-500/8 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-emerald-300 uppercase">
                  Published
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-50">
                  {publishedCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/95 p-4 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.7)] @lg:p-5">
        <div className="grid gap-3 @xl:grid-cols-[minmax(0,1.3fr)_minmax(12rem,0.55fr)_minmax(12rem,0.55fr)]">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              Search
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Title, slug, excerpt, or content snippet"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-11 py-3 text-sm text-zinc-100 transition outline-none placeholder:text-zinc-500 focus:border-red-500"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              Status
            </span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusKey | "all")
              }
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 transition outline-none focus:border-red-500"
            >
              <option value="all">All statuses</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.24em] text-zinc-500 uppercase">
              Page Size
            </span>
            <select
              value={currentPageSize}
              onChange={(event) => {
                const newSize = Number(event.target.value);
                setCurrentPageSize(newSize);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 transition outline-none focus:border-red-500"
            >
              {availablePageSizes.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
          <p>
            {total.toLocaleString()} total posts. Page {currentPage} of{" "}
            {Math.max(totalPages, 1)}.
          </p>
          <p>
            {filteredPosts.length.toLocaleString()} visible with current
            filters.
          </p>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-12 text-center">
          <div className="inline-block h-9 w-9 animate-spin rounded-full border-4 border-zinc-700 border-t-red-500" />
          <p className="mt-4 text-sm text-zinc-400">Loading blog posts…</p>
        </div>
      ) : total === 0 ? (
        <div className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-100">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-zinc-50">
            No blog posts yet
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Start with a draft and publish it when the archive entry is ready.
          </p>
          <button
            type="button"
            onClick={handleStartCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500"
          >
            <Plus className="h-4 w-4" />
            Create first post
          </button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-zinc-700 bg-zinc-950/70 p-10 text-center">
          <h2 className="text-xl font-semibold text-zinc-50">
            No posts match the current filters
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Clear the search or switch the status filter to show more entries.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="mt-5 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            {filteredPosts.map((post) => {
              const status = getPostStatus(post);
              const isPublished = status.key === "published";

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[1.5rem] border border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.7)]"
                >
                  <div className="grid min-h-full @lg:grid-cols-[15rem_minmax(0,1fr)_15rem]">
                    <div className="relative min-h-48 overflow-hidden border-b border-zinc-800 @lg:min-h-full @lg:border-r @lg:border-b-0">
                      {post.cover_url ? (
                        <StorageImage
                          src={post.cover_url}
                          alt={post.title}
                          signedUrl={coverImageUrls.get(post.cover_url)}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 240px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(173,63,48,0.45),_transparent_30%),linear-gradient(135deg,_rgba(48,32,34,0.96),_rgba(19,19,23,1))]" />
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,_transparent,_rgba(8,10,16,0.96))] p-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${status.chipClassName}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 p-5 @lg:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
                            /{post.slug}
                          </p>
                          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
                            {post.title}
                          </h2>
                        </div>

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${status.iconClassName}`}
                        >
                          <FilePenLine className="h-4 w-4" />
                        </span>
                      </div>

                      <p className="text-sm leading-7 text-zinc-400">
                        {post.excerpt ||
                          "No excerpt yet. Open the editor to add a sharper listing summary."}
                      </p>

                      <div className="grid gap-3 @md:grid-cols-3">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                          <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                            Created
                          </p>
                          <p className="mt-1 text-sm text-zinc-200">
                            {formatShortDate(post.created_at)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                          <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                            Updated
                          </p>
                          <p className="mt-1 text-sm text-zinc-200">
                            {formatShortDate(post.updated_at)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                          <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                            Publish Window
                          </p>
                          <p className="mt-1 text-sm text-zinc-200">
                            {post.published_at
                              ? new Date(post.published_at).toLocaleString()
                              : "Not scheduled yet"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${status.accentClassName}`}
                        />
                        <p className="text-sm text-zinc-400">
                          {status.summary}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800 bg-zinc-950/60 p-5 @lg:border-t-0 @lg:border-l @lg:p-6">
                      <div className="flex h-full flex-col justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.26em] text-zinc-500 uppercase">
                            Actions
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3 @lg:flex-col">
                            <button
                              type="button"
                              onClick={() => void handleStartEdit(post.id)}
                              disabled={openingEditorId === post.id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-wait disabled:opacity-70"
                            >
                              <FilePenLine className="h-4 w-4" />
                              {openingEditorId === post.id
                                ? "Loading…"
                                : "Edit"}
                            </button>

                            {isPublished && (
                              <Link
                                href={getLiveBlogHref(post.slug)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900"
                              >
                                <FileText className="h-4 w-4" />
                                Open Live
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDelete(post.id)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-900/70 bg-red-500/8 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {totalPages > 1 && (
            <section className="rounded-[1.5rem] border border-zinc-800 bg-zinc-950/95 p-4 @lg:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                <p>
                  Showing{" "}
                  {Math.min((currentPage - 1) * currentPageSize + 1, total)}-
                  {Math.min(currentPage * currentPageSize, total)} of{" "}
                  {total.toLocaleString()} posts
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {generatePaginationRange(currentPage, totalPages).map(
                    (pageNumber, index) =>
                      pageNumber === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-zinc-500"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          aria-current={
                            currentPage === pageNumber ? "page" : undefined
                          }
                          className={`min-w-10 rounded-xl px-4 py-2 text-sm font-medium transition ${
                            currentPage === pageNumber
                              ? "bg-red-600 text-white"
                              : "border border-zinc-700 text-zinc-200 hover:bg-zinc-900"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ),
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {showForm && (
        <BlogPostForm
          key={editingPost?.id ?? "new-post"}
          post={editingPost || undefined}
          onSubmit={editingPost ? handleUpdate : handleCreate}
          onComplete={handleComplete}
          onCancel={() => {
            setShowForm(false);
            setEditingPost(null);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete blog post"
          message="This permanently removes the blog post and cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={async () => {
            if (!deleteConfirmId) return;

            try {
              await deleteMutation.mutateAsync(deleteConfirmId);
            } finally {
              setShowDeleteConfirm(false);
              setDeleteConfirmId(null);
            }
          }}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteConfirmId(null);
          }}
        />
      )}
    </div>
  );
}
