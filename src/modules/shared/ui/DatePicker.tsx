"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { Calendar } from "@/modules/shared/ui/shadcn/calendar";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  /** ISO date string, or empty/undefined when no date is selected. */
  value?: string | null;
  /** Emits an ISO date string, or "" when cleared. */
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Dates before this are disabled in the calendar. */
  minDate?: Date;
  /** Dates after this are disabled in the calendar. */
  maxDate?: Date;
  /** Shows a "Clear date" link under the field when a date is selected. */
  clearable?: boolean;
  error?: string;
  className?: string;
  /** dayjs format string used to display the selected date. */
  formatStr?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  maxDate,
  clearable = false,
  error,
  className,
  formatStr = "MMM D, YYYY",
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            data-state={open ? "open" : "closed"}
            className={cn(
              "group relative flex h-10 w-full cursor-pointer items-center justify-start gap-2 whitespace-nowrap",
              "rounded-xl border px-3.5 text-sm font-normal outline-none transition-all duration-200",
              "border-input bg-background text-foreground",
              "shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]",
              "hover:border-primary/40 hover:shadow-[0_2px_8px_rgba(106,211,156,0.12)]",
              "data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/20",
              "data-[state=open]:shadow-[0_0_0_3px_rgba(106,211,156,0.12),0_2px_8px_rgba(106,211,156,0.15)]",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/40",
              !value && "text-muted-foreground/60",
              className,
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground/60" />
            {value ? dayjs(value).format(formatStr) : placeholder}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => { onChange(date ? date.toISOString() : ""); setOpen(false); }}
            disabled={(date) => (minDate ? date < minDate : false) || (maxDate ? date > maxDate : false)}
          />
        </PopoverContent>
      </Popover>
      {clearable && value && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear date
        </button>
      )}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default DatePicker;
