import { expect, test } from "bun:test";
import { addonServiceIds, planAddonServiceLinks } from "./admin-addon-links";
import type {
  ExocorpseCmsEntry,
  ExocorpseCmsStudio,
} from "@/types/exocorpse-cms";

const entry = (id: string, collection_id: string): ExocorpseCmsEntry => ({
  id,
  collection_id,
  created_at: "2026-01-01T00:00:00Z",
  metadata: {},
  profile_data: {},
  published_at: null,
  scheduled_for: null,
  slug: id,
  sort_order: 0,
  stable_source_id: null,
  status: "published",
  subtitle: null,
  summary: null,
  title: id,
  updated_at: "2026-01-01T00:00:00Z",
});
function studio(exclusive = false): ExocorpseCmsStudio {
  return {
    assets: [],
    blocks: [],
    collections: [
      {
        id: "addons",
        slug: "commission-addons",
        title: "Add-ons",
        collection_type: "content",
      },
      {
        id: "services",
        slug: "commission-services",
        title: "Services",
        collection_type: "content",
      },
    ],
    entries: [
      { ...entry("addon", "addons"), profile_data: { isExclusive: exclusive } },
      entry("service-a", "services"),
      entry("service-b", "services"),
    ],
    relationDefinitions: [
      {
        id: "addons-def",
        key: "addons",
        label: "Add-ons",
        source_collection_id: "services",
        cardinality: "many",
        is_required: false,
      },
    ],
    relations: [
      {
        id: "link",
        from_entry_id: "service-a",
        to_entry_id: "addon",
        relation_definition_id: "addons-def",
        relation_type: "addons",
        sort_order: 3,
        metadata: { note: "Preserve me" },
      },
      {
        id: "other-link",
        from_entry_id: "service-b",
        to_entry_id: "other-addon",
        relation_definition_id: "addons-def",
        relation_type: "addons",
        sort_order: 7,
        metadata: { price: 12 },
      },
    ],
  };
}
test("add-on service links preserve other add-ons and their metadata", () => {
  const data = studio();
  const changes = planAddonServiceLinks(data, "addon", ["service-b"]);
  expect(changes.map((change) => change.entry.id)).toEqual([
    "service-a",
    "service-b",
  ]);
  expect(changes[0]?.relations).toEqual([]);
  expect(changes[1]?.relations).toEqual([
    {
      definitionId: "addons-def",
      metadata: { price: 12 },
      sortOrder: 7,
      toEntryId: "other-addon",
    },
    {
      definitionId: "addons-def",
      metadata: {},
      sortOrder: 8,
      toEntryId: "addon",
    },
  ]);
  expect(addonServiceIds(data, "addon")).toEqual(["service-a"]);
});
test("unchanged selections are idempotent and do not rewrite services", () => {
  expect(
    planAddonServiceLinks(studio(), "addon", ["service-a", "service-a"]),
  ).toEqual([]);
});
test("exclusive add-ons reject multiple services and unknown targets", () => {
  expect(() =>
    planAddonServiceLinks(studio(true), "addon", ["service-a", "service-b"]),
  ).toThrow("only be linked to one service");
  expect(() =>
    planAddonServiceLinks(studio(), "addon", ["unknown-service"]),
  ).toThrow("no longer available");
});
