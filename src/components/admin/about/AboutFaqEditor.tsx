"use client";

import AboutContentItemsEditor, {
  type ContentFieldConfig,
} from "@/components/admin/about/AboutContentItemsEditor";
import {
  groupAboutItemsBySection,
  mapAboutFaqsByType,
  type AboutContentItem,
  type AboutContentSection,
  type AboutFaq,
  type AboutPageData,
} from "@/lib/about";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type AboutFaqEditorProps = {
  data: AboutPageData;
  onUpdateFaq: (id: string, data: Record<string, unknown>) => Promise<void>;
  onCreateItem: (data: Record<string, unknown>) => Promise<void>;
  onUpdateItem: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
};

type FaqDraft = {
  question: string;
  display_order: number;
  programs_text: string;
  devices_text: string;
  brushes_procreate_text: string;
  brushes_paint_tool_sai_text: string;
  social_intro_text: string;
  social_note_prefix: string;
  social_display_name: string;
  social_note_suffix: string;
  commissions_text: string;
  username_template: string;
  username_prefix_left: string;
  username_prefix_right: string;
  username_result: string;
  alias_primary: string;
  alias_secondary: string;
  alias_description: string;
};

function toFaqDraft(faq: AboutFaq): FaqDraft {
  return {
    question: faq.question,
    display_order: faq.display_order,
    programs_text: faq.programs_text ?? "",
    devices_text: faq.devices_text ?? "",
    brushes_procreate_text: faq.brushes_procreate_text ?? "",
    brushes_paint_tool_sai_text: faq.brushes_paint_tool_sai_text ?? "",
    social_intro_text: faq.social_intro_text ?? "",
    social_note_prefix: faq.social_note_prefix ?? "",
    social_display_name: faq.social_display_name ?? "",
    social_note_suffix: faq.social_note_suffix ?? "",
    commissions_text: faq.commissions_text ?? "",
    username_template: faq.username_template ?? "",
    username_prefix_left: faq.username_prefix_left ?? "",
    username_prefix_right: faq.username_prefix_right ?? "",
    username_result: faq.username_result ?? "",
    alias_primary: faq.alias_primary ?? "",
    alias_secondary: faq.alias_secondary ?? "",
    alias_description: faq.alias_description ?? "",
  };
}

function serializeFaqDraft(draft: FaqDraft) {
  return {
    question: draft.question,
    display_order: Number(draft.display_order) || 0,
    programs_text: draft.programs_text.trim() || null,
    devices_text: draft.devices_text.trim() || null,
    brushes_procreate_text: draft.brushes_procreate_text.trim() || null,
    brushes_paint_tool_sai_text:
      draft.brushes_paint_tool_sai_text.trim() || null,
    social_intro_text: draft.social_intro_text.trim() || null,
    social_note_prefix: draft.social_note_prefix.trim() || null,
    social_display_name: draft.social_display_name.trim() || null,
    social_note_suffix: draft.social_note_suffix.trim() || null,
    commissions_text: draft.commissions_text.trim() || null,
    username_template: draft.username_template.trim() || null,
    username_prefix_left: draft.username_prefix_left.trim() || null,
    username_prefix_right: draft.username_prefix_right.trim() || null,
    username_result: draft.username_result.trim() || null,
    alias_primary: draft.alias_primary.trim() || null,
    alias_secondary: draft.alias_secondary.trim() || null,
    alias_description: draft.alias_description.trim() || null,
  };
}

function FaqField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: "text" | "number";
}) {
  const className =
    "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={String(value)}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          className={`${className} resize-y`}
        />
      ) : (
        <input
          type={type}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className={className}
        />
      )}
    </label>
  );
}

function FaqCard({
  faq,
  children,
  onUpdateFaq,
}: {
  faq: AboutFaq;
  children?: React.ReactNode;
  onUpdateFaq: (id: string, data: Record<string, unknown>) => Promise<void>;
}) {
  const [draft, setDraft] = useState<FaqDraft>(toFaqDraft(faq));
  const [saving, setSaving] = useState(false);
  const usernameTemplateRef = useRef<HTMLTextAreaElement | null>(null);
  const initialDraft = toFaqDraft(faq);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(initialDraft);

  useEffect(() => {
    setDraft(toFaqDraft(faq));
  }, [faq]);

  const setField = (key: keyof FaqDraft, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [key]: key === "display_order" ? Number(value || 0) : value,
    }));
  };

  const insertUsernameToken = (token: string) => {
    const textarea = usernameTemplateRef.current;

    if (!textarea) {
      setField(
        "username_template",
        `${draft.username_template}${draft.username_template ? " " : ""}${token}`,
      );
      return;
    }

    const selectionStart =
      textarea.selectionStart ?? draft.username_template.length;
    const selectionEnd = textarea.selectionEnd ?? selectionStart;
    const nextTemplate = `${draft.username_template.slice(0, selectionStart)}${token}${draft.username_template.slice(selectionEnd)}`;

    setField("username_template", nextTemplate);

    requestAnimationFrame(() => {
      const nextCursor = selectionStart + token.length;
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const renderSubtypeFields = () => {
    switch (faq.faq_type) {
      case "programs":
        return (
          <>
            <FaqField
              label="Programs Text"
              value={draft.programs_text}
              onChange={(value) => setField("programs_text", value)}
              multiline={true}
            />
            <FaqField
              label="Devices Text"
              value={draft.devices_text}
              onChange={(value) => setField("devices_text", value)}
              multiline={true}
            />
          </>
        );
      case "brushes":
        return (
          <>
            <FaqField
              label="Procreate Text"
              value={draft.brushes_procreate_text}
              onChange={(value) => setField("brushes_procreate_text", value)}
              multiline={true}
            />
            <FaqField
              label="Paint Tool SAI Text"
              value={draft.brushes_paint_tool_sai_text}
              onChange={(value) =>
                setField("brushes_paint_tool_sai_text", value)
              }
              multiline={true}
            />
          </>
        );
      case "social":
        return (
          <>
            <FaqField
              label="Intro Text"
              value={draft.social_intro_text}
              onChange={(value) => setField("social_intro_text", value)}
              multiline={true}
            />
            <FaqField
              label="Note Prefix"
              value={draft.social_note_prefix}
              onChange={(value) => setField("social_note_prefix", value)}
              multiline={true}
            />
            <FaqField
              label="Styled Display Name"
              value={draft.social_display_name}
              onChange={(value) => setField("social_display_name", value)}
            />
            <FaqField
              label="Note Suffix"
              value={draft.social_note_suffix}
              onChange={(value) => setField("social_note_suffix", value)}
              multiline={true}
            />
          </>
        );
      case "commissions":
        return (
          <FaqField
            label="Commissions Text"
            value={draft.commissions_text}
            onChange={(value) => setField("commissions_text", value)}
            multiline={true}
          />
        );
      case "username":
        return (
          <>
            <div className="space-y-3 rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 p-4 md:col-span-2 dark:border-violet-900/60 dark:bg-violet-950/20">
              <div>
                <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                  Username Line Template
                </p>
                <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
                  Edit the full sentence and drop styled variables wherever they
                  belong.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["{{left}}", "Insert {{left}}"],
                  ["{{right}}", "Insert {{right}}"],
                  ["{{result}}", "Insert {{result}}"],
                ].map(([token, label]) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => insertUsernameToken(token)}
                    className="rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-gray-950 dark:text-violet-300 dark:hover:bg-violet-950/40"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Template
                </span>
                <textarea
                  ref={usernameTemplateRef}
                  value={draft.username_template}
                  rows={3}
                  placeholder="{{left}}skeleton + {{right}} = {{result}}"
                  onChange={(event) =>
                    setField("username_template", event.target.value)
                  }
                  className="resize-y rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
              </label>
            </div>
            <FaqField
              label="Left Word"
              value={draft.username_prefix_left}
              onChange={(value) => setField("username_prefix_left", value)}
            />
            <FaqField
              label="Right Word"
              value={draft.username_prefix_right}
              onChange={(value) => setField("username_prefix_right", value)}
            />
            <FaqField
              label="Result"
              value={draft.username_result}
              onChange={(value) => setField("username_result", value)}
            />
          </>
        );
      case "alias":
        return (
          <>
            <FaqField
              label="Primary Alias"
              value={draft.alias_primary}
              onChange={(value) => setField("alias_primary", value)}
            />
            <FaqField
              label="Secondary Alias"
              value={draft.alias_secondary}
              onChange={(value) => setField("alias_secondary", value)}
            />
            <FaqField
              label="Description"
              value={draft.alias_description}
              onChange={(value) => setField("alias_description", value)}
              multiline={true}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <details className="group rounded-[1.75rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
            FAQ Type
          </p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            {faq.faq_type}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {faq.question}
          </p>
        </div>
        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="space-y-4 border-t border-gray-200 p-5 dark:border-gray-800">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={async () => {
              setSaving(true);
              try {
                await onUpdateFaq(faq.id, serializeFaqDraft(draft));
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || !hasChanges}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save FAQ"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FaqField
            label="Question"
            value={draft.question}
            onChange={(value) => setField("question", value)}
          />
          <FaqField
            label="Display Order"
            value={draft.display_order}
            type="number"
            onChange={(value) => setField("display_order", value)}
          />
          {renderSubtypeFields()}
        </div>

        {children}
      </div>
    </details>
  );
}

function sectionFields(section: AboutContentSection): ContentFieldConfig[] {
  switch (section) {
    case "faq_program_other":
      return [
        { key: "title", label: "Label", type: "text" },
        { key: "body", label: "Body", type: "textarea", rows: 3 },
        { key: "display_order", label: "Display Order", type: "number" },
      ];
    case "faq_brush_inside":
    case "faq_brush_outside":
      return [
        { key: "title", label: "Brush Name", type: "text" },
        { key: "url", label: "Brush URL", type: "text" },
        { key: "display_order", label: "Display Order", type: "number" },
      ];
    case "faq_permission_allowed":
    case "faq_permission_prohibited":
      return [
        { key: "title", label: "Policy Label", type: "text" },
        { key: "body", label: "Policy Text", type: "textarea", rows: 3 },
        { key: "display_order", label: "Display Order", type: "number" },
      ];
    case "faq_asset_credit":
      return [
        { key: "title", label: "Credit Label", type: "text" },
        { key: "subtitle", label: "Display Name", type: "text" },
        { key: "url", label: "Credit URL", type: "text" },
        { key: "display_order", label: "Display Order", type: "number" },
      ];
    case "faq_artist":
      return [
        { key: "title", label: "Artist Name", type: "text" },
        { key: "display_order", label: "Display Order", type: "number" },
      ];
    default:
      return [];
  }
}

function RelatedItems({
  title,
  description,
  section,
  items,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: {
  title: string;
  description?: string;
  section: AboutContentSection;
  items: AboutContentItem[];
  onCreateItem: (data: Record<string, unknown>) => Promise<void>;
  onUpdateItem: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
}) {
  return (
    <AboutContentItemsEditor
      title={title}
      description={description}
      section={section}
      items={items}
      fields={sectionFields(section)}
      onCreate={onCreateItem}
      onUpdate={onUpdateItem}
      onDelete={onDeleteItem}
    />
  );
}

export default function AboutFaqEditor({
  data,
  onUpdateFaq,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
}: AboutFaqEditorProps) {
  const faqByType = mapAboutFaqsByType(data.faqs);
  const itemsBySection = groupAboutItemsBySection(data.items);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-violet-200 bg-linear-to-br from-violet-50 via-white to-fuchsia-50 p-6 dark:border-violet-900/70 dark:from-violet-950/40 dark:via-gray-950 dark:to-fuchsia-950/30">
        <p className="text-xs font-semibold tracking-[0.2em] text-violet-600 uppercase dark:text-violet-400">
          FAQ Control
        </p>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          Fixed FAQ Renderer
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
          Each card maps to one of the nine public FAQ renderers. Question text
          and order are editable, but the renderer types stay fixed.
        </p>
      </div>

      {data.faqs.map((faq) => {
        const stableFaq = faqByType[faq.faq_type as keyof typeof faqByType];

        if (!stableFaq) {
          return null;
        }

        return (
          <FaqCard key={stableFaq.id} faq={stableFaq} onUpdateFaq={onUpdateFaq}>
            {stableFaq.faq_type === "programs" ? (
              <RelatedItems
                title="Programs: Other Stuff Rows"
                section="faq_program_other"
                items={itemsBySection.faq_program_other}
                onCreateItem={onCreateItem}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
              />
            ) : null}

            {stableFaq.faq_type === "brushes" ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <RelatedItems
                  title="Brushes: Inside Clip Studio Assets"
                  section="faq_brush_inside"
                  items={itemsBySection.faq_brush_inside}
                  onCreateItem={onCreateItem}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                />
                <RelatedItems
                  title="Brushes: Outside Clip Studio Assets"
                  section="faq_brush_outside"
                  items={itemsBySection.faq_brush_outside}
                  onCreateItem={onCreateItem}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                />
              </div>
            ) : null}

            {stableFaq.faq_type === "permissions" ? (
              <div className="grid gap-4 xl:grid-cols-2">
                <RelatedItems
                  title="Allowed Policies"
                  section="faq_permission_allowed"
                  items={itemsBySection.faq_permission_allowed}
                  onCreateItem={onCreateItem}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                />
                <RelatedItems
                  title="Prohibited Policies"
                  section="faq_permission_prohibited"
                  items={itemsBySection.faq_permission_prohibited}
                  onCreateItem={onCreateItem}
                  onUpdateItem={onUpdateItem}
                  onDeleteItem={onDeleteItem}
                />
              </div>
            ) : null}

            {stableFaq.faq_type === "assets" ? (
              <RelatedItems
                title="Asset Credits"
                section="faq_asset_credit"
                items={itemsBySection.faq_asset_credit}
                onCreateItem={onCreateItem}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
              />
            ) : null}

            {stableFaq.faq_type === "artists" ? (
              <RelatedItems
                title="Artist Inspirations"
                section="faq_artist"
                items={itemsBySection.faq_artist}
                onCreateItem={onCreateItem}
                onUpdateItem={onUpdateItem}
                onDeleteItem={onDeleteItem}
              />
            ) : null}
          </FaqCard>
        );
      })}
    </div>
  );
}
