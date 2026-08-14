import { verifyAvatarUploadProof } from "@/lib/auth/avatar-upload-proof";
import {
  getExocorpseSessionFromCookies,
  setExocorpseSessionCookie,
  updateExocorpseSessionIdentity,
} from "@/lib/exocorpse-session";
import { authenticatedExocorpseFetch } from "@/lib/tuturuuu-cms-repository";
import { NextResponse } from "next/server";

const MAX_DISPLAY_NAME_LENGTH = 100;

async function readPayload(response: Response) {
  return response.json().catch(() => null) as Promise<unknown>;
}

export async function GET() {
  const session = await getExocorpseSessionFromCookies();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const upstream = await authenticatedExocorpseFetch("/users/me/profile");
  const body = await readPayload(upstream);
  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store" },
    status: upstream.status,
  });
}

export async function PATCH(request: Request) {
  const session = await getExocorpseSessionFromCookies();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    avatar_upload?: { public_url?: unknown; upload_proof?: unknown };
    avatar_url?: unknown;
    display_name?: unknown;
  } | null;
  const displayName =
    typeof body?.display_name === "string"
      ? body.display_name.trim()
      : undefined;
  if (
    (displayName !== undefined &&
      (!displayName || displayName.length > MAX_DISPLAY_NAME_LENGTH)) ||
    (body?.avatar_url !== undefined && body.avatar_url !== null) ||
    (body?.avatar_upload && body.avatar_url !== undefined)
  ) {
    return NextResponse.json(
      { error: "Invalid profile details." },
      { status: 400 },
    );
  }
  const publicUrl =
    typeof body?.avatar_upload?.public_url === "string"
      ? body.avatar_upload.public_url
      : undefined;
  const uploadProof =
    typeof body?.avatar_upload?.upload_proof === "string"
      ? body.avatar_upload.upload_proof
      : undefined;
  if (
    body?.avatar_upload &&
    (!publicUrl ||
      !uploadProof ||
      !verifyAvatarUploadProof({
        proof: uploadProof,
        publicUrl,
        userId: session.user.id,
      }))
  ) {
    return NextResponse.json(
      { error: "Invalid avatar upload." },
      { status: 400 },
    );
  }
  const patch = {
    ...(publicUrl ? { avatar_url: publicUrl } : {}),
    ...(body?.avatar_url === null ? { avatar_url: null } : {}),
    ...(displayName !== undefined ? { display_name: displayName } : {}),
  };
  if (!Object.keys(patch).length) {
    return NextResponse.json(
      { error: "No profile changes provided." },
      { status: 400 },
    );
  }
  const upstream = await authenticatedExocorpseFetch("/users/me/profile", {
    body: JSON.stringify(patch),
    method: "PATCH",
  });
  const payload = (await readPayload(upstream)) as {
    avatar_url?: string | null;
    display_name?: string | null;
    error?: string;
  } | null;
  if (!upstream.ok) {
    return NextResponse.json(payload ?? { error: "Profile update failed." }, {
      status: upstream.status,
    });
  }
  const updated = updateExocorpseSessionIdentity(session, {
    avatarUrl:
      payload?.avatar_url ??
      ("avatar_url" in patch ? patch.avatar_url : undefined),
    displayName: payload?.display_name ?? displayName,
  });
  const response = NextResponse.json({ profile: updated.user });
  response.headers.set("Cache-Control", "no-store");
  setExocorpseSessionCookie(response, updated);
  return response;
}
