"use client";

import React, { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { cn } from "@/lib/utils";

interface AppAutocompleteProps {
  label?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  className?: string;
}

const AppAutocomplete = React.memo<AppAutocompleteProps>(({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  error,
  fullWidth = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [search, options]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  };

  const handleSelect = (opt: string) => {
    onChange?.(opt);
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-1", fullWidth ? "w-full" : "w-auto", className)}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-[38px] w-full items-center justify-between gap-2 rounded-lg border px-3 text-[13px] transition-colors",
              disabled ? "bg-gray-100 text-gray-500" : "bg-white text-gray-700",
              error ? "border-red-500" : "border-gray-200 hover:border-gray-300",
              "disabled:cursor-not-allowed",
            )}
          >
            <span className={cn("truncate text-left", !value && "text-gray-400")}>
              {value || placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 text-gray-400" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" sideOffset={4} className="w-(--radix-popover-trigger-width) p-0">
          <div className="flex items-center gap-2 border-b px-3 py-2.5">
            <Search className="size-4 shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No options found</p>
            ) : filtered.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors hover:bg-teal-50 hover:text-teal-600",
                  value === opt && "bg-teal-50 font-semibold text-teal-600",
                )}
              >
                {opt}
                {value === opt && <Check className="size-4 shrink-0" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {error && <span className="ml-0 text-[11px] text-red-500">{error}</span>}
    </div>
  );
});

AppAutocomplete.displayName = "AppAutocomplete";

export default AppAutocomplete;
