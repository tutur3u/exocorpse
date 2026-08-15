import { describe, expect, test } from "bun:test";
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
