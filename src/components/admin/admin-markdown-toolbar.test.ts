import { describe, expect, test } from "bun:test";
import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { toolbarOverflowStartIndex } from "./admin-markdown-toolbar";

describe("admin Markdown toolbar overflow", () => {
  test("does not reserve or show overflow when every tool fits", () => {
    expect(
      toolbarOverflowStartIndex({
        availableWidth: 110,
        gap: 2,
        itemWidths: [32, 32, 32],
      }),
    ).toBeNull();
  });

  test("keeps a single row and reserves room for the overflow control", () => {
    expect(
      toolbarOverflowStartIndex({
        availableWidth: 110,
        gap: 2,
        itemWidths: [32, 32, 32],
      }),
    ).toBeNull();
    expect(
      toolbarOverflowStartIndex({
        availableWidth: 99,
        gap: 2,
        itemWidths: [32, 32, 32],
      }),
    ).toBe(1);
  });
});

describe("admin Markdown WYSIWYG contract", () => {
  test("round-trips a toggle as structured editor content", () => {
    const markdown = [
      "<details>",
      "<summary>Extra details</summary>",
      "",
      "Hidden **formatted** content.",
      "",
      "</details>",
    ].join("\n");
    const content = markdownToJSON(markdown);

    expect(content.content?.[0]?.type).toBe("collapsible");
    expect(jsonToMarkdown(content)).toBe(markdown);
  });

  test("keeps expand in the toolbar and never renders edit or preview modes", async () => {
    const source = await Bun.file(
      new URL("./AdminMarkdownEditor.tsx", import.meta.url),
    ).text();

    expect(source).toContain("toolbarEnd={");
    expect(source).toContain('aria-label={expanded ? "Use compact editor"');
    expect(source).not.toContain('"edit" | "preview"');
    expect(source).not.toContain("admin-markdown-editor-view-controls");
    expect(source).not.toContain("MarkdownRenderer");
  });
});
