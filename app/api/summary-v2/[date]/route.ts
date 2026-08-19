import { NextRequest, NextResponse } from "next/server";
import {
  HEADCOUNT_DATES,
  getHeadcountZoneSummaryForDate,
  type HeadcountDate,
} from "@/services/headcountService";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;

  if (!HEADCOUNT_DATES.includes(date as HeadcountDate)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  try {
    const summary = await getHeadcountZoneSummaryForDate(date as HeadcountDate);
    return NextResponse.json({ date, summary });
  } catch (error) {
    console.error("[GET /api/summary-v2/[date]]", error);
    return NextResponse.json(
      { error: "Failed to fetch date summary" },
      { status: 500 }
    );
  }
}
