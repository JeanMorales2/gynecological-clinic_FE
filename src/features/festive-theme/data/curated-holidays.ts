import type { IconName } from "@/components/ui/icon";

export type FestiveIconName = Extract<IconName, "cross" | "flag" | "flower" | "gift">;

export type CuratedHolidayEntry = {
  id: string;
  label: string;
  icon: FestiveIconName;
  accentColor: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

const fixedHolidays: CuratedHolidayEntry[] = [
  { id: "july-19", label: "Día de la Liberación", icon: "flag", accentColor: "#3B7288", startMonth: 7, startDay: 19, endMonth: 7, endDay: 19 },
  { id: "independence", label: "Independencia de Nicaragua", icon: "flag", accentColor: "#2F6F8C", startMonth: 9, startDay: 14, endMonth: 9, endDay: 15 },
  { id: "palo-de-mayo", label: "Palo de Mayo", icon: "flower", accentColor: "#5C7E62", startMonth: 5, startDay: 1, endMonth: 5, endDay: 31 },
  { id: "day-of-the-cross", label: "Día de la Cruz", icon: "cross", accentColor: "#6E5A82", startMonth: 5, startDay: 3, endMonth: 5, endDay: 3 },
  { id: "christmas", label: "Navidad y fin de año", icon: "gift", accentColor: "#54786A", startMonth: 12, startDay: 1, endMonth: 12, endDay: 31 },
];

/** Calculates Gregorian Easter using the Meeus/Jones/Butcher algorithm. */
export function computeEasterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return { month, day };
}

function getSemanaSanta(year: number): CuratedHolidayEntry {
  const easter = computeEasterSunday(year);
  const monday = new Date(year, easter.month - 1, easter.day);
  monday.setDate(monday.getDate() - 6);
  const saturday = new Date(monday);
  saturday.setDate(saturday.getDate() + 5);

  return {
    id: "semana-santa",
    label: "Semana Santa",
    icon: "cross",
    accentColor: "#6E5A82",
    startMonth: monday.getMonth() + 1,
    startDay: monday.getDate(),
    endMonth: saturday.getMonth() + 1,
    endDay: saturday.getDate(),
  };
}

export function getCuratedHolidays(year: number): CuratedHolidayEntry[] {
  return [getSemanaSanta(year), ...fixedHolidays];
}

function isDateInEntry(date: Date, entry: CuratedHolidayEntry): boolean {
  const value = (date.getMonth() + 1) * 100 + date.getDate();
  const start = entry.startMonth * 100 + entry.startDay;
  const end = entry.endMonth * 100 + entry.endDay;
  return value >= start && value <= end;
}

function entryDuration(entry: CuratedHolidayEntry, year: number): number {
  const start = new Date(year, entry.startMonth - 1, entry.startDay);
  const end = new Date(year, entry.endMonth - 1, entry.endDay);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function resolveFestiveEntry(date: Date): CuratedHolidayEntry | null {
  const candidates = getCuratedHolidays(date.getFullYear()).filter((entry) => isDateInEntry(date, entry));
  if (!candidates.length) return null;

  return candidates.reduce((mostSpecific, entry) => entryDuration(entry, date.getFullYear()) < entryDuration(mostSpecific, date.getFullYear()) ? entry : mostSpecific);
}
