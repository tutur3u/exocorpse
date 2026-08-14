import "server-only";

import {
  authenticatedExocorpseFetch,
  externalProjectPath,
  readExocorpseApiError,
} from "@/lib/tuturuuu-cms-repository";
import type {
  AdminDriveAnalytics,
  AdminDriveListing,
  AdminDrivePayload,
  AdminTeamMember,
  AdminTeamPayload,
  AdminTeamRole,
} from "@/types/admin-integrations";

async function request<T>(path: string, init?: RequestInit) {
  const response = await authenticatedExocorpseFetch(path, init);
  if (!response.ok) {
    const error = new Error(await readExocorpseApiError(response)) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }
  return (await response.json()) as T;
}

function jsonInit(method: "DELETE" | "POST", body: unknown): RequestInit {
  return { body: JSON.stringify(body), method };
}

export async function getExocorpseTeam(): Promise<AdminTeamPayload> {
  const base = externalProjectPath("/members");
  const [context, members, roles] = await Promise.all([
    request<AdminTeamPayload["context"]>(base),
    request<AdminTeamMember[]>(`${base}/enhanced?status=all`),
    request<AdminTeamRole[]>(`${base}/roles`),
  ]);
  return { context, members, roles };
}

export function inviteExocorpseTeamMembers(emails: string[]) {
  return request<{ message: string; successCount: number }>(
    externalProjectPath("/members/invite"),
    jsonInit("POST", { emails }),
  );
}

export function removeExocorpseTeamMember(input: {
  email?: string;
  userId?: string;
}) {
  const query = new URLSearchParams();
  if (input.email) query.set("email", input.email);
  if (input.userId) query.set("id", input.userId);
  return request<{ message: string }>(
    `${externalProjectPath("/members/access")}?${query}`,
    { method: "DELETE" },
  );
}

export function addExocorpseTeamRoleMember(roleId: string, userId: string) {
  return request<{ message: string }>(
    externalProjectPath(`/members/roles/${encodeURIComponent(roleId)}/members`),
    jsonInit("POST", { memberIds: [userId] }),
  );
}

export function removeExocorpseTeamRoleMember(roleId: string, userId: string) {
  return request<{ message: string }>(
    externalProjectPath(
      `/members/roles/${encodeURIComponent(roleId)}/members/${encodeURIComponent(userId)}`,
    ),
    { method: "DELETE" },
  );
}

export async function getExocorpseDrive(
  searchParams = new URLSearchParams(),
): Promise<AdminDrivePayload> {
  const query = searchParams.toString();
  const [listing, analytics] = await Promise.all([
    request<{ data: AdminDriveListing }>(
      `${externalProjectPath("/storage")}${query ? `?${query}` : ""}`,
    ),
    request<{ data: AdminDriveAnalytics }>(
      externalProjectPath("/storage-analytics"),
    ),
  ]);
  return { analytics: analytics.data, listing: listing.data };
}

export function getExocorpseDriveListing(searchParams: URLSearchParams) {
  const query = searchParams.toString();
  return request<{ data: AdminDriveListing }>(
    `${externalProjectPath("/storage")}${query ? `?${query}` : ""}`,
  );
}

export async function getExocorpseDriveAnalytics() {
  return request<{ data: AdminDriveAnalytics }>(
    externalProjectPath("/storage-analytics"),
  );
}

export function getExocorpseDriveReadUrl(filePath: string) {
  const query = new URLSearchParams({ filePath });
  return request<{ data: { expiresIn: number; signedUrl: string } }>(
    `${externalProjectPath("/storage")}?${query}`,
  );
}

export function createExocorpseDriveFolder(path: string, name: string) {
  return request<{ data: { name: string; path: string } }>(
    externalProjectPath("/storage"),
    jsonInit("POST", { name, path }),
  );
}

export function renameExocorpseDriveEntry(input: {
  kind: "file" | "folder";
  newName: string;
  path: string;
}) {
  return request<{ data: { path: string; updatedAssets: number } }>(
    externalProjectPath("/storage"),
    { body: JSON.stringify(input), method: "PATCH" },
  );
}

export function deleteExocorpseDriveEntry(input: {
  kind: "file" | "folder";
  path: string;
}) {
  return request<{ data: { detachedAssets: number; success: boolean } }>(
    externalProjectPath("/storage"),
    jsonInit("DELETE", input),
  );
}

export async function createExocorpseDriveUpload(input: {
  contentType: string;
  directory: string;
  filename: string;
  size: number;
}) {
  const relativeDirectory = input.directory.replace(/^drive\/?/u, "") || "root";
  return request<{
    contentType?: string;
    headers?: Record<string, string>;
    path: string;
    provider: "r2" | "supabase";
    signedUrl: string;
    token?: string;
  }>(
    externalProjectPath("/assets/upload-url"),
    jsonInit("POST", {
      collectionType: "drive",
      contentType: input.contentType,
      entrySlug: relativeDirectory,
      filename: input.filename,
      size: input.size,
      upsert: false,
    }),
  );
}
