import { beforeEach, describe, expect, it, mock } from "bun:test";

const calls: unknown[][] = [];
let teamError: (Error & { status?: number }) | undefined;

mock.module("@/lib/tuturuuu-admin-integrations", () => ({
  addExocorpseTeamRoleMember: async (...args: unknown[]) => {
    calls.push(["add-role", ...args]);
    return { message: "success" };
  },
  createExocorpseDriveFolder: async (...args: unknown[]) => {
    calls.push(["folder", ...args]);
    return { data: { path: "art" } };
  },
  createExocorpseDriveUpload: async (...args: unknown[]) => {
    calls.push(["upload", ...args]);
    return { path: "drive/root/file.png", signedUrl: "https://example.com" };
  },
  deleteExocorpseDriveEntry: async () => ({ data: { success: true } }),
  getExocorpseDriveListing: async () => ({ data: { items: [] } }),
  getExocorpseDriveAnalytics: async () => ({ data: { fileCount: 0 } }),
  getExocorpseDriveReadUrl: async () => ({
    data: { signedUrl: "https://example.com" },
  }),
  getExocorpseTeam: async () => {
    if (teamError) throw teamError;
    return { context: {}, members: [], roles: [] };
  },
  inviteExocorpseTeamMembers: async (...args: unknown[]) => {
    calls.push(["invite", ...args]);
    return { message: "success", successCount: 1 };
  },
  removeExocorpseTeamMember: async (...args: unknown[]) => {
    calls.push(["remove-member", ...args]);
    return { message: "success" };
  },
  removeExocorpseTeamRoleMember: async (...args: unknown[]) => {
    calls.push(["remove-role", ...args]);
    return { message: "success" };
  },
  renameExocorpseDriveEntry: async () => ({ data: { path: "renamed" } }),
}));

describe("admin team route", () => {
  beforeEach(() => {
    calls.splice(0);
    teamError = undefined;
  });

  it("preserves authentication failures from the shared session boundary", async () => {
    teamError = Object.assign(new Error("Sign in required."), { status: 401 });
    const { GET } = await import("../team/route");
    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Sign in required." });
  });

  it("forwards invitations through the authenticated Tuturuuu boundary", async () => {
    const { POST } = await import("../team/route");
    const response = await POST(
      new Request("http://localhost/api/admin/team", {
        body: JSON.stringify({ action: "invite", emails: ["a@example.com"] }),
        method: "POST",
      }),
    );
    expect(response.status).toBe(200);
    expect(calls).toEqual([["invite", ["a@example.com"]]]);
  });

  it("rejects malformed role mutations before calling Tuturuuu", async () => {
    const { POST } = await import("../team/route");
    const response = await POST(
      new Request("http://localhost/api/admin/team", {
        body: JSON.stringify({ action: "add-role", roleId: "role-1" }),
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });
});

describe("admin Drive route", () => {
  beforeEach(() => calls.splice(0));

  it("prepares direct uploads from metadata without accepting file bytes", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/drive", {
        body: JSON.stringify({
          action: "upload-url",
          contentType: "image/png",
          directory: "drive/root",
          filename: "cover.png",
          size: 123,
        }),
        method: "POST",
      }),
    );
    expect(response.status).toBe(200);
    expect(calls).toEqual([
      [
        "upload",
        {
          contentType: "image/png",
          directory: "drive/root",
          filename: "cover.png",
          size: 123,
        },
      ],
    ]);
  });

  it("rejects upload requests without measured metadata", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/drive", {
        body: JSON.stringify({ action: "upload-url", filename: "cover.png" }),
        method: "POST",
      }),
    );
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });
});
