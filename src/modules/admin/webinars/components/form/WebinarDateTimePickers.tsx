import React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/modules/shared/ui/shadcn/popover";
import { Calendar } from "@/modules/shared/ui/shadcn/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { Calendar as CalendarGlyph, Clock as ClockIcon } from "lucide-react";
import dayjs from "@/lib/dayjs";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"] as const;

/** Splits a 24h "HH:mm" string into 12h hour, minute, and AM/PM period. */
function to12h(timePart: string): { hh: string; mm: string; period: "AM" | "PM" } {
  const [h24, mm] = timePart.split(":");
  const hourNum = parseInt(h24, 10);
  const period: "AM" | "PM" = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  return { hh: String(hour12).padStart(2, "0"), mm, period };
}

/** Combines 12h hour + minute + AM/PM back into a 24h "HH:mm" string. */
function to24h(hh: string, mm: string, period: "AM" | "PM") {
  let h = parseInt(hh, 10) % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${mm}`;
}

/** Just the calendar day — start/end clock times are picked separately via
 * WebinarTimePicker ("From" / "To"). */
export function WebinarDatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? dayjs(`${value}T00:00:00`).toDate() : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-state={open ? "open" : "closed"}
          className="group flex h-[42px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-700 outline-none transition-colors hover:border-teal-300 data-[state=open]:border-teal-400"
        >
          <CalendarGlyph size={15} className="shrink-0 text-slate-400" />
          {value ? (
            <span>{dayjs(`${value}T00:00:00`).format("MMM D, YYYY")}</span>
          ) : (
            <span className="text-slate-400">Pick a date</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          disabled={(date) => date < dayjs().startOf("day").toDate()}
          onSelect={(date) => {
            if (date) {
              onChange(dayjs(date).format("YYYY-MM-DD"));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Just an "HH:mm" time — no calendar, used for both the "From" and "To"
 * clock times paired with the date picked in WebinarDatePicker. */
export function WebinarTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { hh, mm, period } = to12h(value || "09:00");

  const setTime = (nextHh: string, nextMm: string, nextPeriod: "AM" | "PM") =>
    onChange(to24h(nextHh, nextMm, nextPeriod));

  const timeSelectTrigger =
    "h-9 w-[68px] px-2 gap-0.5 rounded-lg border-slate-200 text-[13px] font-semibold text-slate-700 focus:border-teal-400 focus:ring-teal-400/20";
  const periodSelectTrigger =
    "h-9 w-[76px] px-2 gap-0.5 rounded-lg border-slate-200 text-[13px] font-semibold text-slate-700 focus:border-teal-400 focus:ring-teal-400/20";

  return (
    <div className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
      <ClockIcon size={15} className="shrink-0 text-slate-400" />
      <Select value={hh} onValueChange={(v) => setTime(v, mm, period)}>
        <SelectTrigger size="sm" className={timeSelectTrigger}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {HOURS_12.map((h) => (
            <SelectItem key={h} value={h} className="text-[13px]">
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="font-bold text-slate-300">:</span>
      <Select value={mm} onValueChange={(v) => setTime(hh, v, period)}>
        <SelectTrigger size="sm" className={timeSelectTrigger}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-56">
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m} className="text-[13px]">
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={(v) => setTime(hh, mm, v as "AM" | "PM")}>
        <SelectTrigger size="sm" className={periodSelectTrigger}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p} value={p} className="text-[13px]">
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
