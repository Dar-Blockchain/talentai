import React, { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Users } from "lucide-react";
import { ROLES } from "@/modules/shared/constants/employee";
import { useTranslation } from "react-i18next";
import { getRoleDescription, getRoleLabel, roleMatchesSearch } from "@/modules/company/employees/utils/employeeRoleI18n";
import { Popover, PopoverContent, PopoverTrigger } from "@/modules/shared/ui/shadcn/popover";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (f: string) => void;
}

const RoleFilterSelect: React.FC<Props> = memo(({ value, onChange }) => {
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

  const selected = value && value !== "all" ? ROLES.find((r) => r.value === value) : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROLES.filter((r) => !q || roleMatchesSearch(r.value, q, t));
  }, [search, t]);

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
              <span
                className="flex size-[18px] shrink-0 items-center justify-center rounded-[6px]"
                style={{ backgroundColor: `${selected.color}18`, color: selected.color }}
              >
                <selected.icon size={11} />
              </span>
              <span className="text-[13px] font-bold" style={{ color: selected.color }}>
                {getRoleLabel(selected.value, t)}
              </span>
            </>
          ) : (
            <>
              <Users className="size-[14px] text-[#9CA3AF]" />
              <span className="text-[13px] font-medium text-[#6B7280]">{pf("role_placeholder")}</span>
            </>
          )}
          <ChevronDown className={cn("size-3.5 text-[#9CA3AF] transition-transform duration-200", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" avoidCollisions={false} sideOffset={4} className="max-h-[380px] w-56 overflow-hidden rounded-2xl border border-[#E5E7EB] p-0 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
        {/* Search */}
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#f3f4f6] bg-white p-2">
          <Search className="size-3.5 shrink-0 text-[#9CA3AF]" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={pf("search_roles")}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[#9CA3AF] hover:text-[#374151]">
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[320px] overflow-y-auto p-1">
          <button
            onClick={() => handleSelect("all")}
            className={cn(
              "flex w-full items-center gap-[10px] rounded-lg px-3 py-[7px] text-left transition-colors hover:bg-gray-50",
              (value === "all" || !value) && "bg-gray-50",
            )}
          >
            <span className="flex size-[26px] shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-[#6B7280]">
              <Users className="size-3.5" />
            </span>
            <span>
              <span className="block text-[13px] font-bold leading-[1.2] text-[#374151]">{pf("all_roles")}</span>
              <span className="block text-[11px] text-[#9CA3AF]">{pf("all_roles_sub")}</span>
            </span>
          </button>

          {filtered.map((r) => (
            <button
              key={r.value}
              onClick={() => handleSelect(r.value)}
              className={cn(
                "flex w-full items-center gap-[10px] rounded-lg px-3 py-[6px] text-left transition-colors hover:bg-gray-50",
                value === r.value && "bg-gray-50",
              )}
            >
              <span
                className="flex size-[26px] shrink-0 items-center justify-center rounded-[10px]"
                style={{ backgroundColor: `${r.color}18`, color: r.color }}
              >
                <r.icon size={14} />
              </span>
              <span>
                <span className="block text-[13px] font-bold leading-[1.2] text-[#111827]">
                  {getRoleLabel(r.value, t)}
                </span>
                <span className="block text-[11px] text-[#6b7280]">
                  {getRoleDescription(r.value, t)}
                </span>
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="py-4 text-center text-xs text-[#9CA3AF]">
              {pf("no_roles_match", { term: search })}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

RoleFilterSelect.displayName = "RoleFilterSelect";
export default RoleFilterSelect;
