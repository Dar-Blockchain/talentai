import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchOutlined       from "@mui/icons-material/SearchOutlined";
import SortOutlined         from "@mui/icons-material/SortOutlined";
import PeopleAltOutlined    from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlined  from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import StarOutlineOutlined  from "@mui/icons-material/StarOutlineOutlined";
import PsychologyOutlined   from "@mui/icons-material/PsychologyOutlined";
import SortByAlphaOutlined  from "@mui/icons-material/SortByAlphaOutlined";
import CloseOutlined        from "@mui/icons-material/CloseOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import AppButton from "@/components/ui/AppButton";
import { TEAL } from "./constants";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

interface Props {
  searchInput: string;
  status: string;
  postId: string;
  postTitle: string;
  sort: string;
  loading: boolean;
  totalCount: number;
  downloading: boolean;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPostPickerOpen: () => void;
  onClearPost: () => void;
  onSortChange: (v: string) => void;
  onDownload: () => void;
}

const STATUS_VALUES = [
  { value: "visited",             i18nKey: "pages.applications.status.visited" },
  { value: "interview_completed", i18nKey: "pages.applications.status.interview_completed" },
] as const;

interface SortGroup {
  labelKey: string;
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
  options: { value: string; labelKey: string }[];
}

const SORT_GROUPS: SortGroup[] = [
  {
    labelKey: "pages.applications.sort.date_applied", Icon: CalendarTodayOutlined, color: "#6B7280",
    options: [
      { value: "appliedAt_desc", labelKey: "pages.applications.sort.most_recent" },
      { value: "appliedAt_asc",  labelKey: "pages.applications.sort.earliest" },
    ],
  },
  {
    labelKey: "pages.applications.sort.match_score", Icon: StarOutlineOutlined, color: "#D97706",
    options: [
      { value: "matchScore_desc", labelKey: "pages.applications.sort.best_match" },
      { value: "matchScore_asc",  labelKey: "pages.applications.sort.worst_match" },
    ],
  },
  {
    labelKey: "pages.applications.sort.interview_score", Icon: PsychologyOutlined, color: "#7C3AED",
    options: [
      { value: "interviewScore_desc", labelKey: "pages.applications.sort.top_performers" },
      { value: "interviewScore_asc",  labelKey: "pages.applications.sort.low_performers" },
    ],
  },
  {
    labelKey: "pages.applications.sort.candidate_name", Icon: SortByAlphaOutlined, color: "#0891B2",
    options: [
      { value: "name_asc",  labelKey: "pages.applications.sort.a_to_z" },
      { value: "name_desc", labelKey: "pages.applications.sort.z_to_a" },
    ],
  },
];

const SORT_OPTIONS_FLAT = SORT_GROUPS.flatMap((g) => g.options);

const ApplicationsToolbar: React.FC<Props> = memo(({
  searchInput, status, postId, postTitle, sort,
  loading, totalCount, downloading,
  onSearchChange, onStatusChange, onPostPickerOpen, onClearPost, onSortChange, onDownload,
}) => {
  const { t } = useTranslation("dashboard");
  const [sortOpen, setSortOpen] = useState(false);

  const currentSortLabel = useMemo(
    () => SORT_OPTIONS_FLAT.find((o) => o.value === sort)?.labelKey,
    [sort],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value),
    [onSearchChange],
  );

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => onStatusChange(e.target.value),
    [onStatusChange],
  );

  const handleClearPost = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); onClearPost(); },
    [onClearPost],
  );

  return (
    <div className="mb-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" style={{ borderTop: "3px solid #E5E7EB" }}>
      <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-4">

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: `${TEAL}12` }}>
            <PeopleAltOutlined style={{ fontSize: 20, color: TEAL }} />
          </div>
          <div>
            <div className="font-extrabold text-[1.1rem] text-slate-900 leading-snug">
              {t("pages.applications.title")}
            </div>
            <div className="text-[12px] text-slate-400">
              {loading ? t("pages.common.loading") : t("pages.applications.candidate_count", { count: totalCount })}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Search */}
          <div
            className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 h-[34px] min-w-[220px] transition-colors focus-within:border-teal-500"
          >
            <SearchOutlined style={{ fontSize: 15, color: "#9CA3AF" }} />
            <input
              className="bg-transparent ml-2 text-[13px] flex-1 outline-none placeholder:text-slate-400"
              placeholder={t("pages.applications.search_placeholder")}
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={handleStatusChange}
            className="h-[34px] text-[13px] bg-slate-50 border border-slate-200 rounded-lg px-2 pr-6 outline-none focus:border-teal-500 transition-colors cursor-pointer appearance-none"
          >
            <option value="">{t("pages.applications.status.all")}</option>
            {STATUS_VALUES.map(({ value, i18nKey }) => (
              <option key={value} value={value}>{t(i18nKey)}</option>
            ))}
          </select>

          {/* Post picker */}
          <button
            onClick={onPostPickerOpen}
            className="flex items-center gap-1.5 h-[34px] px-3 rounded-lg border min-w-[130px] max-w-[200px] transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: postId ? `${TEAL}0D` : "#F9FAFB",
              borderColor: postId ? TEAL : "#E5E7EB",
            }}
          >
            <WorkOutlineOutlined style={{ fontSize: 14, color: postId ? TEAL : "#9CA3AF", flexShrink: 0 }} />
            <span
              className="text-[13px] flex-1 truncate text-left"
              style={{ color: postId ? TEAL : "#9CA3AF", fontWeight: postId ? 600 : 400 }}
            >
              {postId ? postTitle : t("pages.applications.all_jobs")}
            </span>
            {postId && (
              <span onClick={handleClearPost} className="shrink-0 hover:opacity-70 cursor-pointer">
                <CloseOutlined style={{ fontSize: 13, color: TEAL }} />
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 h-[34px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none hover:border-slate-300 transition-colors min-w-[120px]">
                <SortOutlined style={{ fontSize: 14, color: "#9CA3AF" }} />
                <span className="flex-1 text-left truncate">
                  {currentSortLabel ? t(currentSortLabel) : t("pages.common.sort")}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[200px] rounded-xl border border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.12)] p-1 mt-1"
            >
              {SORT_GROUPS.map((group, gi) => (
                <React.Fragment key={group.labelKey}>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: group.color }}
                  >
                    <group.Icon style={{ fontSize: 12 }} />
                    {t(group.labelKey)}
                  </div>
                  {group.options.map(({ value, labelKey }) => (
                    <DropdownMenuItem
                      key={value}
                      onClick={() => { onSortChange(value); setSortOpen(false); }}
                      className="mx-1 rounded-lg py-1.5 px-3 cursor-pointer"
                    >
                      <span
                        className="text-[13px]"
                        style={{ fontWeight: sort === value ? 700 : 400, color: sort === value ? group.color : "#374151" }}
                      >
                        {t(labelKey)}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  {gi < SORT_GROUPS.length - 1 && <DropdownMenuSeparator className="my-1 bg-slate-100" />}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-[22px] bg-slate-200 mx-0.5" />

          {/* Download */}
          <div title={totalCount === 0 ? t("pages.applications.no_candidates_download") : t("pages.applications.download_cvs_tooltip", { count: totalCount })}>
            <AppButton
              label={downloading ? t("pages.applications.preparing") : t("pages.applications.download_cvs")}
              variant="outlined"
              size="small"
              loading={downloading}
              disabled={totalCount === 0}
              startIcon={<FileDownloadOutlined style={{ fontSize: 15 }} />}
              onClick={onDownload}
              sx={{
                borderColor: `${TEAL}40`, color: TEAL, bgcolor: `${TEAL}08`,
                "&:hover": { bgcolor: `${TEAL}14`, borderColor: TEAL },
                borderRadius: "8px", height: 34,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

ApplicationsToolbar.displayName = "ApplicationsToolbar";
export default ApplicationsToolbar;
