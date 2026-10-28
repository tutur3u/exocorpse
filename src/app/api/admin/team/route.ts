import { verifyAuth } from "@/lib/auth/utils";
import { adminErrorResponse } from "@/lib/admin-input";
import {
  addExocorpseTeamRoleMember,
  getExocorpseTeam,
  inviteExocorpseTeamMembers,
  removeExocorpseTeamMember,
  removeExocorpseTeamRoleMember,
} from "@/lib/tuturuuu-admin-integrations";

export async function GET() {
  try {
    await verifyAuth();
    return Response.json(await getExocorpseTeam(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid request." }, { status: 400 });
    const input = body as Record<string, unknown>;
    if (input.action === "invite" && Array.isArray(input.emails)) {
      const emails = input.emails.filter(
        (email): email is string => typeof email === "string",
      );
      if (!emails.length) {
        return Response.json(
          { error: "Enter at least one email." },
          { status: 400 },
        );
      }
      return Response.json(await inviteExocorpseTeamMembers(emails));
    }
    if (
      input.action === "add-role" &&
      typeof input.roleId === "string" &&
      typeof input.userId === "string"
    ) {
      return Response.json(
        await addExocorpseTeamRoleMember(input.roleId, input.userId),
      );
    }
    return Response.json({ error: "Invalid team action." }, { status: 400 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyAuth();
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object")
      return Response.json({ error: "Invalid request." }, { status: 400 });
    const input = body as Record<string, unknown>;
    if (
      input.action === "remove-role" &&
      typeof input.roleId === "string" &&
      typeof input.userId === "string"
    ) {
      return Response.json(
        await removeExocorpseTeamRoleMember(input.roleId, input.userId),
      );
    }
    if (input.action === "remove-member") {
      const email = typeof input.email === "string" ? input.email : undefined;
      const userId =
        typeof input.userId === "string" ? input.userId : undefined;
      if (!email && !userId) {
        return Response.json(
          { error: "Missing member identity." },
          { status: 400 },
        );
      }
      return Response.json(await removeExocorpseTeamMember({ email, userId }));
    }
    return Response.json({ error: "Invalid team action." }, { status: 400 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
