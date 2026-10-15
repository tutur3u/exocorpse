import { describe, expect, test } from "bun:test";
import { jsonToMarkdown, markdownToJSON } from "@tuturuuu/editor";
import { toolbarOverflowStartIndex } from "./admin-markdown-toolbar";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

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

  test("preview renders formatted content and sanitizes unsafe HTML", () => {
    const html = renderToStaticMarkup(
      createElement(MarkdownRenderer, {
        content:
          '**Saved prose** and [link](https://example.org).\n\n<script>alert(1)</script>\n\n<img src="https://example.org/image.png" onerror="alert(1)">',
      }),
    );
    expect(html).toMatch(/<strong\b[^>]*>Saved prose<\/strong>/);
    expect(html).toContain('href="https://example.org"');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
  });
});
