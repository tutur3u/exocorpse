import { getCachedSignedUrl } from "@/lib/actions/storage";
import { NextRequest, NextResponse } from "next/server";

type ShareRequest = {
  path?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { path } = (await request.json()) as ShareRequest;

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        {
          error: "Path is required",
        },
        {
          status: 400,
        },
      );
    }

    const signedUrl = await getCachedSignedUrl(path);

    if (!signedUrl) {
      return NextResponse.json(
        {
          error: "FILE_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      path,
      signedUrl,
      error: null,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate signed URL",
      },
      {
        status: 500,
      },
    );
  }
}
