import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Menu,
  MenuItem,
  Pagination,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import { Button } from "@mui/material";
import JobPostCard from "./JobPostCard";

const TEAL      = "#0D9488";
const TEAL_BG   = "#F0FDFA";

export type StatusFilter = "all" | "active" | "draft" | "expired";
export type SortOption   = "newest" | "oldest" | "title-asc" | "title-desc";

interface PaginationInfo {
  totalPages: number;
  total?: number;
}

interface JobPostsListProps {
  jobs: any[];
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  page: number;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onCopyLink: (id: string) => void;
  onViewPassed: (id: string) => void;
  onViewDetails: (id: string) => void;
  onCreateClick: () => void;
}

/* ── Skeleton card ─────────────────────────────────────────── */
const JobPostSkeletonCard: React.FC = () => (
  <Box
    sx={{
      bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3,
      display: "flex", flexDirection: "column", gap: 2, height: "100%",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
      <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 2, flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="65%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="rounded" width={80} height={18} sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="100%" />
      <Skeleton variant="text" width="80%" />
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
      <Skeleton variant="rounded" width={60} height={18} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" width={80} height={18} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
);

/* ── Sort button ───────────────────────────────────────────── */
const STATUS_FILTERS: { id: StatusFilter; label: string; color: string; bg: string }[] = [
  { id: "all",     label: "All",    color: "#374151", bg: "#F3F4F6" },
  { id: "active",  label: "Open",   color: "#059669", bg: "#ECFDF5" },
  { id: "draft",   label: "Draft",  color: "#D97706", bg: "#FFFBEB" },
  { id: "expired", label: "Closed", color: "#DC2626", bg: "#FEF2F2" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest first"  },
  { value: "oldest",     label: "Oldest first"  },
  { value: "title-asc",  label: "Title A → Z"   },
  { value: "title-desc", label: "Title Z → A"   },
];

const SortButton: React.FC<{ value: SortOption; onChange: (v: SortOption) => void }> = ({ value, onChange }) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Sort";

  return (
    <>
      <Box
        component="button"
        onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        sx={{
          display: "flex", alignItems: "center", gap: 0.75,
          px: 1.5, py: 0.75, border: "1px solid #E5E7EB",
          borderRadius: 2, bgcolor: "#fff", cursor: "pointer",
          fontSize: "13px", fontWeight: 500, color: "#374151",
          "&:hover": { bgcolor: "#F9FAFB" }, whiteSpace: "nowrap",
        }}
      >
        <SortOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />
        {label}
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 160, mt: 0.5 } }}
      >
        {SORT_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            selected={o.value === value}
            onClick={() => { onChange(o.value); setAnchor(null); }}
            sx={{ fontSize: "13px", fontWeight: o.value === value ? 600 : 400, color: o.value === value ? TEAL : "#374151" }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/* ── Main component ────────────────────────────────────────── */
const JobPostsList: React.FC<JobPostsListProps> = ({
  jobs,
  loading,
  error,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  page,
  pagination,
  onPageChange,
  onDelete,
  onCopyLink,
  onViewPassed,
  onViewDetails,
  onCreateClick,
}) => {
  return (
    <Box>
      {/* ── Toolbar ── */}
      <Box
        sx={{
          display: "flex", alignItems: "center", gap: 1.5,
          flexWrap: "wrap", mb: 2,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by title, type…"
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
            maxWidth: 380, flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2, bgcolor: "#fff",
              "&.Mui-focused fieldset": { borderColor: TEAL },
            },
          }}
        />

        {/* Filter icon */}
        <FilterListOutlined sx={{ fontSize: 20, color: "#9CA3AF", flexShrink: 0 }} />

        {/* Status filter chips */}
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.id;
          return (
            <Chip
              key={f.id}
              label={f.label}
              size="small"
              onClick={() => onStatusFilterChange(f.id)}
              sx={{
                fontWeight: 600, fontSize: "12px", cursor: "pointer",
                bgcolor:     active ? f.bg    : "#F3F4F6",
                color:       active ? f.color : "#6B7280",
                border:      active ? `1px solid ${f.color}40` : "1px solid transparent",
                "&:hover":   { bgcolor: f.bg, color: f.color },
              }}
            />
          );
        })}

        <Box sx={{ ml: "auto", flexShrink: 0 }}>
          <SortButton value={sortBy} onChange={onSortChange} />
        </Box>
      </Box>

      {/* ── White container ── */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          p: 3,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => <JobPostSkeletonCard key={i} />)}
          </Box>
        ) : error ? (
          <Box
            sx={{
              p: 3, borderRadius: 2, bgcolor: "#FEF2F2",
              border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px",
            }}
          >
            {error}
          </Box>
        ) : jobs.length === 0 ? (
          <Box
            sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", py: 8, gap: 2,
            }}
          >
            <Box
              sx={{
                width: 56, height: 56, borderRadius: "50%",
                bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <WorkOutlined sx={{ fontSize: 28, color: TEAL }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
              {search ? "No posts match your search" : "No job posts yet"}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
              {search
                ? "Try different keywords or clear the search."
                : "Create your first job post to start attracting candidates."}
            </Typography>
            {!search && (
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={onCreateClick}
                sx={{
                  textTransform: "none", fontWeight: 700,
                  bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" }, borderRadius: 2,
                }}
              >
                Create Job Post
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" },
                gap: 2,
                mb: pagination.totalPages > 1 ? 3 : 0,
              }}
            >
              {jobs.map((job: any, i: number) => (
                <JobPostCard
                  key={job._id}
                  job={job}
                  index={i}
                  onDelete={onDelete}
                  onCopyLink={onCopyLink}
                  onViewPassed={onViewPassed}
                  onViewDetails={onViewDetails}
                />
              ))}
            </Box>

            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={(_, v) => onPageChange(v)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 500,
                      "&.Mui-selected": { bgcolor: TEAL_BG, color: TEAL, fontWeight: 700 },
                      "&:hover":        { bgcolor: "#F3F4F6" },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default JobPostsList;
