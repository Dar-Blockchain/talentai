import React, { memo, useState, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal, X, FilterX } from "lucide-react";
import RoleFilterSelect from "./RoleFilterSelect";
import DeptFilterSelect from "./DeptFilterSelect";
import SortSelect from "./SortSelect";
import { Department } from "@/modules/company/departments/types";
import { RoleFilter, SortOption } from "./EmployeesList";
import { useTranslation } from "react-i18next";
import { PURPLE } from "./constants";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/modules/shared/ui/shadcn/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/modules/shared/ui/shadcn/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/ui/shadcn/button";

export interface EmployeesFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (f: RoleFilter) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (d: string) => void;
  departments: Department[];
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  resultCount: number;
  hideDepartmentFilter?: boolean;
}

const Divider = () => <div className="h-5 w-px shrink-0 bg-[#E5E7EB]" />;

const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
  compact?: boolean;
}> = memo(({ value, onChange, onClear, placeholder = "Search…", compact }) => (
  <div className={cn(
    "flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-3",
    compact ? "py-[6px]" : "py-1",
    "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  )}>
    <Search className="size-4 shrink-0 text-[#9CA3AF]" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 bg-transparent py-1.25 text-[13px] text-[#111827] outline-none placeholder:text-gray-400"
    />
    {value && (
      <button onClick={onClear} className="shrink-0 text-[#9CA3AF] transition-colors hover:text-[#374151]">
        <X className="size-[13px]" />
      </button>
    )}
  </div>
));
SearchInput.displayName = "SearchInput";

const FiltersButton: React.FC<{ activeCount: number; onClick: () => void; label: string }> = memo(({ activeCount, onClick, label }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className={cn(
      "relative shrink-0 h-auto gap-[6px] rounded-xl px-3 py-[9px] shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
      activeCount > 0
        ? "border-[#C084FC] bg-[#F5F3FF] text-[#8310FF]"
        : "border-[#E5E7EB] bg-white text-[#374151]",
    )}
  >
    <SlidersHorizontal className={cn("size-[17px]", activeCount > 0 ? "text-[#8310FF]" : "text-[#6B7280]")} />
    <span className={cn("whitespace-nowrap text-[13px] font-semibold", activeCount > 0 ? "text-[#8310FF]" : "text-[#374151]")}>
      {label}
    </span>
    {activeCount > 0 && (
      <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-[#8310FF] text-[10px] font-extrabold text-white">
        {activeCount}
      </span>
    )}
  </Button>
));
FiltersButton.displayName = "FiltersButton";

const EmployeesFilterBar: React.FC<EmployeesFilterBarProps> = memo(({
  search, onSearchChange,
  roleFilter, onRoleFilterChange,
  departmentFilter, onDepartmentFilterChange, departments,
  sortBy, onSortChange,
  resultCount,
  hideDepartmentFilter = false,
}) => {
  const { t } = useTranslation("dashboard");
  const pf = useCallback((k: string) => t(`pages.employees.filters.${k}`), [t]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hasRoleFilter = roleFilter !== "all";
  const hasDeptFilter = departmentFilter !== "all";
  const hasSearch     = search.trim().length > 0;
  const hasAnyFilter  = hasRoleFilter || hasDeptFilter || hasSearch;
  const activeCount   = [hasRoleFilter, hasDeptFilter].filter(Boolean).length;

  const clearAll    = useCallback(() => { onSearchChange(""); onRoleFilterChange("all"); onDepartmentFilterChange("all"); }, [onSearchChange, onRoleFilterChange, onDepartmentFilterChange]);
  const clearSearch = useCallback(() => onSearchChange(""), [onSearchChange]);
  const openDrawer  = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const drawerSections = useMemo(() => {
    const sections: { label: string; content: React.ReactNode }[] = [
      {
        label: pf("label_search"),
        content: (
          <div className="flex items-center rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-[5px]">
            <Search className="size-4 shrink-0 text-[#9CA3AF] mr-2" />
            <input
              type="text"
              placeholder={pf("search_placeholder")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent py-1.5 text-[13px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            />
            {hasSearch && (
              <button onClick={clearSearch} className="text-[#9CA3AF]">
                <X className="size-[13px]" />
              </button>
            )}
          </div>
        ),
      },
      {
        label: pf("label_role"),
        content: (
          <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <RoleFilterSelect value={roleFilter} onChange={onRoleFilterChange} />
          </div>
        ),
      },
      ...(!hideDepartmentFilter ? [{
        label: pf("label_department"),
        content: (
          <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <DeptFilterSelect value={departmentFilter} onChange={onDepartmentFilterChange} departments={departments} />
          </div>
        ),
      }] : []),
      {
        label: pf("label_sort"),
        content: (
          <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <SortSelect value={sortBy} onChange={onSortChange} />
          </div>
        ),
      },
    ];
    return sections;
  }, [search, hasSearch, roleFilter, departmentFilter, departments, sortBy, hideDepartmentFilter, onSearchChange, onRoleFilterChange, onDepartmentFilterChange, onSortChange, pf, clearSearch]);

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-2">

        {/* ── Desktop: fully inline bar (≥1101px) ── */}
        <div className="hidden min-[1101px]:flex min-w-0 flex-1 items-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <SearchInput value={search} onChange={onSearchChange} onClear={clearSearch} placeholder={pf("search_placeholder")} />
          <Divider />
          <RoleFilterSelect value={roleFilter} onChange={onRoleFilterChange} />
          {!hideDepartmentFilter && <Divider />}
          {!hideDepartmentFilter && <DeptFilterSelect value={departmentFilter} onChange={onDepartmentFilterChange} departments={departments} />}
          <Divider />
          <SortSelect value={sortBy} onChange={onSortChange} />
        </div>

        {/* ── Tablet + Mobile: search + drawer button (<1101px) ── */}
        <div className="flex min-[1101px]:hidden min-w-0 flex-1 gap-2">
          <SearchInput value={search} onChange={onSearchChange} onClear={clearSearch} placeholder={pf("search_placeholder")} />
          <FiltersButton activeCount={activeCount} onClick={openDrawer} label={pf("filters")} />
        </div>

        {/* Clear all */}
        {hasAnyFilter && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={clearAll}
                  className="flex shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white p-[7px] shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-[#9CA3AF] transition-all duration-150 hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                >
                  <FilterX className="size-[17px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {pf("clear_all_tooltip")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* ── Bottom sheet filter drawer ── */}
      <Drawer open={drawerOpen} onOpenChange={(o) => !o && closeDrawer()} direction="bottom">
        <DrawerContent
          style={{ top: "auto", left: 0, right: 0, bottom: 0, width: "100%", maxHeight: "85vh" }}
          className="flex flex-col rounded-t-[20px] border-l-0 border-r-0 border-b-0 border-t border-gray-200 shadow-2xl"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-9 rounded-full bg-[#E5E7EB]" />
          </div>

          {/* Header */}
          <DrawerHeader className="border-b border-[#F3F4F6] px-5 py-[14px]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-[18px]" style={{ color: PURPLE }} />
              <DrawerTitle className="text-base font-bold text-[#111827] normal-case tracking-normal">
                {pf("drawer_title")}
              </DrawerTitle>
              {activeCount > 0 && (
                <span
                  className="rounded-full border px-2 py-0.5 text-[11px] font-extrabold"
                  style={{ backgroundColor: `${PURPLE}12`, borderColor: `${PURPLE}25`, color: PURPLE }}
                >
                  {t("pages.employees.filters.active_chip", { count: activeCount })}
                </span>
              )}
            </div>
          </DrawerHeader>

          {/* Sections */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
            {drawerSections.map(({ label, content }) => (
              <div key={label}>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.06em] text-[#6B7280]">{label}</p>
                {content}
              </div>
            ))}
          </div>

          {/* Footer */}
          <DrawerFooter className="flex gap-3 border-t border-[#F3F4F6] px-5 py-4">
            <Button
              variant="outline"
              onClick={clearAll}
              className="flex-1 h-auto rounded-xl bg-[#F9FAFB] py-[10px] text-[14px] font-semibold text-[#374151] hover:bg-[#F3F4F6]"
            >
              {pf("clear_all")}
            </Button>
            <Button
              variant="ghost"
              onClick={closeDrawer}
              className="flex-[2] h-auto rounded-xl py-[10px] text-[14px] font-bold text-white hover:text-white hover:opacity-90"
              style={{ backgroundColor: PURPLE }}
            >
              {resultCount > 0
                ? t("pages.employees.filters.show_results_count", { count: resultCount })
                : t("pages.employees.filters.show_results")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
});

EmployeesFilterBar.displayName = "EmployeesFilterBar";
export default EmployeesFilterBar;
