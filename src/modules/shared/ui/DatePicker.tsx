"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import dayjs from "@/lib/dayjs";
import { Button } from "@/modules/shared/ui/shadcn/button";
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
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-start gap-2 text-sm font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            {value ? dayjs(value).format(formatStr) : placeholder}
          </Button>
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
