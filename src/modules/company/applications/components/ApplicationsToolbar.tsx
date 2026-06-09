import React from "react";
import {
  Box, Typography, FormControl, Select, MenuItem,
  InputBase, Tooltip, Divider, ListSubheader,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import StarOutlineOutlined from "@mui/icons-material/StarOutlineOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SortByAlphaOutlined from "@mui/icons-material/SortByAlphaOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import AppButton from "@/components/ui/AppButton";
import { TEAL } from "./constants";

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

const selectSx = {
  height: 34, fontSize: "13px", bgcolor: "#F9FAFB",
  border: "1px solid #E5E7EB", borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
} as const;

// Hoisted outside the component — never recreated on re-render
const STATUS_VALUES = [
  { value: "visited",             i18nKey: "pages.applications.status.visited" },
  { value: "interview_completed", i18nKey: "pages.applications.status.interview_completed" },
] as const;

interface SortGroup {
  labelKey: string;
  Icon: React.ComponentType<{ sx?: object }>;
  color: string;
  options: { value: string; labelKey: string }[];
}

const SORT_GROUPS_STATIC: SortGroup[] = [
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

const ApplicationsToolbar: React.FC<Props> = ({
  searchInput, status, postId, postTitle, sort,
  loading, totalCount, downloading,
  onSearchChange, onStatusChange, onPostPickerOpen, onClearPost, onSortChange, onDownload,
}) => {
  const { t } = useTranslation("dashboard");

  const currentSortLabel = SORT_GROUPS_STATIC
    .flatMap((g) => g.options)
    .find((o) => o.value === sort)?.labelKey;

  return (
    <Box sx={{ mb: 3, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", borderTop: "3px solid #E5E7EB" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>

        {/* Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PeopleAltOutlined sx={{ fontSize: 20, color: TEAL }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1.2 }}>{t("pages.applications.title")}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
              {loading ? t("pages.common.loading") : t("pages.applications.candidate_count", { count: totalCount })}
            </Typography>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          {/* Search */}
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.25, height: 34, minWidth: 220, "&:focus-within": { borderColor: TEAL }, transition: "border-color 0.15s" }}>
            <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }} />
            <InputBase
              placeholder={t("pages.applications.search_placeholder")}
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ fontSize: "13px", flex: 1 }}
            />
          </Box>

          {/* Status filter */}
          <FormControl size="small">
            <Select value={status} onChange={(e) => onStatusChange(e.target.value)} displayEmpty sx={selectSx}>
              <MenuItem value=""><em style={{ color: "#9CA3AF", fontStyle: "normal" }}>{t("pages.applications.status.all")}</em></MenuItem>
              {STATUS_VALUES.map(({ value, i18nKey }) => (
                <MenuItem key={value} value={value} sx={{ fontSize: "13px" }}>{t(i18nKey)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Post picker trigger */}
          <Box
            onClick={onPostPickerOpen}
            sx={{
              display: "flex", alignItems: "center", gap: 0.75, height: 34, px: 1.25,
              bgcolor: postId ? `${TEAL}0D` : "#F9FAFB",
              border: `1px solid ${postId ? TEAL : "#E5E7EB"}`,
              borderRadius: "8px", cursor: "pointer", minWidth: 130, maxWidth: 200,
              transition: "all 0.15s", "&:hover": { borderColor: TEAL, bgcolor: `${TEAL}08` },
            }}
          >
            <WorkOutlineOutlined sx={{ fontSize: 14, color: postId ? TEAL : "#9CA3AF", flexShrink: 0 }} />
            <Typography noWrap sx={{ fontSize: "13px", color: postId ? TEAL : "#9CA3AF", flex: 1, fontWeight: postId ? 600 : 400 }}>
              {postId ? postTitle : t("pages.applications.all_jobs")}
            </Typography>
            {postId && (
              <CloseOutlined
                sx={{ fontSize: 13, color: TEAL, flexShrink: 0, "&:hover": { opacity: 0.7 } }}
                onClick={(e) => { e.stopPropagation(); onClearPost(); }}
              />
            )}
          </Box>

          {/* Sort */}
          <FormControl size="small">
            <Select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              startAdornment={<SortOutlined sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }} />}
              renderValue={() => (
                <Typography sx={{ fontSize: "13px", color: "#374151" }}>
                  {currentSortLabel ? t(currentSortLabel) : t("pages.common.sort")}
                </Typography>
              )}
              sx={selectSx}
              MenuProps={{ slotProps: { paper: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", mt: 0.5, minWidth: 200 } } } }}
            >
              {SORT_GROUPS_STATIC.flatMap((group, gi) => [
                <ListSubheader key={`h-${gi}`} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "10px", fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: "32px", bgcolor: "#fff", px: 1.5 }}>
                  <group.Icon sx={{ fontSize: 12 }} />{t(group.labelKey)}
                </ListSubheader>,
                ...group.options.map(({ value, labelKey }) => (
                  <MenuItem key={value} value={value} sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, "&:hover": { bgcolor: `${group.color}0D` }, "&.Mui-selected": { bgcolor: `${group.color}12` } }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: sort === value ? 700 : 400, color: sort === value ? group.color : "#374151" }}>{t(labelKey)}</Typography>
                  </MenuItem>
                )),
                gi < SORT_GROUPS_STATIC.length - 1 ? <Divider key={`d-${gi}`} sx={{ my: 0.5, borderColor: "#F3F4F6" }} /> : null,
              ])}
            </Select>
          </FormControl>

          <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.25 }} />

          {/* Download CVs */}
          <Tooltip title={totalCount === 0 ? t("pages.applications.no_candidates_download") : t("pages.applications.download_cvs_tooltip", { count: totalCount })}>
            <span>
              <AppButton
                label={downloading ? t("pages.applications.preparing") : t("pages.applications.download_cvs")}
                variant="outlined"
                size="small"
                loading={downloading}
                disabled={totalCount === 0}
                startIcon={<FileDownloadOutlined sx={{ fontSize: 15 }} />}
                onClick={onDownload}
                sx={{ borderColor: `${TEAL}40`, color: TEAL, bgcolor: `${TEAL}08`, "&:hover": { bgcolor: `${TEAL}14`, borderColor: TEAL }, borderRadius: "8px", height: 34 }}
              />
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default ApplicationsToolbar;
