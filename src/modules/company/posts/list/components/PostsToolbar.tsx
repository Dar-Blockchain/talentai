import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import {
  Plus as AddOutlined,
  Briefcase as WorkOutlineOutlined,
  Search as SearchOutlined,
  ArrowDownUp as SortOutlined,
  Calendar as CalendarTodayOutlined,
  ArrowDownAZ as SortByAlphaOutlined,
  CheckCircle2 as CheckCircleOutlineOutlined,
  Sparkles as AutoAwesomeOutlined,
  FileEdit as EditNoteOutlined,
  ListFilter as FilterListOutlined,
} from "lucide-react";
import type { StatusFilter, SortOption, TypeFilter } from "../types";

import { TEAL } from "@/modules/company/posts/shared/constants";

const selectTriggerClass =
  "h-[34px] w-fit gap-1 rounded-lg border-[#E5E7EB] bg-[#F9FAFB] px-2.5 text-[13px] shadow-none hover:border-[#E5E7EB] hover:shadow-none data-[state=open]:border-[#E5E7EB] data-[state=open]:shadow-none data-[state=open]:ring-0";

interface PostsToolbarProps {
  totalCount: number;
  loading: boolean;
  search: string;
  statusFilter: StatusFilter;
  typeFilter: TypeFilter;
  sortBy: SortOption;
  postsUsed: number;
  postsLimit: number | typeof Infinity;
  postsAtLimit: boolean;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: StatusFilter) => void;
  onTypeChange: (v: TypeFilter) => void;
  onSortChange: (v: SortOption) => void;
  onCreateClick: () => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label_key: string; color: string }[] = [
  { value: "all",     label_key: "status.all",    color: "#6B7280" },
  { value: "active",  label_key: "status.active", color: "#059669" },
  { value: "draft",   label_key: "status.draft",  color: "#D97706" },
  { value: "expired", label_key: "status.closed", color: "#DC2626" },
];

const TYPE_OPTIONS: { value: TypeFilter; label_key: string; color: string; bg: string; Icon: React.ElementType }[] = [
  { value: "all",    label_key: "type.all",    color: "#6B7280", bg: "#F3F4F6", Icon: FilterListOutlined },
  { value: "ai",     label_key: "type.ai",     color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  { value: "manual", label_key: "type.manual", color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
];

const SORT_GROUPS_DEF = [
  {
    label_key: "sort.date_group", Icon: CalendarTodayOutlined, color: "#6B7280",
    options: [
      { value: "newest"     as SortOption, label_key: "sort.newest" },
      { value: "oldest"     as SortOption, label_key: "sort.oldest" },
    ],
  },
  {
    label_key: "sort.title_group", Icon: SortByAlphaOutlined, color: "#0891B2",
    options: [
      { value: "title-asc"  as SortOption, label_key: "sort.title_asc"  },
      { value: "title-desc" as SortOption, label_key: "sort.title_desc" },
    ],
  },
];

const PostsToolbar: React.FC<PostsToolbarProps> = ({
  totalCount, loading, search, statusFilter, typeFilter, sortBy,
  postsUsed, postsLimit, postsAtLimit,
  onSearchChange, onStatusChange, onTypeChange, onSortChange, onCreateClick,
}) => {
  const { t }  = useTranslation("posts");
  const { t: td } = useTranslation("dashboard");

  const statusOpts = STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.label_key) }));
  const typeOpts   = TYPE_OPTIONS.map((o)   => ({ ...o, label: t(o.label_key) }));
  const sortGroups = SORT_GROUPS_DEF.map((g) => ({
    ...g, label: t(g.label_key),
    options: g.options.map((o) => ({ ...o, label: t(o.label_key) })),
  }));
  const sortFlat = sortGroups.flatMap((g) => g.options);

  const currentStatus = statusOpts.find((o) => o.value === statusFilter);
  const currentType   = typeOpts.find((o) => o.value === typeFilter);
  const CurrentTypeIcon = currentType?.Icon ?? FilterListOutlined;
  const currentSort   = sortFlat.find((o) => o.value === sortBy);

  return (
    <TooltipProvider>
      <div className="mb-6 overflow-hidden rounded-2xl border border-[#E5E7EB] border-t-[3px] border-t-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pb-5 pt-5">

          {/* Title + count */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px]" style={{ backgroundColor: `${TEAL}12` }}>
              <WorkOutlineOutlined size={20} color={TEAL} />
            </div>
            <div>
              <p className="text-[1.1rem] font-extrabold leading-tight text-[#111827]">{t("title")}</p>
              <p className="text-xs text-[#9CA3AF]">
                {loading ? td("pages.common.loading") : t("count", { count: totalCount })}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Search */}
            <div className="flex h-[34px] w-full items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 transition-colors focus-within:border-teal-500 sm:w-[220px] md:w-[300px] lg:w-[380px]">
              <SearchOutlined size={15} color="#9CA3AF" className="mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full flex-1 border-none bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
              />
            </div>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
              <SelectTrigger className={selectTriggerClass}>
                <CheckCircleOutlineOutlined size={14} color="#9CA3AF" />
                <SelectValue>
                  <span className="text-[13px]" style={{ color: statusFilter === "all" ? "#9CA3AF" : (currentStatus?.color ?? "#374151") }}>
                    {currentStatus?.label ?? t("status.all")}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[160px]">
                {statusOpts.map(({ value, label, color }) => (
                  <SelectItem key={value} value={value}>
                    <span className="text-[13px]" style={{ fontWeight: statusFilter === value ? 700 : 400, color: statusFilter === value ? color : "#374151" }}>
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as TypeFilter)}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue>
                  <span className="flex items-center gap-1">
                    <CurrentTypeIcon size={14} color={typeFilter === "all" ? "#9CA3AF" : currentType?.color} />
                    <span className="text-[13px]" style={{ color: typeFilter === "all" ? "#9CA3AF" : currentType?.color }}>
                      {currentType?.label ?? t("type.all")}
                    </span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[160px]">
                {typeOpts.map(({ value, label, color, bg, Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      {value !== "all" && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px]" style={{ backgroundColor: bg }}>
                          <Icon size={11} color={color} />
                        </span>
                      )}
                      <span className="text-[13px]" style={{ fontWeight: typeFilter === value ? 700 : 400, color: typeFilter === value ? color : "#374151" }}>
                        {label}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
              <SelectTrigger className={selectTriggerClass}>
                <SortOutlined size={14} color="#9CA3AF" />
                <SelectValue>
                  <span className="text-[13px] text-[#374151]">{currentSort?.label ?? td("pages.common.sort")}</span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[190px]">
                {sortGroups.map((group, gi) => (
                  <React.Fragment key={`g-${gi}`}>
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-1.5" style={{ color: group.color }}>
                        <group.Icon size={12} />{group.label}
                      </SelectLabel>
                      {group.options.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          <span className="text-[13px]" style={{ fontWeight: sortBy === value ? 700 : 400, color: sortBy === value ? group.color : "#374151" }}>
                            {label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {gi < sortGroups.length - 1 && <SelectSeparator />}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>

            <div className="mx-0.5 h-[22px] w-px bg-[#E5E7EB]" />

            {/* New post button */}
            {postsAtLimit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button size="sm" disabled onClick={onCreateClick}>
                      <AddOutlined size={16} />
                      {t("limit_reached", { used: postsUsed, limit: postsLimit })}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t("limit_tooltip", { used: postsUsed, limit: postsLimit })}</TooltipContent>
              </Tooltip>
            ) : (
              <Button size="sm" onClick={onCreateClick}>
                <AddOutlined size={16} />
                {t("new_post")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PostsToolbar;
