import { verifyAuth } from "@/lib/auth/utils";
import { getCofiSamplesFromDb } from "@/lib/cofi-data";
import { refreshCofiEmbeddings } from "@/lib/cofi-sync";
import { getSupabaseAdminServer } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();

    const configuredPassword = process.env.COFI_ADMIN_SYNC_PASSWORD;

    if (!configuredPassword) {
      return NextResponse.json(
        {
          success: false,
          error:
            "COFI_ADMIN_SYNC_PASSWORD is not configured in the environment.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { password?: string };

    if (!body.password || body.password !== configuredPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sync password.",
        },
        { status: 403 },
      );
    }

    const supabase = await getSupabaseAdminServer();
    const samples = await getCofiSamplesFromDb();

    if (samples.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No COFI samples were found in the database.",
        },
        { status: 400 },
      );
    }

    const result = await refreshCofiEmbeddings(supabase, samples);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error syncing COFI samples from admin:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to sync COFI data",
      },
      { status: 500 },
    );
  }
}
