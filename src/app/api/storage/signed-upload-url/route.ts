import { verifyAuth } from "@/lib/auth/utils";
import { adminErrorResponse } from "@/lib/admin-input";
import { parseCmsUpload } from "@/lib/upload-policy";
import {
  authenticatedExocorpseFetch,
  externalProjectPath,
} from "@/lib/tuturuuu-cms-repository";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await verifyAuth();
    const input = parseCmsUpload(await request.json().catch(() => null));
    const response = await authenticatedExocorpseFetch(
      externalProjectPath("/assets/upload-url"),
      {
        body: JSON.stringify(input),
        cache: "no-store",
        method: "POST",
      },
    );
    const payload = await response.json().catch(() => null);
    return NextResponse.json(payload, {
      status: response.status,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
