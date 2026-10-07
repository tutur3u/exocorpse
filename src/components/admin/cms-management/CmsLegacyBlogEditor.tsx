"use client";

import { CalendarClock, FileText, Link2, NotebookPen } from "lucide-react";
import type { ReactNode } from "react";
import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import type { CmsBlockDraft, CmsEntryDraft } from "./editor-types";
import { isJsonRecord } from "./editor-utils";
import {
  legacyMarkdownBlock,
  updateLegacyMarkdownBlock,
} from "./legacy-blocks";

const panelClass =
  "rounded-[1.75rem] border border-zinc-200/80 bg-white/75 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/40";
const fieldClass =
  "w-full appearance-none rounded-2xl border border-zinc-200 bg-zinc-50/85 px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white [color-scheme:light] dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-red-400 dark:[color-scheme:dark]";

export function blogPublishDate(draft: CmsEntryDraft): string {
  const profile = isJsonRecord(draft.profile_data) ? draft.profile_data : {};
  return draft.status === "scheduled"
    ? (draft.scheduled_for ?? "")
    : draft.status === "published" && typeof profile.publishedAt === "string"
      ? profile.publishedAt
      : "";
}

export function blogPublishState(date: string) {
  if (!date)
    return {
      label: "Draft",
      description:
        "No publish date is set yet. The post stays private until you schedule or publish it.",
      panelClass:
        "border-zinc-200 bg-zinc-50/90 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300",
    };
  if (new Date(date) > new Date())
    return {
      label: "Scheduled",
      description: `This post will go live on ${new Date(date).toLocaleString()}.`,
      panelClass:
        "border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200",
    };
  return {
    label: "Published",
    description: `This post is already live and visible from ${new Date(date).toLocaleString()}.`,
    panelClass:
      "border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200",
  };
}

function localDate(date: string) {
  if (!date) return "";
  const value = new Date(date);
  if (!Number.isFinite(value.getTime())) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}T${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function Heading({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          {title}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
const iconClass =
  "flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950";

export default function CmsLegacyBlogEditor({
  draft,
  blocks,
  onDraftChange,
  onTitleChange,
  onBlocksChange,
  onImageUpload,
  media,
  isDirty,
  pendingFileName,
  hasCover,
}: {
  draft: CmsEntryDraft;
  blocks: CmsBlockDraft[];
  onDraftChange: (draft: CmsEntryDraft) => void;
  onTitleChange: (title: string) => void;
  onBlocksChange: (blocks: CmsBlockDraft[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
  media: ReactNode;
  isDirty: boolean;
  pendingFileName?: string;
  hasCover: boolean;
}) {
  const date = blogPublishDate(draft);
  const state = blogPublishState(date);
  const profile = isJsonRecord(draft.profile_data) ? draft.profile_data : {};
  const previewPath = draft.slug ? `/blog/${draft.slug}` : "/blog/[slug]";
  return (
    <div className="grid gap-6 @2xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.8fr)]">
      <div className="space-y-6">
        <section className={panelClass}>
          <Heading
            description="Title, URL slug, and the public-facing teaser."
            icon={
              <span className={iconClass}>
                <NotebookPen className="h-5 w-5" />
              </span>
            }
            title="Post identity"
          />
          <div className="mt-5 grid gap-4 @xl:grid-cols-2">
            <label className="block @xl:col-span-2">
              <span className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Title
              </span>
              <input
                className={fieldClass}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="The anatomy of a perfect archive entry"
                required
                value={draft.title}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Slug
              </span>
              <input
                className={fieldClass}
                onChange={(event) =>
                  onDraftChange({ ...draft, slug: event.target.value })
                }
                placeholder="anatomy-of-a-perfect-archive-entry"
                required
                value={draft.slug}
              />
              <span className="mt-2 block text-xs text-zinc-500">
                Preview URL: {previewPath}
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Publish date
              </span>
              <input
                className={fieldClass}
                onChange={(event) => {
                  const publishedAt = event.target.value
                    ? new Date(event.target.value).toISOString()
                    : null;
                  const scheduled = Boolean(
                    publishedAt && new Date(publishedAt) > new Date(),
                  );
                  onDraftChange({
                    ...draft,
                    status: !publishedAt
                      ? "draft"
                      : scheduled
                        ? "scheduled"
                        : "published",
                    scheduled_for: scheduled ? publishedAt : null,
                    profile_data: { ...profile, publishedAt },
                  });
                }}
                type="datetime-local"
                value={localDate(date)}
              />
              <span className="mt-2 block text-xs text-zinc-500">
                Leave empty to keep it private. Use a future date to schedule
                publication.
              </span>
            </label>
            <label className="block @xl:col-span-2">
              <span className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Excerpt
              </span>
              <textarea
                className={fieldClass}
                maxLength={280}
                onChange={(event) =>
                  onDraftChange({
                    ...draft,
                    summary: event.target.value || null,
                  })
                }
                placeholder="A compact teaser that makes the archive card feel intentional."
                rows={4}
                value={draft.summary ?? ""}
              />
              <span className="mt-2 flex justify-between gap-3 text-xs text-zinc-500">
                <span>
                  Optional, but strongly recommended for the list view.
                </span>
                <span>{(draft.summary ?? "").length}/280</span>
              </span>
            </label>
          </div>
        </section>
        <section className={panelClass}>
          <Heading
            description="Write the full post body in markdown."
            icon={
              <span className={`${iconClass} bg-red-700 dark:bg-red-500`}>
                <FileText className="h-5 w-5" />
              </span>
            }
            title="Content"
          />
          <div className="mt-5">
            <AdminMarkdownEditor
              onChange={(value) =>
                onBlocksChange(
                  updateLegacyMarkdownBlock(blocks, "Content", value),
                )
              }
              onImageUpload={onImageUpload}
              placeholder={"# My Post\n\nWrite your blog post content here..."}
              rows={18}
              value={legacyMarkdownBlock(blocks, "Content")?.contentText ?? ""}
            />
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        <section className={panelClass}>
          <Heading
            description="Review the post’s current visibility at a glance."
            icon={
              <span className={`${iconClass} bg-amber-500 dark:bg-amber-400`}>
                <CalendarClock className="h-5 w-5" />
              </span>
            }
            title="Publish state"
          />
          <div
            className={`mt-5 rounded-[1.5rem] border p-4 ${state.panelClass}`}
          >
            <p className="text-xs font-semibold tracking-[0.24em] uppercase">
              {state.label}
            </p>
            <p className="mt-3 text-sm leading-6">{state.description}</p>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            {[
              [
                "Draft state",
                isDirty
                  ? "Unsaved changes pending"
                  : "All changes saved locally",
              ],
              [
                "Cover upload",
                pendingFileName
                  ? `Pending upload: ${pendingFileName}`
                  : hasCover
                    ? "Cover image attached"
                    : "No cover image",
              ],
            ].map(([label, value]) => (
              <div
                className="rounded-2xl border border-zinc-200/80 bg-zinc-50/85 p-3 dark:border-zinc-800 dark:bg-zinc-900/80"
                key={label}
              >
                <dt className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-zinc-800 dark:text-zinc-200">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className={panelClass}>
          <Heading
            description="Attach a visual anchor for the archive card."
            icon={
              <span className={iconClass}>
                <Link2 className="h-5 w-5" />
              </span>
            }
            title="Cover image"
          />
          <div className="mt-5">{media}</div>
        </section>
      </aside>
    </div>
  );
}
