"use server";

import { verifyAuth } from "@/lib/auth/utils";
import { getCmsBlacklistedUsers } from "@/lib/tuturuuu-cms-delivery";
import {
  createExocorpseCmsEntryBundle,
  deleteExocorpseCmsEntry,
  entryBlocksForBundle,
  entryRelationsForBundle,
  getExocorpseCmsCollectionEntries,
  updateExocorpseCmsEntryBundle,
} from "@/lib/tuturuuu-cms-repository";
import type { BlacklistedUser } from "@/types/exocorpse-cms";

export type { BlacklistedUser };

function clampPagination(page: number, pageSize: number) {
  return {
    page: Math.max(1, Math.floor(Number(page) || 1)),
    pageSize: Math.max(1, Math.min(100, Math.floor(Number(pageSize) || 10))),
  };
}

function paginate(users: BlacklistedUser[], page: number, pageSize: number) {
  const normalized = clampPagination(page, pageSize);
  const start = (normalized.page - 1) * normalized.pageSize;
  return {
    data: users.slice(start, start + normalized.pageSize),
    total: users.length,
    ...normalized,
  };
}

function slugifyUsername(username: string, suffix = "") {
  const slug = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return [slug || "blacklisted-user", suffix].filter(Boolean).join("-");
}

function mapAdminBlacklistEntry(entry: {
  id: string;
  profile_data: unknown;
  published_at: string | null;
  summary: string | null;
  title: string;
}) {
  const profile =
    entry.profile_data &&
    typeof entry.profile_data === "object" &&
    !Array.isArray(entry.profile_data)
      ? (entry.profile_data as Record<string, unknown>)
      : {};
  return {
    id: entry.id,
    reasoning:
      typeof profile.reasoning === "string" ? profile.reasoning : entry.summary,
    timestamp:
      typeof profile.timestamp === "string"
        ? profile.timestamp
        : (entry.published_at ?? new Date(0).toISOString()),
    username:
      typeof profile.username === "string" ? profile.username : entry.title,
  } satisfies BlacklistedUser;
}

async function getAdminBlacklistedUsers() {
  await verifyAuth();
  const { entries } = await getExocorpseCmsCollectionEntries(
    "commission-blacklist",
  );
  return entries
    .map(mapAdminBlacklistEntry)
    .sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export async function getBlacklistedUsersPaginated(
  page: number = 1,
  pageSize: number = 10,
) {
  const users = (await getCmsBlacklistedUsers()) ?? [];
  return paginate(users, page, pageSize);
}

export async function getAdminBlacklistedUsersPaginated(
  page: number = 1,
  pageSize: number = 10,
) {
  return paginate(await getAdminBlacklistedUsers(), page, pageSize);
}

export async function addBlacklistedUser(data: {
  username: string;
  reasoning: string;
}) {
  await verifyAuth();
  const username = data.username.trim();
  const reasoning = data.reasoning.trim();
  if (!username) throw new Error("Username is required.");
  if (!reasoning) throw new Error("Reasoning is required.");

  const { collection } = await getExocorpseCmsCollectionEntries(
    "commission-blacklist",
  );
  if (!collection)
    throw new Error("Commission blacklist collection is missing.");

  const timestamp = new Date().toISOString();
  const result = await createExocorpseCmsEntryBundle({
    blocks: [],
    entry: {
      collectionId: collection.id,
      metadata: { importedFrom: "exocorpse-admin" },
      profileData: { reasoning, timestamp, username },
      slug: slugifyUsername(username, Date.now().toString(36)),
      status: "published",
      summary: reasoning,
      title: username,
    },
    relations: [],
  });

  return mapAdminBlacklistEntry(result.entry);
}

export async function updateBlacklistedUser(
  id: string,
  updates: Partial<Pick<BlacklistedUser, "username" | "reasoning">>,
) {
  await verifyAuth();
  const { entries, studio } = await getExocorpseCmsCollectionEntries(
    "commission-blacklist",
  );
  const entry = entries.find((item) => item.id === id);
  if (!entry) throw new Error("Blacklist entry not found.");

  const current = mapAdminBlacklistEntry(entry);
  const username = updates.username?.trim() || current.username;
  const reasoning =
    typeof updates.reasoning === "string"
      ? updates.reasoning.trim()
      : (current.reasoning ?? "").trim();
  if (!reasoning) throw new Error("Reasoning is required.");
  const result = await updateExocorpseCmsEntryBundle(id, entry.updated_at, {
    blocks: entryBlocksForBundle(studio, id),
    entry: {
      profileData: { reasoning, timestamp: current.timestamp, username },
      slug: slugifyUsername(username, id.slice(0, 8)),
      summary: reasoning,
      title: username,
    },
    relations: entryRelationsForBundle(studio, id),
  });

  return mapAdminBlacklistEntry(result.entry);
}

export async function removeBlacklistedUser(id: string) {
  await verifyAuth();
  await deleteExocorpseCmsEntry(id);
  return { success: true };
}
