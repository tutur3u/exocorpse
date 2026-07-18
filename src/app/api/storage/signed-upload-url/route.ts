import {
  getExocorpseApiBaseUrl,
  getExocorpseWorkspaceId,
} from "@/lib/exocorpse-config";
import { getExocorpseSessionFromCookies } from "@/lib/exocorpse-session";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getExocorpseSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    path?: unknown;
  } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  const segments = path.split("/").filter(Boolean);
  const filename = segments.at(-1);
  if (!filename || segments.length < 3) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const response = await fetch(
    `${getExocorpseApiBaseUrl().replace(/\/+$/, "")}/workspaces/${encodeURIComponent(
      getExocorpseWorkspaceId(),
    )}/external-projects/assets/upload-url`,
    {
      body: JSON.stringify({
        collectionType: segments[0],
        entrySlug: segments[1],
        filename,
        upsert: true,
      }),
      cache: "no-store",
      headers: {
        Authorization: `${session.tokenType} ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.status });
}
