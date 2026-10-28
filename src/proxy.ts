import {
  getExocorpseAdminLoginPath,
  resolveExocorpseAdminTargetKeyFromPath,
} from "@/lib/exocorpse-config";
import { type NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { enforcingContentSecurityPolicy } from "@/lib/enforcing-csp";

const SESSION_COOKIE = "exocorpse_tuturuuu_admin_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const nonce = randomBytes(16).toString("base64");
  const policy = enforcingContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLogin =
    pathname === "/admin/tuturuuu/login" ||
    pathname.startsWith("/admin/tuturuuu/login/");
  let response: NextResponse;
  if (isAdmin && !isLogin && !request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL(
      getExocorpseAdminLoginPath(
        resolveExocorpseAdminTargetKeyFromPath(pathname + search),
      ),
      request.url,
    );
    response = NextResponse.redirect(loginUrl);
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }
  response.headers.set("Content-Security-Policy", policy);
  // Never share a document containing a per-response nonce through a CDN.
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("CDN-Cache-Control", "private, no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/static(?:/|$)|_next/image(?:/|$)|workers(?:/|$)|audio(?:/|$)|boot(?:/|$)|cursor(?:/|$)|icons(?:/|$)|media(?:/|$)|artfight-profile/|favicon\\.ico$|[^/]+\\.(?:webp|png|jpg|jpeg|gif|svg|ico)$).*)",
  ],
};
