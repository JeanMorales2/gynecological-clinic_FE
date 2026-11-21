import { NextResponse } from "next/server";
import { resolveFestiveEntry } from "@/features/festive-theme/data/curated-holidays";

type NagerHoliday = { date?: string; localName?: string; name?: string };

function dateFromQuery(value: string | null): Date {
  if (!value) return new Date();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date();
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day ? parsed : new Date();
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export async function GET(request: Request) {
  const targetDate = dateFromQuery(new URL(request.url).searchParams.get("date"));
  const entry = resolveFestiveEntry(targetDate);
  if (!entry) return NextResponse.json({ hasTheme: false, season: null, label: "", icon: null, accentColor: null, source: "curated" });

  let label = entry.label;
  let source: "curated" | "curated+nager" = "curated";
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${targetDate.getFullYear()}/NI`, { next: { revalidate: 86_400 } });
    if (response.ok) {
      const holidays = await response.json() as NagerHoliday[];
      const officialHoliday = holidays.find((holiday) => holiday.date === toIsoDate(targetDate));
      const officialLabel = officialHoliday?.localName ?? officialHoliday?.name;
      if (officialLabel) {
        label = `${entry.label} · ${officialLabel}`;
        source = "curated+nager";
      }
    }
  } catch {
    // The local curated calendar is intentionally the resilient source of truth.
  }

  return NextResponse.json({ hasTheme: true, season: entry.id, label, icon: entry.icon, accentColor: entry.accentColor, source });
}
