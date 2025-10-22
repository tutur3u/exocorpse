"use client";

import BlogPostForm from "@/components/admin/forms/BlogPostForm";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import {
  createBlogPost,
  deleteBlogPost,
  getAllBlogPostsPaginated,
  updateBlogPost,
  type BlogPost,
} from "@/lib/actions/blog";
import { generatePaginationRange } from "@/lib/pagination";
import toastWithSound from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const availablePageSizes = [6, 9, 12, 18, 24, 48, 96, 100];

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

  // Clamp currentPage to valid range after deletions shrink totalPages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Confirm dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setShowForm(false);
      toastWithSound.success("Blog post created successfully!");
    },
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setEditingPost(null);
      setShowForm(false);
      toastWithSound.success("Blog post updated successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to update blog post: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toastWithSound.success("Blog post deleted successfully!");
    },
    onError: (error) => {
      toastWithSound.error(`Failed to delete blog post: ${error.message}`);
    },
  });

  const handleCreate = async (data: Parameters<typeof createBlogPost>[0]) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: Parameters<typeof updateBlogPost>[1]) => {
    if (!editingPost) return;
    await updateMutation.mutateAsync({ id: editingPost.id, data });
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setShowDeleteConfirm(true);
  };

  const getPostStatus = (post: BlogPost) => {
    if (!post.published_at) {
      return {
        label: "Draft",
        color: "bg-gray-500/90",
      };
    }

    const publishDate = new Date(post.published_at);
    const now = new Date();

    if (publishDate > now) {
      return {
        label: "Scheduled",
        color: "bg-blue-500/90",
      };
    }

    return {
      label: "Published",
      color: "bg-green-500/90",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your blog posts and articles
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPost(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          + New Post
        </button>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="pageSize"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Items per page:
        </label>
        <select
          id="pageSize"
          value={currentPageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setCurrentPageSize(newSize);
            setCurrentPage(1); // Reset to first page when changing page size
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {availablePageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading blog posts...
          </p>
        </div>
      ) : posts.length === 0 && total === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-labelledby="empty-posts-title"
            >
              <title id="empty-posts-title">No blog posts yet</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No blog posts yet
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first blog post to get started
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingPost(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const status = getPostStatus(post);
              return (
                <div
                  key={post.id}
                  className="group rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex h-full flex-col justify-between p-6">
                    <div className="mb-3 flex h-full flex-col justify-between">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium text-white backdrop-blur-sm ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {post.excerpt && (
                        <p className="mb-2 text-gray-600 dark:text-gray-400">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        {post.published_at && (
                          <span>
                            Published:{" "}
                            {new Date(post.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPost(post);
                          setShowForm(true);
                        }}
                        className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post.id)}
                        className="flex-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="space-y-4 pt-6">
              {/* Results Info */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                {Math.min((currentPage - 1) * currentPageSize + 1, total)}-
                {Math.min(currentPage * currentPageSize, total)} of {total}{" "}
                posts
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:enabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:enabled:bg-gray-700"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {generatePaginationRange(currentPage, totalPages).map(
                    (pageNum, idx) =>
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
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-10 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                          aria-current={
                            currentPage === pageNum ? "page" : undefined
                          }
                        >
                          {pageNum}
                        </button>
                      ),
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:enabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:enabled:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <BlogPostForm
          post={editingPost || undefined}
          onSubmit={editingPost ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingPost(null);
          }}
        />
      )}

      {deleteConfirmId && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Blog Post"
          message="Are you sure you want to delete this blog post? This action cannot be undone."
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
