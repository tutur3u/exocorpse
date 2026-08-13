import {
  characterCrop,
  characterCropStyle,
  isReferenceSheet,
  isSensitiveMedia,
} from "@/lib/character-media";
import { describe, expect, it } from "bun:test";

describe("character media presentation", () => {
  it("uses centered, uncropped defaults", () => {
    expect(characterCrop({}, "profile")).toEqual({ x: 50, y: 50, zoom: 1 });
    expect(characterCropStyle({}, "banner")).toEqual({
      objectPosition: "50% 50%",
      transform: "scale(1)",
    });
  });

  it("maps persisted crop controls and media flags", () => {
    const profile = {
      profileImagePositionX: 22,
      profileImagePositionY: 64,
      profileImageZoom: 1.35,
      sensitiveContent: true,
      referenceSheet: true,
    };
    expect(characterCrop(profile, "profile")).toEqual({
      x: 22,
      y: 64,
      zoom: 1.35,
    });
    expect(isSensitiveMedia(profile)).toBe(true);
    expect(isReferenceSheet(profile)).toBe(true);
  });

  it("does not enable flags from truthy strings", () => {
    expect(isSensitiveMedia({ sensitiveContent: "true" })).toBe(false);
    expect(isReferenceSheet({ referenceSheet: "true" })).toBe(false);
  });
});
