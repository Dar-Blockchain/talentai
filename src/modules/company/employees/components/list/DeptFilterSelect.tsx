import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Building2 } from "lucide-react";
import { Department } from "@/modules/company/departments/types";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (d: string) => void;
  departments: Department[];
}

const DeptFilterSelect: React.FC<Props> = memo(({ value, onChange, departments }) => {
  const { t } = useTranslation("dashboard");
  const pf = useCallback((key: string, opts?: Record<string, string | number>) =>
    t(`pages.employees.filters.${key}`, opts), [t]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  const selected = value && value !== "all" ? departments.find((d) => d._id === value) : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return !q ? departments : departments.filter((d) => d.name.toLowerCase().includes(q));
  }, [departments, search]);

  const handleSelect = useCallback((v: string) => {
    onChange(v);
    setOpen(false);
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-full min-h-[36px] items-center gap-1.5 px-3 text-sm transition-colors hover:bg-gray-50"
        >
          {selected ? (
            <>
              <Building2 className="size-[14px] text-[#0891B2]" />
              <span className="text-[13px] font-bold text-[#0891B2]">{selected.name}</span>
            </>
          ) : (
            <>
              <Building2 className="size-[14px] text-[#9CA3AF]" />
              <span className="text-[13px] font-medium text-[#6B7280]">{pf("department_placeholder")}</span>
            </>
          )}
          <ChevronDown className={cn("size-3.5 text-[#9CA3AF] transition-transform duration-200", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="max-h-[320px] w-56 overflow-hidden rounded-2xl border border-[#E5E7EB] p-0 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
        {/* Search */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#f3f4f6] bg-white p-2">
          <Search className="size-3.5 shrink-0 text-[#9CA3AF]" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={pf("search_departments")}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#9CA3AF] hover:text-[#374151]">
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[260px] overflow-y-auto p-1">
          <button
            onClick={() => handleSelect("all")}
            className={cn(
              "flex w-full items-center gap-[10px] rounded-lg px-3 py-[7px] text-left transition-colors hover:bg-gray-50",
              (value === "all" || !value) && "bg-gray-50",
            )}
          >
            <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-[#6B7280]">
              <Building2 className="size-3.5" />
            </span>
            <span className="text-[13px] font-bold text-[#374151]">{pf("all_departments")}</span>
          </button>

          {filtered.map((d) => (
            <button
              key={d._id}
              onClick={() => handleSelect(d._id)}
              className={cn(
                "flex w-full items-center gap-[10px] rounded-lg px-3 py-[7px] text-left transition-colors hover:bg-gray-50",
                value === d._id && "bg-gray-50",
              )}
            >
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[10px] bg-[#EFF6FF] text-[#0891B2]">
                <Building2 className="size-3.5" />
              </span>
              <span className="text-[13px] font-semibold text-[#111827]">{d.name}</span>
            </button>
          ))}

          {filtered.length === 0 && departments.length > 0 && (
            <p className="py-4 text-center text-xs text-[#9CA3AF]">
              {pf("no_departments_match", { term: search })}
            </p>
          )}
          {departments.length === 0 && (
            <p className="py-4 text-center text-xs text-[#9CA3AF]">
              {pf("no_departments_yet")}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

DeptFilterSelect.displayName = "DeptFilterSelect";
export default DeptFilterSelect;
