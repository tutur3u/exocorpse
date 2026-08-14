import { describe, expect, test } from "bun:test";
import { galleryCharacterDefinition } from "./gallery-character-tagging";
import { galleryCharacterTargetIds } from "@/lib/gallery-character-relations";

describe("gallery character tagging", () => {
  test("presents the legacy character relation as a friendly multi-select", () => {
    const definition = galleryCharacterDefinition(
      {
        relationDefinitions: [
          {
            cardinality: "one",
            id: "gallery-character",
            is_required: true,
            key: "character",
            label: "Character",
            source_collection_id: "gallery",
          },
        ],
      },
      "gallery",
    );

    expect(definition).toMatchObject({
      cardinality: "many",
      id: "gallery-character",
      label: "Tagged characters",
    });
  });

  test("returns every unique character tagged on an artwork", () => {
    expect(
      galleryCharacterTargetIds([
        { key: "character", targetEntryId: "fenrys" },
        { key: "gallery-character", targetEntryId: "morris" },
        { key: "character", targetEntryId: "fenrys" },
        { key: "story", targetEntryId: "exocorpse" },
      ]),
    ).toEqual(["fenrys", "morris"]);
  });
});
