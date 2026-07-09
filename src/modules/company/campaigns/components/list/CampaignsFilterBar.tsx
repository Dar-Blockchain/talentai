"use client";

import React from "react";
import { Search, Calendar, X } from "lucide-react";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";

export interface PeriodOption {
  value: string;
  label: string;
}

// Radix Select requires non-empty item values
export const toSelectVal   = (v: string) => v || "__all__";
export const fromSelectVal = (v: string) => v === "__all__" ? "" : v;

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Hide the search input entirely (e.g. anonymous campaigns, where names can't be searched). */
  showSearch?: boolean;
  period: string;
  onPeriodChange: (value: string) => void;
  periodOptions: PeriodOption[];
  periodPlaceholder: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  clearLabel: string;
  /** Extra filter control rendered between search and period (e.g. a status Select). */
  extraFilters?: React.ReactNode;
}

const CampaignsFilterBar: React.FC<Props> = ({
  search, onSearchChange, searchPlaceholder, showSearch = true,
  period, onPeriodChange, periodOptions, periodPlaceholder,
  hasActiveFilters, onClearFilters, clearLabel,
  extraFilters,
}) => (
  <div className="flex gap-2 items-center flex-wrap">
    {showSearch && (
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 bg-card text-sm h-9"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    )}

    {extraFilters}

    <Select
      value={toSelectVal(period)}
      onValueChange={(v) => onPeriodChange(fromSelectVal(v))}
    >
      <SelectTrigger className="w-40 bg-card h-9 text-sm">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-muted-foreground shrink-0" />
          <SelectValue placeholder={periodPlaceholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        {periodOptions.map((o) => (
          <SelectItem key={toSelectVal(o.value)} value={toSelectVal(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {hasActiveFilters && (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 h-9 text-muted-foreground"
        onClick={onClearFilters}
      >
        <X className="size-3.5" />
        {clearLabel}
      </Button>
    )}
  </div>
);

export default CampaignsFilterBar;
