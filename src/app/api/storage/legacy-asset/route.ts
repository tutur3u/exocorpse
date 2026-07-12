import { getCachedSignedUrl } from "@/lib/actions/storage";
import { NextResponse } from "next/server";

function isValidLegacyStoragePath(path: string) {
  return (
    path.length <= 1024 &&
    !path.startsWith("/") &&
    !path.includes("..") &&
    !/^https?:\/\//i.test(path)
  );
}

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path")?.trim() ?? "";
  if (!isValidLegacyStoragePath(path)) {
    return NextResponse.json(
      { error: "Invalid storage path" },
      { status: 400 },
    );
  }

  const signedUrl = await getCachedSignedUrl(path);
  if (!signedUrl) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.redirect(signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
    status: 307,
  });
}
