import { describe, expect, test } from "bun:test";
import { markdownHeadingId, markdownOutline } from "./markdown-outline";

describe("markdownOutline", () => {
  test("builds stable unique anchors and ignores fenced headings", () => {
    expect(
      markdownOutline(
        "# Introduction\n## Details\n```md\n# Not a heading\n```\n## Details",
      ),
    ).toEqual([
      { depth: 1, id: "introduction", label: "Introduction" },
      { depth: 2, id: "details", label: "Details" },
      { depth: 2, id: "details-2", label: "Details" },
    ]);
  });

  test("normalizes formatted headings", () => {
    expect(markdownHeadingId("**Meet the Cast!**")).toBe("meet-the-cast");
  });
});
