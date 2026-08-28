import type { TFunction } from "i18next";

export interface DayGroup<T> { key: string; label: string; items: T[] }

function dayKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(dateStr: string, t: TFunction, lang: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const startOf = (dt: Date) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (diffDays === 0) return t("pages.common.today", "Today");
  if (diffDays === 1) return t("pages.common.yesterday", "Yesterday");
  return d.toLocaleDateString(lang?.startsWith("fr") ? "fr-FR" : "en-US", {
    weekday: diffDays < 7 ? "long" : undefined,
    month: "short", day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

// Buckets a newest-first-sorted list into "Today" / "Yesterday" / weekday /
// date groups by walking it once — items must already be sorted, this never
// re-sorts. Used by the full-page activity feeds (Team Activity, Campaign
// Activity) so a long list reads as a timeline instead of one flat block.
export function groupByDay<T>(items: T[], getDate: (item: T) => string, t: TFunction, lang: string): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  items.forEach((item) => {
    const key = dayKey(getDate(item));
    const last = groups[groups.length - 1];
    if (last && last.key === key) { last.items.push(item); return; }
    groups.push({ key, label: dayLabel(getDate(item), t, lang), items: [item] });
  });
  return groups;
}
