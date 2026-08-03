const LOCALE = "en-GB";

export interface WebinarSchedule {
  date: string;
  time: string;
  endTime: string | null;
}

/** Splits a webinar's start/end datetimes into display-ready date/time parts.
 * Shared by the card list and the detail page header so the "en-GB" locale
 * and field formatting only live in one place. */
export function formatWebinarSchedule(date: string | null, endDate: string | null): WebinarSchedule | null {
  if (!date) return null;
  const start = new Date(date);
  return {
    date: start.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }),
    time: start.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" }),
    endTime: endDate
      ? new Date(endDate).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" })
      : null,
  };
}
