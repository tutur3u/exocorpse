import {
  getExocorpseAdminLoginPath,
  resolveExocorpseAdminTargetKeyFromPath,
} from "@/lib/exocorpse-config";
import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "exocorpse_tuturuuu_admin_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL(
      getExocorpseAdminLoginPath(
        resolveExocorpseAdminTargetKeyFromPath(pathname + search),
      ),
      request.url,
    );
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

// The login route must stay reachable without a session: it issues the state
// cookie that the callback is bound to.
export const config = {
  matcher: ["/admin", "/admin/((?!tuturuuu/login(?:/|$)).*)"],
};
