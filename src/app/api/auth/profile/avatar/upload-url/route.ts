import { createAvatarUploadProof } from "@/lib/auth/avatar-upload-proof";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { authenticatedExocorpseFetch } from "@/lib/tuturuuu-cms-repository";
import { NextResponse } from "next/server";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const session = await getExocorpseSessionFromCookies();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    contentType?: unknown;
    filename?: unknown;
    size?: unknown;
  } | null;
  const filename =
    typeof body?.filename === "string" ? body.filename.trim() : "";
  const contentType =
    typeof body?.contentType === "string" ? body.contentType : "";
  const size = typeof body?.size === "number" ? body.size : 0;
  if (
    !filename ||
    filename.length > 160 ||
    filename.includes("/") ||
    filename.includes("\\") ||
    !ALLOWED_TYPES.has(contentType) ||
    !Number.isInteger(size) ||
    size <= 0 ||
    size > MAX_AVATAR_SIZE
  ) {
    return NextResponse.json(
      { error: "Choose a PNG, JPEG, GIF, or WebP image up to 5 MB." },
      { status: 400 },
    );
  }
  const upstream = await authenticatedExocorpseFetch(
    "/users/me/avatar/upload-url",
    { body: JSON.stringify({ filename }), method: "POST" },
  );
  const payload = (await upstream.json().catch(() => null)) as {
    error?: string;
    filePath?: string;
    publicUrl?: string;
    uploadUrl?: string;
  } | null;
  if (
    !upstream.ok ||
    !payload?.filePath ||
    !payload.publicUrl ||
    !payload.uploadUrl
  ) {
    return NextResponse.json(
      payload ?? { error: "Avatar upload could not start." },
      {
        status: upstream.ok ? 502 : upstream.status,
      },
    );
  }
  return NextResponse.json({
    ...payload,
    uploadProof: createAvatarUploadProof({
      filePath: payload.filePath,
      publicUrl: payload.publicUrl,
      userId: session.user.id,
    }),
  });
}
