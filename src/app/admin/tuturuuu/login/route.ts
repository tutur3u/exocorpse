import {
  buildExocorpseCentralizedLoginUrl,
  resolveExocorpseAdminTargetKey,
} from "@/lib/exocorpse-config";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const targetKey = resolveExocorpseAdminTargetKey(
    request.nextUrl.searchParams.get("next"),
  );
  const nextUrl =
    targetKey === "dashboard" ? "/admin" : `/admin?target=${targetKey}`;

  return NextResponse.redirect(
    buildExocorpseCentralizedLoginUrl({
      appBaseUrl: request.nextUrl.origin,
      nextUrl,
    }),
  );
}
