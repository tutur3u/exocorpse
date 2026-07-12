import { describe, expect, mock, spyOn, test } from "bun:test";
import {
  runDualWriteSafely,
  type DualWriteResult,
} from "./tuturuuu-dual-write-result";

describe("Exocorpse CMS dual-write failure handling", () => {
  test("returns successful synchronization results unchanged", async () => {
    const result: DualWriteResult = {
      applied: true,
      manifestDigest: "digest",
      reason: "character-outfit:update",
    };
    const operation = mock(async () => result);

    await expect(
      runDualWriteSafely("character-outfit:update", operation),
    ).resolves.toEqual(result);
  });

  test("does not report a committed local mutation as failed when CMS sync is blocked", async () => {
    const error = new Error(
      "Exocorpse CMS dual-write preflight failed (missing_public_assets).",
    );
    const operation = mock(async () => {
      throw error;
    });
    const consoleError = spyOn(console, "error").mockImplementation(() => {});

    await expect(
      runDualWriteSafely("character-outfit:update", operation),
    ).resolves.toEqual({
      applied: false,
      reason: "character-outfit:update",
      skipped:
        "Exocorpse CMS dual-write preflight failed (missing_public_assets).",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Exocorpse CMS dual-write failed after local mutation",
      {
        error,
        reason: "character-outfit:update",
      },
    );

    consoleError.mockRestore();
  });
});
