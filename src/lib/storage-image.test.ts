import { describe, expect, test } from "bun:test";
import { isTuturuuuCmsAssetUrl } from "./storage-image";

describe("Tuturuuu CMS image delivery", () => {
  test("recognizes versioned public asset endpoints as image-optimizer safe", () => {
    expect(
      isTuturuuuCmsAssetUrl(
        "https://tuturuuu.com/api/v1/workspaces/ws/external-projects/assets/asset-id?v=20260719",
      ),
    ).toBe(true);
  });

  test("does not proxy arbitrary third-party media through Next Image", () => {
    expect(isTuturuuuCmsAssetUrl("https://example.com/image.png")).toBe(false);
  });
});
