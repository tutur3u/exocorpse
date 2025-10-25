import { verifyAuth } from "@/lib/auth/utils";
import { type NextRequest, NextResponse } from "next/server";
import { TuturuuuClient } from "tuturuuu";

function getTuturuuuClient() {
  const apiKey = process.env.TUTURUUU_API_KEY;
  if (!apiKey) {
    throw new Error(
      "TUTURUUU_API_KEY is not set in environment variables. Please add it to your .env file.",
    );
  }
  return new TuturuuuClient(apiKey);
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await verifyAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    const client = getTuturuuuClient();

    // Upload the file with upsert to allow overwriting
    const result = await client.storage.upload(file, {
      path,
      upsert: true,
    });

    return NextResponse.json({
      success: true,
      path: result.data.path,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: 500 },
    );
  }
}
