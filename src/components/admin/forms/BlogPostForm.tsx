"use client";

import { ConfirmExitDialog } from "@/components/shared/ConfirmDialog";
import ImageUploader from "@/components/shared/ImageUploader";
import MarkdownEditor from "@/components/shared/MarkdownEditor";
import { useFormDirtyState } from "@/hooks/useFormDirtyState";
import type { BlogPost } from "@/lib/actions/blog";
import { updateBlogPost } from "@/lib/actions/blog";
import { deleteBlogImage } from "@/lib/actions/storage";
import { cleanFormData } from "@/lib/forms";
import { uploadPendingFile } from "@/lib/uploadHelpers";
import { CalendarClock, FileText, Link2, NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type BlogPostFormData = {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_url?: string;
  published_at?: string | null;
};

type BlogPostFormProps = {
  post?: BlogPost;
  onSubmit: (data: BlogPostFormData) => Promise<BlogPost | void>;
  onComplete: () => void;
  onCancel: () => void;
};

function formatDatetimeLocal(dateString: string | null | undefined) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getFieldClassName(hasError: boolean) {
  return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
    hasError
      ? "border-red-400 bg-red-50/70 text-red-950 focus:border-red-500 dark:border-red-500/70 dark:bg-red-950/30 dark:text-red-50"
      : "border-zinc-200 bg-zinc-50/85 text-zinc-950 focus:border-red-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:focus:border-red-400"
  }`;
}

export default function BlogPostForm({
  post,
  onSubmit,
  onComplete,
  onCancel,
}: BlogPostFormProps) {
  const form = useForm<BlogPostFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      cover_url: post?.cover_url || "",
      published_at: formatDatetimeLocal(post?.published_at) || "",
    },
  });

  const {
    register,
    handleSubmit: formHandleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;
  const { isDirty, handleExit, showConfirmDialog, confirmExit, cancelExit } =
    useFormDirtyState(form);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingCoverImage, setPendingCoverImage] = useState<File | null>(null);

  const slug = watch("slug");
  const excerpt = watch("excerpt");
  const content = watch("content");
  const coverUrl = watch("cover_url");
  const publishedAt = watch("published_at");

  const handleDeleteOldImage = async (oldImagePath: string) => {
    if (
      !oldImagePath ||
      oldImagePath.startsWith("http") ||
      oldImagePath.startsWith("pending:")
    ) {
      return;
    }

    try {
      await deleteBlogImage(oldImagePath);
    } catch (err) {
      console.error("Failed to delete old image:", err);
    }
  };

  useEffect(() => {
    reset({
      title: post?.title || "",
      slug: post?.slug || "",
      excerpt: post?.excerpt || "",
      content: post?.content || "",
      cover_url: post?.cover_url || "",
      published_at: formatDatetimeLocal(post?.published_at) || "",
    });
    setPendingCoverImage(null);
    setLoading(false);
    setUploadProgress(null);
    setError(null);
  }, [post, reset]);

  const handleFormSubmit = formHandleSubmit(async (data) => {
    setLoading(true);
    setUploadProgress(null);
    setError(null);

    try {
      const cleanData: BlogPostFormData = cleanFormData(data, [
        "excerpt",
        "cover_url",
        "published_at",
      ]);

      if (cleanData.published_at === "" || !cleanData.published_at) {
        cleanData.published_at = null;
      } else {
        cleanData.published_at = new Date(cleanData.published_at).toISOString();
      }

      const submitData = {
        ...cleanData,
        cover_url: cleanData.cover_url?.startsWith("pending:")
          ? undefined
          : cleanData.cover_url,
      };

      setUploadProgress("Saving blog post...");
      const result = await onSubmit(submitData);

      if (result && pendingCoverImage) {
        try {
          setUploadProgress("Uploading cover image...");
          const uploadedPath = await uploadPendingFile(
            pendingCoverImage,
            `blog/${result.id}`,
          );

          setUploadProgress("Updating cover image reference...");
          await updateBlogPost(result.id, {
            cover_url: uploadedPath,
          });

          setPendingCoverImage(null);
          setUploadProgress("Complete!");
        } catch (uploadError) {
          console.error("Failed to upload cover image:", uploadError);
          setError(
            "The post was saved, but the cover image upload failed. Reopen the post and upload the image again.",
          );
          setLoading(false);
          return;
        }
      }

      setUploadProgress(null);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setUploadProgress(null);
    } finally {
      setLoading(false);
    }
  });

  const handleTitleChange = (value: string) => {
    setValue("title", value, { shouldDirty: true, shouldValidate: true });

    if (!post) {
      const slugValue = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const finalSlug = slugValue || `post-${Date.now()}`;

      setValue("slug", finalSlug, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleBackdropKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleExit(onCancel);
    }
  };

  const getPublishStatus = () => {
    if (!publishedAt) {
      return {
        label: "Draft",
        description:
          "No publish date is set yet. The post stays private until you schedule or publish it.",
        panelClassName:
          "border-zinc-200 bg-zinc-50/90 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300",
      };
    }

    const publishDate = new Date(publishedAt);
    const now = new Date();

    if (publishDate > now) {
      return {
        label: "Scheduled",
        description: `This post will go live on ${publishDate.toLocaleString()}.`,
        panelClassName:
          "border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
      };
    }

    return {
      label: "Published",
      description: `This post is already live and visible from ${publishDate.toLocaleString()}.`,
      panelClassName:
        "border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
    };
  };

  const publishStatus = getPublishStatus();
  const previewPath = slug ? `/blog/${slug}` : "/blog/[slug]";

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        aria-label="Close blog post editor"
        onClick={() => handleExit(onCancel)}
        onKeyDown={handleBackdropKeyDown}
      >
        <div
          className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-post-form-title"
        >
          <div className="flex max-h-[92vh] w-full flex-col overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[linear-gradient(180deg,_rgba(255,252,249,0.98),_rgba(247,242,236,0.96))] shadow-[0_40px_140px_-60px_rgba(0,0,0,0.75)] dark:border-zinc-800/80 dark:bg-[linear-gradient(180deg,_rgba(22,22,24,0.98),_rgba(10,10,12,0.98))]">
            <div className="border-b border-zinc-200/80 px-6 py-5 @lg:px-8 dark:border-zinc-800/80">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-[0.32em] text-red-700 uppercase dark:text-red-300">
                    {post ? "Edit Sequence" : "Draft Sequence"}
                  </p>
                  <h2
                    id="blog-post-form-title"
                    className="mt-2 font-serif text-3xl text-zinc-950 dark:text-zinc-50"
                  >
                    {post ? "Edit Blog Post" : "Create Blog Post"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    Tighten the metadata, sharpen the excerpt, and control when
                    the archive entry becomes visible.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {publishStatus.label}
                  </div>
                  <div className="mt-1 text-xs tracking-[0.22em] uppercase">
                    {post ? "Editing existing entry" : "New archive entry"}
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="@container flex-1 overflow-y-auto px-6 py-6 @lg:px-8">
                <div className="grid gap-6 @2xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.8fr)]">
                  <div className="space-y-6">
                    {uploadProgress && (
                      <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50/90 p-4 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700 dark:border-blue-700 dark:border-t-blue-200" />
                          <p className="font-medium">{uploadProgress}</p>
                        </div>
                      </div>
                    )}

                    <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white/75 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                          <NotebookPen className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                            Post identity
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Title, URL slug, and the public-facing teaser.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 @xl:grid-cols-2">
                        <div className="@xl:col-span-2">
                          <label
                            htmlFor="post-title"
                            className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                          >
                            Title
                          </label>
                          <input
                            id="post-title"
                            type="text"
                            aria-invalid={errors.title ? "true" : "false"}
                            {...register("title", {
                              required: "Title is required.",
                              minLength: {
                                value: 3,
                                message:
                                  "Use at least 3 characters so the post reads like a real entry.",
                              },
                              onChange: (event) =>
                                handleTitleChange(event.target.value),
                            })}
                            className={getFieldClassName(Boolean(errors.title))}
                            placeholder="The anatomy of a perfect archive entry"
                          />
                          {errors.title && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                              {errors.title.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="post-slug"
                            className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                          >
                            Slug
                          </label>
                          <input
                            id="post-slug"
                            type="text"
                            aria-invalid={errors.slug ? "true" : "false"}
                            {...register("slug", {
                              required: "Slug is required.",
                              pattern: {
                                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                message:
                                  "Use lowercase letters, numbers, and single hyphens only.",
                              },
                            })}
                            className={getFieldClassName(Boolean(errors.slug))}
                            placeholder="anatomy-of-a-perfect-archive-entry"
                          />
                          {errors.slug ? (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                              {errors.slug.message}
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                              Preview URL: {previewPath}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="post-published-at"
                            className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                          >
                            Publish date
                          </label>
                          <input
                            id="post-published-at"
                            type="datetime-local"
                            {...register("published_at")}
                            className={getFieldClassName(false)}
                          />
                          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                            Leave empty to keep it private. Use a future date to
                            schedule publication.
                          </p>
                        </div>

                        <div className="@xl:col-span-2">
                          <label
                            htmlFor="post-excerpt"
                            className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                          >
                            Excerpt
                          </label>
                          <textarea
                            id="post-excerpt"
                            rows={4}
                            {...register("excerpt", {
                              maxLength: {
                                value: 280,
                                message:
                                  "Keep the excerpt under 280 characters for tighter archive cards.",
                              },
                            })}
                            className={getFieldClassName(
                              Boolean(errors.excerpt),
                            )}
                            placeholder="A compact teaser that makes the archive card feel intentional."
                          />
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                            {errors.excerpt ? (
                              <p className="text-red-600 dark:text-red-300">
                                {errors.excerpt.message}
                              </p>
                            ) : (
                              <p className="text-zinc-500 dark:text-zinc-500">
                                Optional, but strongly recommended for the list
                                view.
                              </p>
                            )}
                            <span className="text-zinc-500 dark:text-zinc-500">
                              {(excerpt || "").length}/280
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white/75 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-700 text-white dark:bg-red-500 dark:text-zinc-950">
                          <FileText className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                            Content
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Write the full post body in markdown.
                          </p>
                        </div>
                      </div>

                      <input
                        type="hidden"
                        {...register("content", {
                          required: "Content is required.",
                          validate: (value) =>
                            value.trim().length > 0 ||
                            "Content cannot be empty.",
                        })}
                      />

                      <div className="mt-5">
                        <MarkdownEditor
                          label="Body copy"
                          value={content || ""}
                          onChange={(value) =>
                            setValue("content", value, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          placeholder="# My Post\n\nWrite your blog post content here..."
                          helpText="Markdown is supported. Paste images directly into the editor if needed."
                          rows={18}
                          uploadPath={
                            post
                              ? `blog/${post.id}/content`
                              : "blog/drafts/content"
                          }
                        />
                        {errors.content && (
                          <p className="mt-3 text-sm text-red-600 dark:text-red-300">
                            {errors.content.message}
                          </p>
                        )}
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-6">
                    <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white/75 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white dark:bg-amber-400 dark:text-zinc-950">
                          <CalendarClock className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                            Publish state
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Review the post’s current visibility at a glance.
                          </p>
                        </div>
                      </div>

                      <div
                        className={`mt-5 rounded-[1.5rem] border p-4 ${publishStatus.panelClassName}`}
                      >
                        <p className="text-xs font-semibold tracking-[0.24em] uppercase">
                          {publishStatus.label}
                        </p>
                        <p className="mt-3 text-sm leading-6">
                          {publishStatus.description}
                        </p>
                      </div>

                      <dl className="mt-4 grid gap-3 text-sm">
                        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/85 p-3 dark:border-zinc-800 dark:bg-zinc-900/80">
                          <dt className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-500">
                            Draft state
                          </dt>
                          <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
                            {isDirty
                              ? "Unsaved changes pending"
                              : "All changes saved locally"}
                          </dd>
                        </div>
                        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/85 p-3 dark:border-zinc-800 dark:bg-zinc-900/80">
                          <dt className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase dark:text-zinc-500">
                            Cover upload
                          </dt>
                          <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
                            {pendingCoverImage
                              ? `Pending upload: ${pendingCoverImage.name}`
                              : coverUrl
                                ? "Cover image attached"
                                : "No cover image"}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    <section className="rounded-[1.75rem] border border-zinc-200/80 bg-white/75 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950">
                          <Link2 className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                            Cover image
                          </h3>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Attach a visual anchor for the archive card.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <ImageUploader
                          label="Cover Image"
                          value={coverUrl || ""}
                          onChange={(value) =>
                            setValue("cover_url", value, {
                              shouldDirty: true,
                            })
                          }
                          onFileSelect={(file) => setPendingCoverImage(file)}
                          onBeforeChange={async (oldValue, newValue) => {
                            if (oldValue && oldValue !== newValue) {
                              await handleDeleteOldImage(oldValue);
                            }
                          }}
                          enableUpload={!!post}
                          uploadPath={post ? `blog/${post.id}` : undefined}
                          disableUrlInput={!post}
                          helpText={
                            post
                              ? "Upload a cover image directly to storage."
                              : "Pick a file now. It uploads right after the post is created."
                          }
                        />
                      </div>
                    </section>
                  </aside>
                </div>
              </div>

              {error && (
                <div className="mx-6 mb-4 rounded-[1.25rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 @lg:mx-8 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/80 px-6 py-4 @lg:px-8 dark:border-zinc-800/80">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {slug ? (
                    <span>Preview path: {previewPath}</span>
                  ) : (
                    <span>Add a title to generate the post slug.</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleExit(onCancel)}
                    disabled={loading}
                    className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:text-zinc-950 dark:hover:bg-red-500"
                  >
                    {loading
                      ? "Saving..."
                      : post
                        ? "Update post"
                        : "Create post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
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
