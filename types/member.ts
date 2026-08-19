export type Zone =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "y";

export const ZONES: Zone[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "y"];

export function zoneDisplayName(zone: Zone): string {
  if (zone === "y") return "청년회";
  return `${zone}구역`;
}

export interface Member {
  id: number;
  zone: Zone;
  name: string;
  isMinor: boolean;
}
