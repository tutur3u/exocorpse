import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "exocorpse_tuturuuu_admin_session";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!request.cookies.has(SESSION_COOKIE)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
