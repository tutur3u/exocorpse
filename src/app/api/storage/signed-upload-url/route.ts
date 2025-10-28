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

/**
 * Generate a signed upload URL for direct client-side upload to storage
 * This completely bypasses Next.js for the actual file upload, avoiding payload size limits
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await verifyAuth();

    const body = await request.json();
    const { path } = body;

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    // Extract directory path and filename
    // path format: "characters/123/gallery/image.jpg"
    const lastSlashIndex = path.lastIndexOf("/");

    if (lastSlashIndex <= 0) {
      return NextResponse.json(
        { error: "Invalid path format. Expected directory/filename.ext" },
        { status: 400 },
      );
    }

    const directory = path.substring(0, lastSlashIndex);
    const filename = path.substring(lastSlashIndex + 1);

    if (!filename) {
      return NextResponse.json(
        { error: "Filename cannot be empty" },
        { status: 400 },
      );
    }


    const client = getTuturuuuClient();

    // Generate signed upload URL using tuturuuu SDK
    const result = await client.storage.createSignedUploadUrl({
      path: directory,
      filename: filename,
      upsert: true,
    });

    const relativePath = result.data.path.split("/").slice(1).join("/");

    return NextResponse.json({
      success: true,
      signedUrl: result.data.signedUrl,
      path: relativePath,
    });
  } catch (error) {
    console.error("Error generating signed upload URL:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate signed upload URL",
      },
      { status: 500 },
    );
  }
}
