import { describe, expect, test } from "bun:test";
import { aboutContentItemSummary } from "./about-content-item-copy";

describe("About content item summaries", () => {
  test("never exposes internal section names", () => {
    expect(
      aboutContentItemSummary({
        body: "No harassment or hateful behavior.",
        section: "dni_soft",
        subtitle: "",
        title: "dni_soft",
      }),
    ).toBe("No harassment or hateful behavior.");
  });

  test("uses a readable fallback for empty items", () => {
    expect(
      aboutContentItemSummary({
        body: "",
        section: "experience",
        subtitle: "",
        title: "experience",
      }),
    ).toBe("Untitled experience");
  });

  test("removes markdown syntax from collapsed summaries", () => {
    expect(
      aboutContentItemSummary({
        body: "**Featured artist** for [several zines](https://example.com).",
        section: "experience",
        subtitle: "",
        title: "experience",
      }),
    ).toBe("Featured artist for several zines.");
  });
});
