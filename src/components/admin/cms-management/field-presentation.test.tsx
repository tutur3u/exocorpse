import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ExocorpseCmsFieldDefinition } from "@/types/exocorpse-cms";
import type { CmsEntryDraft } from "./editor-types";
import CmsStructuredFields from "./CmsStructuredFields";
import { isMultilineField } from "./field-presentation";

const field = (
  key: string,
  field_type: ExocorpseCmsFieldDefinition["field_type"] = "string",
): ExocorpseCmsFieldDefinition => ({
  key,
  field_type,
  id: key,
  label: key,
  collection_id: null,
  field_scope: "profile_data",
  default_value: null,
  description: null,
  is_enabled: true,
  is_required: false,
  options: [],
  sort_order: 0,
  source: "legacy",
});
const draft: CmsEntryDraft = {
  id: "character",
  collection_id: "characters",
  title: "Character",
  slug: "character",
  status: "draft",
  subtitle: null,
  summary: null,
  profile_data: {},
  metadata: {},
  scheduled_for: null,
  sort_order: 0,
  updated_at: "2026-10-10",
};
const renderField = (definition: ExocorpseCmsFieldDefinition) =>
  renderToStaticMarkup(
    <CmsStructuredFields
      definitions={[definition]}
      draft={draft}
      onChange={() => {}}
      compact
    />,
  );

describe("structured editor control widths", () => {
  for (const key of [
    "personalitySummary",
    "abilities",
    "distinguishingFeatures",
    "fanworkPolicy",
    "notes",
  ]) {
    test(`legacy string ${key} occupies the complete grid row`, () => {
      const html = renderField(field(key));
      expect(isMultilineField(field(key))).toBe(true);
      expect(html).toContain('<div class="min-w-0 @xl:col-span-2">');
      expect(html).toContain(
        key === "distinguishingFeatures"
          ? "<textarea"
          : 'class="admin-markdown-editor"',
      );
    });
  }
  for (const type of ["markdown", "string-array", "json"] as const) {
    test(`${type} controls remain full width`, () => {
      const html = renderField(field("customField", type));
      expect(html).toContain(
        type === "json"
          ? "More options"
          : '<div class="min-w-0 @xl:col-span-2">',
      );
    });
  }
  test("short strings and quote keep short-input rendering and sizing", () => {
    for (const key of ["name", "quote"]) {
      expect(isMultilineField(field(key))).toBe(false);
      const html = renderField(field(key));
      expect(html).toContain('<div class="min-w-0">');
      expect(html).toContain("<input");
      expect(html).not.toContain("admin-markdown-editor");
    }
  });
});
