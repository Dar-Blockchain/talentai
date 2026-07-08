import React from "react";
import { useTranslation } from "react-i18next";
import {
  Search as SearchOutlined,
  ArrowDownUp as SortOutlined,
  Users as PeopleAltOutlined,
  Calendar as CalendarTodayOutlined,
  Star as StarOutlineOutlined,
  Brain as PsychologyOutlined,
  ArrowDownAZ as SortByAlphaOutlined,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";

import { TEAL } from "@/modules/company/posts/shared/constants";

const STATUS_I18N_KEYS: Record<string, string> = {
  visited:             "pages.applications.status.visited",
  interview_completed: "pages.applications.status.interview_completed",
  withdrawn:           "pages.applications.status.withdrawn",
};

interface SortGroup {
  labelKey: string;
  Icon: LucideIcon;
  color: string;
  options: { value: string; labelKey: string }[];
}

const SORT_GROUP_DEFS: SortGroup[] = [
  { labelKey: "pages.applications.sort.date_applied",    Icon: CalendarTodayOutlined, color: "#6B7280",
    options: [
      { value: "appliedAt_desc", labelKey: "pages.applications.sort.most_recent" },
      { value: "appliedAt_asc",  labelKey: "pages.applications.sort.earliest"    },
    ],
  },
  { labelKey: "pages.applications.sort.match_score",     Icon: StarOutlineOutlined,  color: "#D97706",
    options: [
      { value: "matchScore_desc", labelKey: "pages.applications.sort.best_match"  },
      { value: "matchScore_asc",  labelKey: "pages.applications.sort.worst_match" },
    ],
  },
  { labelKey: "pages.applications.sort.interview_score", Icon: PsychologyOutlined,   color: "#7C3AED",
    options: [
      { value: "interviewScore_desc", labelKey: "pages.applications.sort.top_performers" },
      { value: "interviewScore_asc",  labelKey: "pages.applications.sort.low_performers" },
    ],
  },
  { labelKey: "pages.applications.sort.candidate_name",  Icon: SortByAlphaOutlined,  color: "#0891B2",
    options: [
      { value: "name_asc",  labelKey: "pages.applications.sort.a_to_z" },
      { value: "name_desc", labelKey: "pages.applications.sort.z_to_a" },
    ],
  },
];

const SORT_OPTIONS_FLAT = SORT_GROUP_DEFS.flatMap((g) => g.options);

interface Props {
  searchInput: string;
  status: string;
  sort: string;
  totalCount: number | undefined;
  loading: boolean;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onSortChange: (v: string) => void;
}

const ApplicationsToolbar: React.FC<Props> = ({
  searchInput, status, sort, totalCount, loading,
  onSearchChange, onStatusChange, onSortChange,
}) => {
  const { t } = useTranslation("dashboard");

  const currentSortLabel = SORT_OPTIONS_FLAT.find((o) => o.value === sort)?.labelKey;

  return (
    <div className="mb-5 flex flex-nowrap items-center justify-between gap-3 overflow-x-auto">
      {/* Title + count */}
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg leading-none" style={{ backgroundColor: `${TEAL}15` }}>
          <PeopleAltOutlined size={17} color={TEAL} className="shrink-0" />
        </div>
        <span className="text-[15px] font-bold text-gray-900">{t("pages.applications.title")}</span>
        {!loading && totalCount !== undefined && (
          <Badge
            variant="outline"
            className="h-5 min-w-[28px] justify-center rounded-full border-transparent text-[11px] font-bold"
            style={{ backgroundColor: `${TEAL}15`, color: TEAL }}
          >
            {totalCount}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex shrink-0 flex-nowrap items-center gap-2">
        {/* Search */}
        <div className="flex h-[34px] min-w-[210px] items-center rounded-lg border border-gray-200 bg-white px-3 transition-colors focus-within:border-teal-500">
          <SearchOutlined size={15} color="#9CA3AF" className="mr-1.5" />
          <input
            placeholder={t("pages.applications.search_placeholder")}
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Status filter */}
        <Select
          value={status || "all"}
          onValueChange={(v) => onStatusChange(v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className="h-[34px] min-w-[130px] text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("pages.applications.status.all")}</SelectItem>
            {Object.entries(STATUS_I18N_KEYS).map(([val, key]) => (
              <SelectItem key={val} value={val}>{t(key)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-[34px] min-w-[200px] items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 text-[13px] text-gray-700 outline-none transition-colors hover:border-gray-300">
              <SortOutlined size={14} color="#9CA3AF" />
              <span className="flex-1 truncate text-left">
                {currentSortLabel ? t(currentSortLabel) : t("pages.applications.sort.most_recent")}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="mt-0.5 min-w-[200px] rounded-xl border border-gray-200 p-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
          >
            {SORT_GROUP_DEFS.map((group, gi) => (
              <React.Fragment key={group.labelKey}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: group.color }}>
                  <group.Icon size={12} />{t(group.labelKey)}
                </div>
                {group.options.map(({ value, labelKey }) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onSortChange(value)}
                    className="mx-0.5 rounded-lg px-3 py-1.5"
                  >
                    <span
                      className="text-[13px]"
                      style={{ fontWeight: sort === value ? 700 : 400, color: sort === value ? group.color : "#374151" }}
                    >
                      {t(labelKey)}
                    </span>
                  </DropdownMenuItem>
                ))}
                {gi < SORT_GROUP_DEFS.length - 1 && <DropdownMenuSeparator className="my-1 bg-gray-100" />}
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ApplicationsToolbar;
