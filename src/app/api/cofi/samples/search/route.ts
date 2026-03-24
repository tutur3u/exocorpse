import { searchCofiSamplesHybrid } from "@/lib/cofi-search";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() ?? "";
    const boothType = searchParams.get("boothType");
    const joiningDate = searchParams.get("joiningDate");
    const limit = Number(searchParams.get("limit") ?? "120");

    if (!query) {
      return NextResponse.json({
        success: true,
        mode: "none",
        samples: [],
      });
    }

    const result = await searchCofiSamplesHybrid({
      query,
      limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 600) : 120,
      boothType: boothType && boothType !== "ALL" ? boothType : null,
      joiningDate: joiningDate && joiningDate !== "ALL" ? joiningDate : null,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error searching COFI samples:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to search samples",
      },
      { status: 500 },
    );
  }
}
