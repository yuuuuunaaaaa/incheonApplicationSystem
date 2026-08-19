import { NextResponse } from "next/server";
import { getHeadcountDateSummary } from "@/services/headcountService";

export async function GET() {
  try {
    const summary = await getHeadcountDateSummary();
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("[GET /api/summary-v2]", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}
