"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { BlogPost } from "@/lib/actions/blog";
import { cleanFormData } from "@/lib/forms";
import { useState } from "react";
import { useForm } from "react-hook-form";

type BlogPostFormData = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  published_at?: string | null;
};

type BlogPostFormProps = {
  post?: BlogPost;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  onCancel: () => void;
};

export default function BlogPostForm({
  post,
  onSubmit,
  onCancel,
}: BlogPostFormProps) {
  // Convert published_at to datetime-local format if it exists
  const formatDatetimeLocal = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format to YYYY-MM-DDTHH:mm (required format for datetime-local input)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const form = useForm<BlogPostFormData>({
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      published_at: formatDatetimeLocal(post?.published_at) || "",
    },
  });

  const { register, handleSubmit: formHandleSubmit, setValue, watch } = form;
  const { handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watch form values for components that need them
  const content = watch("content");
  const publishedAt = watch("published_at");

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanData: BlogPostFormData = cleanFormData(data, [
        "excerpt",
        "published_at",
      ]);

      // Convert empty published_at to null, or convert datetime-local to ISO 8601
      if (cleanData.published_at === "" || !cleanData.published_at) {
        cleanData.published_at = null;
      } else {
        // Convert datetime-local format to ISO 8601
        const date = new Date(cleanData.published_at);
        cleanData.published_at = date.toISOString();
      }

      await onSubmit(cleanData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  });

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    setValue("title", value, { shouldDirty: true });
    if (!post) {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slugValue, { shouldDirty: true });
    }
  };

  const handleBackdropClick = () => {
    handleExit(onCancel);
  };

  const handleCancelClick = () => {
    handleExit(onCancel);
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleExit(onCancel);
    }
  };

  const getPublishStatus = () => {
    if (!publishedAt) {
      return {
        label: "Draft",
        description:
          "This post is not published and won't be visible to others.",
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
      };
    }

    const publishDate = new Date(publishedAt);
    const now = new Date();

    if (publishDate > now) {
      return {
        label: "Scheduled",
        description: `This post will be published on ${publishDate.toLocaleString()}.`,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      };
    }

    return {
      label: "Published",
      description: `This post was published on ${publishDate.toLocaleString()}.`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    };
  };

  const publishStatus = getPublishStatus();

  return (
    <>
      <div
        className="bg-opacity-50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close and discard changes"
      >
        <div
          className="animate-slideUp flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-post-form-title"
        >
          <div className="px-6 pt-6 pb-4">
            <h2 id="blog-post-form-title" className="text-2xl font-bold">
              {post ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {/* Basic Info */}
              <div>
                <label
                  htmlFor="post-title"
                  className="mb-1 block text-sm font-medium"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="post-title"
                  {...register("title", {
                    required: true,
                    onChange: (e) => handleTitleChange(e.target.value),
                  })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="My Amazing Blog Post"
                />
              </div>

              <div>
                <label
                  htmlFor="post-slug"
                  className="mb-1 block text-sm font-medium"
                >
                  Slug *
                </label>
                <input
                  type="text"
                  id="post-slug"
                  {...register("slug", { required: true })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="my-amazing-blog-post"
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL-friendly identifier (lowercase, hyphens only)
                </p>
              </div>

              <div>
                <label
                  htmlFor="post-excerpt"
                  className="mb-1 block text-sm font-medium"
                >
                  Excerpt
                </label>
                <textarea
                  id="post-excerpt"
                  {...register("excerpt")}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                  placeholder="A short summary or teaser for your post..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optional short description shown in post listings
                </p>
              </div>

              {/* Content */}
              <MarkdownEditor
                label="Content *"
                value={content || ""}
                onChange={(value) =>
                  setValue("content", value, { shouldDirty: true })
                }
                placeholder="# My Post\n\nWrite your blog post content here..."
                helpText="Write your blog post content using markdown formatting."
                rows={15}
              />

              {/* Publishing */}
              <div>
                <label
                  htmlFor="post-published-at"
                  className="mb-1 block text-sm font-medium"
                >
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="post-published-at"
                  {...register("published_at")}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to save as draft. Set to future date to schedule
                  publication.
                </p>
              </div>

              {/* Status Display */}
              <div className={`rounded-lg p-4 ${publishStatus.bgColor}`}>
                <h4 className={`mb-2 font-medium ${publishStatus.color}`}>
                  Status: {publishStatus.label}
                </h4>
                <p className={`text-sm ${publishStatus.color}`}>
                  {publishStatus.description}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mb-4 rounded bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-300 px-6 py-4 dark:border-gray-600">
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Saving..." : post ? "Update Post" : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmExitDialog
        isOpen={showConfirmDialog}
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </>
  );
}
