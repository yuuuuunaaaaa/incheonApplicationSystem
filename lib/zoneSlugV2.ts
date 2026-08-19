import type { Zone } from "@/types/member";
import { ZONES } from "@/types/member";

export type ZoneSlug = Zone;

export const ZONE_SLUGS: ZoneSlug[] = [...ZONES];

export function zoneToSlug(zone: Zone): ZoneSlug {
  return zone;
}

export function slugToZone(slug: string): Zone | null {
  if (ZONES.includes(slug as Zone)) return slug as Zone;
  return null;
}

export function getAllZoneSlugs(): ZoneSlug[] {
  return [...ZONES];
}
