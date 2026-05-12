import { clearExocorpseSessionCookie } from "@/lib/exocorpse-session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  clearExocorpseSessionCookie(response);
  return response;
}
