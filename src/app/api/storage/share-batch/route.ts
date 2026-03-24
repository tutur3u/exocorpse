import { batchGetCachedSignedUrls } from "@/lib/actions/storage";
import { NextRequest, NextResponse } from "next/server";

type BatchShareRequest = {
  paths?: string[];
};

export async function POST(request: NextRequest) {
  try {
    const { paths = [] } = (await request.json()) as BatchShareRequest;

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        {
          error: "Paths array is required and must not be empty",
        },
        {
          status: 400,
        },
      );
    }

    if (paths.length > 100) {
      return NextResponse.json(
        {
          error: "Maximum 100 paths can be processed at once",
        },
        {
          status: 400,
        },
      );
    }

    const signedUrls = await batchGetCachedSignedUrls(paths);

    return NextResponse.json({
      data: paths.map((path) => ({
        path,
        signedUrl: signedUrls.get(path) ?? null,
        error: signedUrls.has(path) ? null : "FILE_NOT_FOUND",
      })),
    });
  } catch (error) {
    console.error("Error generating batch signed URLs:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate batch signed URLs",
      },
      {
        status: 500,
      },
    );
  }
}
