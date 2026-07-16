import { verifyAuth } from "@/lib/auth/utils";
import { buildExocorpseMigrationSnapshot } from "@/lib/exocorpse-migration-safety";
import { NextResponse } from "next/server";

export async function GET() {
  await verifyAuth();

  const { manifest, preflight } = await buildExocorpseMigrationSnapshot();
  const exportedAt = new Date().toISOString();
  const body = JSON.stringify(
    {
      exportedAt,
      manifest,
      preflight,
    },
    null,
    2,
  );

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="exocorpse-tuturuuu-migration-${preflight.manifestDigest.slice(
        0,
        12,
      )}.json"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
