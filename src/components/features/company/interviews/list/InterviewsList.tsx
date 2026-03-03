import React, { memo } from "react";
import { Box, Typography, InputAdornment, TextField, Skeleton, Chip, Menu, MenuItem } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import HowToRegOutlined from "@mui/icons-material/HowToRegOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import InterviewCard, { InterviewAssessment } from "./InterviewCard";

const PURPLE = "#8310FF";

export type ScoreFilter = "all" | "excellent" | "satisfactory" | "needs-work";
export type SortOption  = "newest" | "highest" | "lowest";

const SCORE_FILTERS: { id: ScoreFilter; label: string; color: string; bg: string }[] = [
  { id: "all",          label: "All",          color: "#374151", bg: "#F3F4F6" },
  { id: "excellent",    label: "Excellent",    color: "#10B981", bg: "#F0FDF4" },
  { id: "satisfactory", label: "Satisfactory", color: "#D97706", bg: "#FFFBEB" },
  { id: "needs-work",   label: "Needs Work",   color: "#EF4444", bg: "#FEF2F2" },
];

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: "newest",  label: "Newest first"     },
  { id: "highest", label: "Highest score"    },
  { id: "lowest",  label: "Lowest score"     },
];

interface InterviewsListProps {
  assessments: InterviewAssessment[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  scoreFilter: ScoreFilter;
  onScoreFilterChange: (f: ScoreFilter) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onSelect: (assessment: InterviewAssessment) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

const GRID = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: 1.5,
};

const InterviewSkeletonCard: React.FC = () => (
  <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton variant="circular" width={42} height={42} />
        <Box>
          <Skeleton variant="text" width={130} height={18} />
          <Skeleton variant="text" width={100} height={13} />
        </Box>
      </Box>
      <Skeleton variant="rounded" width={44} height={28} sx={{ borderRadius: 2 }} />
    </Box>
    <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: 3 }} />
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: 1.5 }} />
      <Skeleton variant="text" width={120} height={14} />
    </Box>
    <Box sx={{ pt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
      <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "6px" }} />
      <Skeleton variant="text" width={80} height={13} />
    </Box>
  </Box>
);

const SortButton: React.FC<{ sortBy: SortOption; onChange: (s: SortOption) => void }> = ({ sortBy, onChange }) => {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const current = SORT_OPTIONS.find((o) => o.id === sortBy)!;

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          px: 1.5, py: 0.75, borderRadius: 2, cursor: "pointer",
          border: "1px solid #E5E7EB", bgcolor: "#fff",
          "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
          transition: "all 0.15s",
          userSelect: "none",
        }}
      >
        <SortOutlined sx={{ fontSize: 16, color: "#6B7280" }} />
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{current.label}</Typography>
        <KeyboardArrowDownOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB", minWidth: 160 } }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem
            key={o.id}
            selected={o.id === sortBy}
            onClick={() => { onChange(o.id); setAnchor(null); }}
            sx={{ fontSize: "13px", fontWeight: o.id === sortBy ? 700 : 500, color: o.id === sortBy ? PURPLE : "#374151" }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const InterviewsList: React.FC<InterviewsListProps> = memo(({
  assessments, loading, search, onSearchChange,
  scoreFilter, onScoreFilterChange, sortBy, onSortChange,
  onSelect, hasMore, onLoadMore,
}) => (
  <Box>
    {/* Toolbar: search + filters + sort */}
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
      <TextField
        size="small"
        placeholder="Search by candidate name, email or job title…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined sx={{ fontSize: 18, color: "#9CA3AF" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flexGrow: 1, maxWidth: 380,
          "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: "14px", bgcolor: "#fff" },
        }}
      />

      {/* Score filter chips */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <FilterListOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />
        {SCORE_FILTERS.map((f) => {
          const active = scoreFilter === f.id;
          return (
            <Chip
              key={f.id}
              label={f.label}
              size="small"
              onClick={() => onScoreFilterChange(f.id)}
              sx={{
                fontWeight: 600, fontSize: "12px", height: 28, cursor: "pointer",
                bgcolor: active ? f.bg : "#F9FAFB",
                color: active ? f.color : "#6B7280",
                border: active ? `1px solid ${f.color}40` : "1px solid #E5E7EB",
                "&:hover": { bgcolor: f.bg, color: f.color },
                transition: "all 0.15s",
              }}
            />
          );
        })}
      </Box>

      <SortButton sortBy={sortBy} onChange={onSortChange} />
    </Box>

    {/* Grid / States — white container */}
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3 }}>
      {loading ? (
        <Box sx={GRID}>
          {Array.from({ length: 6 }).map((_, i) => <InterviewSkeletonCard key={i} />)}
        </Box>
      ) : assessments.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <HowToRegOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
            {search ? "No results match your search" : "No interviews yet"}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
            {search
              ? "Try different keywords or clear the search."
              : "Candidate interview results will appear here once completed."}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={GRID}>
            {assessments.map((a, i) => (
              <InterviewCard key={a._id} assessment={a} index={i} onClick={onSelect} />
            ))}
          </Box>

          {hasMore && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Box
                onClick={onLoadMore}
                sx={{
                  px: 3, py: 1, borderRadius: "10px", cursor: "pointer",
                  border: `1px solid ${PURPLE}30`, color: PURPLE,
                  fontWeight: 600, fontSize: "13px",
                  "&:hover": { bgcolor: `${PURPLE}08` },
                  transition: "all 0.15s",
                }}
              >
                Load more
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  </Box>
));

InterviewsList.displayName = "InterviewsList";

export default InterviewsList;
