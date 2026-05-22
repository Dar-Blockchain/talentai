import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputBase, ListSubheader, Divider, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import AddOutlined from "@mui/icons-material/AddOutlined";
import AppButton from "@/components/ui/AppButton";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import SortByAlphaOutlined from "@mui/icons-material/SortByAlphaOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import type { StatusFilter, SortOption } from "./JobPostsList";
import type { TypeFilter } from "../types";

const TEAL = "#0D9488";

const selectSx = {
  height: 34, fontSize: "13px", bgcolor: "#F9FAFB",
  border: "1px solid #E5E7EB", borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
};

const MENU_PAPER_SX = {
  borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
  border: "1px solid #E5E7EB", mt: 0.5,
};

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
  { value: "all",      label_key: "type.all",      color: "#6B7280", bg: "#F3F4F6", Icon: FilterListOutlined },
  { value: "ai",       label_key: "type.ai",       color: "#7C3AED", bg: "#F5F3FF", Icon: AutoAwesomeOutlined },
  { value: "pipeline", label_key: "type.pipeline", color: "#0891B2", bg: "#ECFEFF", Icon: AccountTreeOutlined },
  { value: "manual",   label_key: "type.manual",   color: "#D97706", bg: "#FFFBEB", Icon: EditNoteOutlined },
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

  return (
    <Box sx={{ mb: 3, bgcolor: "#fff", border: "1px solid #E5E7EB", borderTop: "3px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <Box sx={{ px: 3, pt: 2.5, pb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>

        {/* Title + count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WorkOutlineOutlined sx={{ fontSize: 20, color: TEAL }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1.2 }}>{t("title")}</Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
              {loading ? td("pages.common.loading") : t("count", { count: totalCount })}
            </Typography>
          </Box>
        </Box>

        {/* Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>

          {/* Search */}
          <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.25, height: 34, width: { xs: "100%", sm: 220, md: 300, lg: 380 }, "&:focus-within": { borderColor: TEAL }, transition: "border-color 0.15s" }}>
            <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }} />
            <InputBase placeholder={t("search_placeholder")} value={search} onChange={(e) => onSearchChange(e.target.value)} sx={{ fontSize: "13px", flex: 1 }} />
          </Box>

          {/* Status filter */}
          <FormControl size="small">
            <Select value={statusFilter} onChange={(e) => onStatusChange(e.target.value as StatusFilter)} displayEmpty
              startAdornment={<CheckCircleOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }} />}
              renderValue={(val) => {
                const opt = statusOpts.find((o) => o.value === val);
                return <Typography sx={{ fontSize: "13px", color: val === "all" ? "#9CA3AF" : (opt?.color ?? "#374151") }}>{opt?.label ?? t("status.all")}</Typography>;
              }}
              sx={selectSx}
              MenuProps={{ PaperProps: { sx: { ...MENU_PAPER_SX, minWidth: 160 } } }}
            >
              {statusOpts.map(({ value, label, color }) => (
                <MenuItem key={value} value={value} sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, "&:hover": { bgcolor: `${color}0D` }, "&.Mui-selected": { bgcolor: `${color}12`, "&:hover": { bgcolor: `${color}1A` } } }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: statusFilter === value ? 700 : 400, color: statusFilter === value ? color : "#374151" }}>{label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Type filter */}
          <FormControl size="small">
            <Select value={typeFilter} onChange={(e) => onTypeChange(e.target.value as TypeFilter)} displayEmpty
              renderValue={(val) => {
                const opt  = typeOpts.find((o) => o.value === val);
                const Icon = opt?.Icon ?? FilterListOutlined;
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Icon sx={{ fontSize: 14, color: val === "all" ? "#9CA3AF" : opt?.color }} />
                    <Typography sx={{ fontSize: "13px", color: val === "all" ? "#9CA3AF" : opt?.color }}>{opt?.label ?? t("type.all")}</Typography>
                  </Box>
                );
              }}
              sx={selectSx}
              MenuProps={{ PaperProps: { sx: { ...MENU_PAPER_SX, minWidth: 160 } } }}
            >
              {typeOpts.map(({ value, label, color, bg, Icon }) => (
                <MenuItem key={value} value={value} sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.25, gap: 1, "&:hover": { bgcolor: `${color}0D` }, "&.Mui-selected": { bgcolor: `${color}12`, "&:hover": { bgcolor: `${color}1A` } } }}>
                  {value !== "all" && (
                    <Box sx={{ width: 20, height: 20, borderRadius: "5px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon sx={{ fontSize: 11, color }} />
                    </Box>
                  )}
                  <Typography sx={{ fontSize: "13px", fontWeight: typeFilter === value ? 700 : 400, color: typeFilter === value ? color : "#374151" }}>{label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sort */}
          <FormControl size="small">
            <Select value={sortBy} onChange={(e) => onSortChange(e.target.value as SortOption)}
              startAdornment={<SortOutlined sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }} />}
              renderValue={(val) => {
                const opt = sortFlat.find((o) => o.value === val);
                return <Typography sx={{ fontSize: "13px", color: "#374151" }}>{opt?.label ?? td("pages.common.sort")}</Typography>;
              }}
              sx={selectSx}
              MenuProps={{ PaperProps: { sx: { ...MENU_PAPER_SX, minWidth: 190 } } }}
            >
              {sortGroups.flatMap((group, gi) => [
                <ListSubheader key={`h-${gi}`} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "10px", fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: "32px", bgcolor: "#fff", px: 1.5 }}>
                  <group.Icon sx={{ fontSize: 12 }} />{group.label}
                </ListSubheader>,
                ...group.options.map(({ value, label }) => (
                  <MenuItem key={value} value={value} sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, "&:hover": { bgcolor: `${group.color}0D` }, "&.Mui-selected": { bgcolor: `${group.color}12`, "&:hover": { bgcolor: `${group.color}1A` } } }}>
                    <Typography sx={{ fontSize: "13px", fontWeight: sortBy === value ? 700 : 400, color: sortBy === value ? group.color : "#374151" }}>{label}</Typography>
                  </MenuItem>
                )),
                gi < sortGroups.length - 1 ? <Divider key={`d-${gi}`} sx={{ my: 0.5, borderColor: "#F3F4F6" }} /> : null,
              ])}
            </Select>
          </FormControl>

          <Box sx={{ width: "1px", height: 22, bgcolor: "#E5E7EB", mx: 0.25 }} />

          {/* New post button */}
          <Tooltip title={postsAtLimit ? t("limit_tooltip", { used: postsUsed, limit: postsLimit }) : ""} arrow disableHoverListener={!postsAtLimit}>
            <span>
              <AppButton
                label={postsAtLimit ? t("limit_reached", { used: postsUsed, limit: postsLimit }) : t("new_post")}
                variant="contained"
                disabled={postsAtLimit}
                startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
                onClick={onCreateClick}
                size="small"
                sx={{
                  borderRadius: "10px", height: 36,
                  background: `linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)`,
                  boxShadow: `0 2px 8px ${TEAL}40`,
                  "&:hover": { opacity: 0.9, boxShadow: `0 4px 14px ${TEAL}50`, background: `linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)` },
                }}
              />
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default PostsToolbar;
