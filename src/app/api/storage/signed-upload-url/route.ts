import {
  authenticatedExocorpseFetch,
  externalProjectPath,
} from "@/lib/tuturuuu-cms-repository";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    contentType?: unknown;
    path?: unknown;
    size?: unknown;
    upsert?: unknown;
  } | null;
  const path = typeof body?.path === "string" ? body.path : "";
  const segments = path.split("/").filter(Boolean);
  const filename = segments.at(-1);
  if (!filename || segments.length < 3) {
    return NextResponse.json({ error: "Invalid upload path" }, { status: 400 });
  }

  const response = await authenticatedExocorpseFetch(
    externalProjectPath("/assets/upload-url"),
    {
      body: JSON.stringify({
        collectionType: segments[0],
        contentType:
          typeof body?.contentType === "string" ? body.contentType : undefined,
        entrySlug: segments[1],
        filename,
        size: typeof body?.size === "number" ? body.size : undefined,
        upsert: typeof body?.upsert === "boolean" ? body.upsert : true,
      }),
      cache: "no-store",
      method: "POST",
    },
  );

  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload, { status: response.status });
}
