import { verifyAuth } from "@/lib/auth/utils";
import { buildExocorpseMigrationSnapshot } from "@/lib/exocorpse-migration-safety";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await verifyAuth();

  const { preflight } = await buildExocorpseMigrationSnapshot();

  return NextResponse.json({ preflight });
}
