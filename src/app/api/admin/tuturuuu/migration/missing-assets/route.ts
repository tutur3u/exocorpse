import { verifyAuth } from "@/lib/auth/utils";
import { buildExocorpseMigrationSnapshot } from "@/lib/exocorpse-migration-safety";
import { formatMissingPublicAssetsCsv } from "@/lib/exocorpse-migration-report";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function wantsCsv(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format")?.trim().toLowerCase();

  return (
    format === "csv" ||
    request.headers.get("accept")?.toLowerCase().includes("text/csv") === true
  );
}

export async function GET(request: Request) {
  await verifyAuth();

  const { preflight } = await buildExocorpseMigrationSnapshot();
  const missingAssets = preflight.publicAssets.missing;

  if (wantsCsv(request)) {
    return new NextResponse(formatMissingPublicAssetsCsv(missingAssets), {
      headers: {
        "Content-Disposition": `attachment; filename="exocorpse-missing-public-assets-${preflight.manifestDigest.slice(
          0,
          12,
        )}.csv"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
    });
  }

  return NextResponse.json({
    count: missingAssets.length,
    manifestDigest: preflight.manifestDigest,
    missingAssets,
    totals: preflight.totals,
  });
}
