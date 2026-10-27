import {
  buildExocorpseCentralizedLoginUrl,
  getExocorpseAppBaseUrl,
  resolveExocorpseAdminTargetKey,
} from "@/lib/exocorpse-config";
import {
  createExocorpseLoginState,
  setExocorpseLoginStateCookie,
} from "@/lib/exocorpse-login-state";
import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const targetKey = resolveExocorpseAdminTargetKey(
    request.nextUrl.searchParams.get("next"),
  );
  const nextUrl =
    targetKey === "dashboard" ? "/admin" : `/admin?target=${targetKey}`;

  const state = createExocorpseLoginState();
  const response = NextResponse.redirect(
    buildExocorpseCentralizedLoginUrl({
      appBaseUrl: getExocorpseAppBaseUrl(request.nextUrl.origin),
      nextUrl,
      state,
    }),
  );

  setExocorpseLoginStateCookie(response, state);
  return response;
}
