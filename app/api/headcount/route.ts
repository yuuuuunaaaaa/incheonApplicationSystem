import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getHeadcountsV2, getHeadcountsByZone, setHeadcountsV2, type HeadcountDate, type HeadcountRow } from "@/services/headcountService";
import { ZONES, type Zone } from "@/types/member";

const V2_DATE_SET: Set<string> = new Set([
  "2026-09-01",
  "2026-09-02",
  "2026-09-03",
  "2026-09-04",
  "2026-09-05",
]);

function isHeadcountDate(value: unknown): value is HeadcountDate {
  return typeof value === "string" && V2_DATE_SET.has(value);
}

function isValidRow(row: unknown): row is HeadcountRow {
  if (!row || typeof row !== "object") return false;
  const r = row as { zone?: unknown; date?: unknown; count?: unknown };

  if (typeof r.zone !== "string" || !ZONES.includes(r.zone as Zone)) return false;
  if (!isHeadcountDate(r.date)) return false;
  if (typeof r.count !== "number" && typeof r.count !== "string") return false;
  if (!Number.isFinite(Number(r.count))) return false;

  return true;
}

export async function GET(request: NextRequest) {
  try {
    const zoneParam = request.nextUrl.searchParams.get("zone") as Zone | null;
    if (zoneParam && ZONES.includes(zoneParam)) {
      const data = await getHeadcountsByZone(zoneParam);
      return NextResponse.json({ data });
    }
    const data = await getHeadcountsV2();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/headcount]", error);
    return NextResponse.json({ error: "Failed to fetch headcounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { rows } = body as { rows?: unknown };
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "rows must be an array" }, { status: 400 });
    }

    const normalized: HeadcountRow[] = [];
    for (const row of rows) {
      if (!isValidRow(row)) continue;
      const count = Math.max(0, Math.floor(Number(row.count)));
      normalized.push({ zone: row.zone, date: row.date, count });
    }

    await setHeadcountsV2(normalized);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[POST /api/headcount]", error);
    return NextResponse.json({ error: "Failed to save headcounts" }, { status: 500 });
  }
}

