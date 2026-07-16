import { clearExocorpseSessionCookie } from "@/lib/exocorpse-session";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  clearExocorpseSessionCookie(response);
  return response;
}
