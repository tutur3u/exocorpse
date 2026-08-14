import {
  addExocorpseTeamRoleMember,
  getExocorpseTeam,
  inviteExocorpseTeamMembers,
  removeExocorpseTeamMember,
  removeExocorpseTeamRoleMember,
} from "@/lib/tuturuuu-admin-integrations";

function errorResponse(error: unknown) {
  const status =
    error instanceof Error &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 500;
  return Response.json(
    { error: error instanceof Error ? error.message : "Team request failed" },
    { status },
  );
}

export async function GET() {
  try {
    return Response.json(await getExocorpseTeam(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.action === "invite" && Array.isArray(body.emails)) {
      const emails = body.emails.filter(
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
      body.action === "add-role" &&
      typeof body.roleId === "string" &&
      typeof body.userId === "string"
    ) {
      return Response.json(
        await addExocorpseTeamRoleMember(body.roleId, body.userId),
      );
    }
    return Response.json({ error: "Invalid team action." }, { status: 400 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (
      body.action === "remove-role" &&
      typeof body.roleId === "string" &&
      typeof body.userId === "string"
    ) {
      return Response.json(
        await removeExocorpseTeamRoleMember(body.roleId, body.userId),
      );
    }
    if (body.action === "remove-member") {
      const email = typeof body.email === "string" ? body.email : undefined;
      const userId = typeof body.userId === "string" ? body.userId : undefined;
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
    return errorResponse(error);
  }
}
