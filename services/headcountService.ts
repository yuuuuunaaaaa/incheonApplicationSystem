import { readSheet, clearAndWriteRows, updateRows } from "@/lib/googleSheets";
import type { Zone } from "@/types/member";
import { ZONES } from "@/types/member";

export type HeadcountDate =
  | "2026-09-01"
  | "2026-09-02"
  | "2026-09-03"
  | "2026-09-04"
  | "2026-09-05";

export interface HeadcountRow {
  zone: Zone;
  date: HeadcountDate;
  count: number;
}

const SHEET = "headcounts";
const RANGE = `${SHEET}!A:D`;

export const HEADCOUNT_DATES: HeadcountDate[] = [
  "2026-09-01",
  "2026-09-02",
  "2026-09-03",
  "2026-09-04",
  "2026-09-05",
];

const V2_DATES = HEADCOUNT_DATES;
const COUNTS_RANGE = `${SHEET}!C1:C${ZONES.length * V2_DATES.length}`;

function parseCount(raw: string | undefined): number {
  const n = parseInt(raw ?? "0", 10);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

const CACHE_TTL_MS = 5000;
let cachedCounts: number[] | null = null;
let cacheTimestamp = 0;

async function getCountsColumn(): Promise<number[]> {
  const now = Date.now();
  if (cachedCounts && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedCounts;
  }

  const rows = await readSheet(COUNTS_RANGE);
  const total = ZONES.length * V2_DATES.length;
  const counts = new Array<number>(total).fill(0);

  for (let i = 0; i < Math.min(rows.length, total); i++) {
    counts[i] = parseCount(rows[i]?.[0]);
  }

  cachedCounts = counts;
  cacheTimestamp = now;
  return counts;
}

export function invalidateHeadcountCache() {
  cachedCounts = null;
  cacheTimestamp = 0;
}

export interface HeadcountDateSummary {
  date: HeadcountDate;
  count: number;
}

export interface HeadcountZoneSummary {
  zone: Zone;
  count: number;
}

function isV2Date(date: string): date is HeadcountDate {
  return V2_DATES.includes(date as HeadcountDate);
}

function serialize(rows: HeadcountRow[]): string[][] {
  return rows.map((r) => [
    r.zone,
    r.date,
    String(r.count),
    new Date().toISOString(),
  ]);
}

export async function getHeadcountsV2(): Promise<HeadcountRow[]> {
  const counts = await getCountsColumn();
  const dateCount = V2_DATES.length;
  return ZONES.flatMap((zone, zoneIndex) =>
    V2_DATES.map((date, dateIndex) => ({
      zone,
      date,
      count: counts[zoneIndex * dateCount + dateIndex] ?? 0,
    }))
  );
}

export async function getHeadcountDateSummary(): Promise<HeadcountDateSummary[]> {
  const counts = await getCountsColumn();
  const dateCount = V2_DATES.length;
  return V2_DATES.map((date, dateIndex) => {
    let total = 0;
    for (let zoneIndex = 0; zoneIndex < ZONES.length; zoneIndex++) {
      total += counts[zoneIndex * dateCount + dateIndex] ?? 0;
    }
    return { date, count: total };
  });
}

export async function getHeadcountZoneSummaryForDate(
  date: HeadcountDate
): Promise<HeadcountZoneSummary[]> {
  const counts = await getCountsColumn();
  const dateIndex = V2_DATES.indexOf(date);
  const dateCount = V2_DATES.length;
  if (dateIndex === -1) {
    return ZONES.map((zone) => ({ zone, count: 0 }));
  }

  return ZONES.map((zone, zoneIndex) => ({
    zone,
    count: counts[zoneIndex * dateCount + dateIndex] ?? 0,
  }));
}

export async function getHeadcountsByZone(zone: Zone): Promise<HeadcountRow[]> {
  const zoneIndex = ZONES.indexOf(zone);
  if (zoneIndex === -1) return [];
  const counts = await getCountsColumn();
  const dateCount = V2_DATES.length;
  const base = zoneIndex * dateCount;
  return V2_DATES.map((date, dateIndex) => ({
    zone,
    date,
    count: counts[base + dateIndex] ?? 0,
  }));
}

export async function setHeadcountsV2(rows: HeadcountRow[]): Promise<void> {
  if (rows.length === 0) return;

  const zone = rows[0].zone;
  const allSameZone = rows.every((r) => r.zone === zone);

  if (allSameZone && ZONES.includes(zone)) {
    const zoneIndex = ZONES.indexOf(zone);
    const startRow = zoneIndex * V2_DATES.length + 1;
    const zoneRows: string[][] = V2_DATES.map((date) => {
      const match = rows.find((r) => r.date === date);
      const count = match ? Math.max(0, Math.floor(match.count)) : 0;
      return [zone, date, String(count), new Date().toISOString()];
    });
    const range = `${SHEET}!A${startRow}:D${startRow + V2_DATES.length - 1}`;
    await updateRows(range, zoneRows);
    invalidateHeadcountCache();
    return;
  }

  // fallback: 전체 다시 쓰기 (여러 구역이 섞여 올 경우)
  const existing = await getHeadcountsV2();
  const byKey = new Map<string, HeadcountRow>(
    existing.map((r) => [`${r.zone}::${r.date}`, r])
  );
  for (const r of rows) {
    if (!ZONES.includes(r.zone)) continue;
    if (!isV2Date(r.date)) continue;
    byKey.set(`${r.zone}::${r.date}`, { ...r, count: Math.max(0, Math.floor(r.count)) });
  }
  const finalRows: HeadcountRow[] = [];
  for (const z of ZONES) {
    for (const date of V2_DATES) {
      const row = byKey.get(`${z}::${date}`);
      finalRows.push(row ?? { zone: z, date, count: 0 });
    }
  }
  await clearAndWriteRows(RANGE, serialize(finalRows));
  invalidateHeadcountCache();
}

