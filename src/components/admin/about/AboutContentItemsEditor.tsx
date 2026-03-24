"use client";

import type { AboutContentItem, AboutContentSection } from "@/lib/about";
import { useEffect, useMemo, useState } from "react";

type FieldOption = {
  label: string;
  value: string;
};

export type ContentFieldConfig = {
  key:
    | "title"
    | "subtitle"
    | "body"
    | "url"
    | "icon_key"
    | "color_key"
    | "display_order"
    | "is_full_width"
    | "variant";
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox";
  placeholder?: string;
  rows?: number;
  options?: FieldOption[];
};

type AboutContentItemDraft = {
  section: AboutContentSection;
  variant: string;
  title: string;
  subtitle: string;
  body: string;
  url: string;
  icon_key: string;
  color_key: string;
  display_order: number;
  is_full_width: boolean;
};

type AboutContentItemsEditorProps = {
  title: string;
  description?: string;
  section: AboutContentSection;
  items: AboutContentItem[];
  fields: ContentFieldConfig[];
  onCreate: (data: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function createDraft(
  section: AboutContentSection,
  item?: AboutContentItem,
  displayOrder = 0,
): AboutContentItemDraft {
  return {
    section,
    variant: item?.variant ?? "",
    title: item?.title ?? "",
    subtitle: item?.subtitle ?? "",
    body: item?.body ?? "",
    url: item?.url ?? "",
    icon_key: item?.icon_key ?? "",
    color_key: item?.color_key ?? "",
    display_order: item?.display_order ?? displayOrder,
    is_full_width: item?.is_full_width ?? false,
  };
}

function serializeDraft(draft: AboutContentItemDraft) {
  return {
    section: draft.section,
    variant: draft.variant.trim() || null,
    title: draft.title.trim() || null,
    subtitle: draft.subtitle.trim() || null,
    body: draft.body,
    url: draft.url.trim() || null,
    icon_key: draft.icon_key.trim() || null,
    color_key: draft.color_key.trim() || null,
    display_order: Number(draft.display_order) || 0,
    is_full_width: draft.is_full_width,
  };
}

function ItemCard({
  item,
  section,
  fields,
  onUpdate,
  onDelete,
}: {
  item: AboutContentItem;
  section: AboutContentSection;
  fields: ContentFieldConfig[];
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AboutContentItemDraft>(
    createDraft(section, item),
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDraft(createDraft(section, item));
  }, [item, section]);

  const setField = (
    key: keyof AboutContentItemDraft,
    value: string | number | boolean,
  ) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase dark:text-gray-400">
            Existing Item
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ID: {item.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              setSaving(true);
              try {
                await onUpdate(item.id, serializeDraft(draft));
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || deleting}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={async () => {
              setDeleting(true);
              try {
                await onDelete(item.id);
              } finally {
                setDeleting(false);
              }
            }}
            disabled={saving || deleting}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {field.label}
            </span>
            <FieldInput field={field} draft={draft} onChange={setField} />
          </label>
        ))}
      </div>
    </div>
  );
}

function FieldInput({
  field,
  draft,
  onChange,
}: {
  field: ContentFieldConfig;
  draft: AboutContentItemDraft;
  onChange: (
    key: keyof AboutContentItemDraft,
    value: string | number | boolean,
  ) => void;
}) {
  const value = draft[field.key];
  const baseInputClass =
    "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value)}
        rows={field.rows ?? 3}
        placeholder={field.placeholder}
        onChange={(event) => onChange(field.key, event.target.value)}
        className={`${baseInputClass} resize-y`}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value)}
        onChange={(event) => onChange(field.key, event.target.value)}
        className={baseInputClass}
      >
        <option value="">Select...</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-900">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.key, event.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-gray-700 dark:text-gray-300">{field.label}</span>
      </label>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : "text"}
      value={field.type === "number" ? Number(value) : String(value)}
      placeholder={field.placeholder}
      onChange={(event) =>
        onChange(
          field.key,
          field.type === "number"
            ? Number(event.target.value || 0)
            : event.target.value,
        )
      }
      className={baseInputClass}
    />
  );
}

export default function AboutContentItemsEditor({
  title,
  description,
  section,
  items,
  fields,
  onCreate,
  onUpdate,
  onDelete,
}: AboutContentItemsEditorProps) {
  const nextOrder = useMemo(() => {
    if (!items.length) {
      return 0;
    }

    return Math.max(...items.map((item) => item.display_order)) + 1;
  }, [items]);

  const [newItem, setNewItem] = useState<AboutContentItemDraft>(
    createDraft(section, undefined, nextOrder),
  );
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setNewItem(createDraft(section, undefined, nextOrder));
  }, [nextOrder, section]);

  const setNewField = (
    key: keyof AboutContentItemDraft,
    value: string | number | boolean,
  ) => {
    setNewItem((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-gray-200 bg-linear-to-br from-white via-white to-gray-50 p-5 shadow-sm dark:border-gray-800 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          ) : null}
        </div>
        <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium tracking-[0.2em] text-gray-500 uppercase dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            section={section}
            fields={fields}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Add Item
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create a new row for this section.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              setCreating(true);
              try {
                await onCreate(serializeDraft(newItem));
              } finally {
                setCreating(false);
              }
            }}
            disabled={creating}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Add Item"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </span>
              <FieldInput
                field={field}
                draft={newItem}
                onChange={setNewField}
              />
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}
