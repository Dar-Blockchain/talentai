import { memo } from "react";
import {
  Box,
  Typography,
  InputBase,
  Skeleton,
  Divider,
  FormControl,
  Select,
  MenuItem,
  ListSubheader,
  Pagination,
  Button,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import SortOutlined from "@mui/icons-material/SortOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import SortByAlphaOutlined from "@mui/icons-material/SortByAlphaOutlined";
import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutline";
import JobPostCard from "./JobPostCard";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";

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
  onViewDetails: (id: string) => void;
  onCreateClick: () => void;
}

/* ── Skeleton card ─────────────────────────────────────────── */
const JobPostSkeletonCard: React.FC = () => (
  <Box sx={{
    bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px",
    overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  }}>
    <Skeleton variant="rectangular" height={3} sx={{ bgcolor: "#F3F4F6" }} />
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: "10px", flexShrink: 0 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
          <Box sx={{ display: "flex", gap: 0.75 }}>
            <Skeleton variant="rounded" width={76} height={18} sx={{ borderRadius: "4px" }} />
            <Skeleton variant="rounded" width={52} height={18} sx={{ borderRadius: "4px" }} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Skeleton variant="rounded" width={90} height={14} sx={{ borderRadius: "4px" }} />
        <Skeleton variant="rounded" width={70} height={14} sx={{ borderRadius: "4px" }} />
      </Box>
      <Box>
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="75%" />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
        <Skeleton variant="rounded" width={80} height={14} sx={{ borderRadius: "4px" }} />
        <Skeleton variant="rounded" width={70} height={14} sx={{ borderRadius: "4px" }} />
      </Box>
    </Box>
  </Box>
);

/* ── Constants ─────────────────────────────────────────────── */
const STATUS_OPTIONS: { value: StatusFilter; label: string; color: string }[] = [
  { value: "all",     label: "All statuses", color: "#6B7280" },
  { value: "active",  label: "Open",         color: "#059669" },
  { value: "draft",   label: "Draft",        color: "#D97706" },
  { value: "expired", label: "Closed",       color: "#DC2626" },
];

const SORT_GROUPS = [
  {
    label: "Date", Icon: CalendarTodayOutlined, color: "#6B7280",
    options: [
      { value: "newest" as SortOption, label: "Most recent first" },
      { value: "oldest" as SortOption, label: "Earliest first"    },
    ],
  },
  {
    label: "Title", Icon: SortByAlphaOutlined, color: "#0891B2",
    options: [
      { value: "title-asc"  as SortOption, label: "A to Z" },
      { value: "title-desc" as SortOption, label: "Z to A" },
    ],
  },
];
const SORT_OPTIONS_FLAT = SORT_GROUPS.flatMap((g) => g.options);

const selectSx = {
  height: 34, fontSize: "13px", bgcolor: "#F9FAFB",
  border: "1px solid #E5E7EB", borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
};

/* ── Main component ────────────────────────────────────────── */
const JobPostsList = memo<JobPostsListProps>(({
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
  onViewDetails,
  onCreateClick,
}) => {
  return (
    <Box>
      {/* ── Toolbar ── */}
      <Box sx={{
        mb: 2, bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px",
        px: 2.5, py: 1.75, display: "flex", alignItems: "center",
        gap: 1, flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Search */}
        <Box sx={{
          display: "flex", alignItems: "center", bgcolor: "#F9FAFB",
          border: "1px solid #E5E7EB", borderRadius: "8px",
          px: 1.25, height: 34, flex: 1, minWidth: 180,
          "&:focus-within": { borderColor: TEAL }, transition: "border-color 0.15s",
        }}>
          <SearchOutlined sx={{ fontSize: 15, color: "#9CA3AF", mr: 0.75 }} />
          <InputBase
            placeholder="Search by title, type…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{ fontSize: "13px", flex: 1 }}
          />
        </Box>

        {/* Status */}
        <FormControl size="small">
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            displayEmpty
            startAdornment={<CheckCircleOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }} />}
            renderValue={(val) => {
              const opt = STATUS_OPTIONS.find((o) => o.value === val);
              return (
                <Typography sx={{ fontSize: "13px", color: val === "all" ? "#9CA3AF" : opt?.color ?? "#374151" }}>
                  {opt?.label ?? "All statuses"}
                </Typography>
              );
            }}
            sx={selectSx}
            MenuProps={{ PaperProps: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", mt: 0.5, minWidth: 160 } } }}
          >
            {STATUS_OPTIONS.map(({ value, label, color }) => (
              <MenuItem
                key={value}
                value={value}
                sx={{
                  mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, fontSize: "13px",
                  "&:hover": { bgcolor: `${color}0D` },
                  "&.Mui-selected": { bgcolor: `${color}12`, "&:hover": { bgcolor: `${color}1A` } },
                }}
              >
                <Typography sx={{ fontSize: "13px", fontWeight: statusFilter === value ? 700 : 400, color: statusFilter === value ? color : "#374151" }}>
                  {label}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort */}
        <FormControl size="small">
          <Select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            startAdornment={<SortOutlined sx={{ fontSize: 14, color: "#9CA3AF", mr: 0.5 }} />}
            renderValue={(val) => {
              const opt = SORT_OPTIONS_FLAT.find((o) => o.value === val);
              return <Typography sx={{ fontSize: "13px", color: "#374151" }}>{opt?.label ?? "Sort"}</Typography>;
            }}
            sx={selectSx}
            MenuProps={{ PaperProps: { sx: { borderRadius: "12px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", border: "1px solid #E5E7EB", mt: 0.5, minWidth: 190 } } }}
          >
            {SORT_GROUPS.flatMap((group, gi) => [
              <ListSubheader key={`h-${gi}`} sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "10px", fontWeight: 700, color: group.color, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: "32px", bgcolor: "#fff", px: 1.5 }}>
                <group.Icon sx={{ fontSize: 12 }} />{group.label}
              </ListSubheader>,
              ...group.options.map(({ value, label }) => (
                <MenuItem
                  key={value}
                  value={value}
                  sx={{ mx: 0.5, borderRadius: "8px", py: 0.75, px: 1.5, "&:hover": { bgcolor: `${group.color}0D` }, "&.Mui-selected": { bgcolor: `${group.color}12`, "&:hover": { bgcolor: `${group.color}1A` } } }}
                >
                  <Typography sx={{ fontSize: "13px", fontWeight: sortBy === value ? 700 : 400, color: sortBy === value ? group.color : "#374151" }}>
                    {label}
                  </Typography>
                </MenuItem>
              )),
              gi < SORT_GROUPS.length - 1 ? <Divider key={`d-${gi}`} sx={{ my: 0.5, borderColor: "#F3F4F6" }} /> : null,
            ])}
          </Select>
        </FormControl>
      </Box>

      {/* ── Cards container ── */}
      <Box sx={{
        bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "14px",
        p: { xs: 1.5, sm: 2, md: 2.5 }, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {loading ? (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 1.5, md: 2 } }}>
            {Array.from({ length: 6 }).map((_, i) => <JobPostSkeletonCard key={i} />)}
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, borderRadius: "10px", bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px" }}>
            {error}
          </Box>
        ) : jobs.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 2 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: TEAL_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WorkOutlined sx={{ fontSize: 28, color: TEAL }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>
              {search || statusFilter !== "all" ? "No posts match your filters" : "No job posts yet"}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
              {search || statusFilter !== "all"
                ? "Try different keywords or clear the filters."
                : "Create your first job post to start attracting candidates."}
            </Typography>
            {!search && statusFilter === "all" && (
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={onCreateClick}
                sx={{ textTransform: "none", fontWeight: 700, color: "#fff", bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" }, borderRadius: "10px" }}
              >
                Create Job Post
              </Button>
            )}
          </Box>
        ) : (
          <>
            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 1.5, md: 2 },
              mb: pagination.totalPages > 1 ? 3 : 0,
            }}>
              {jobs.map((job: any, i: number) => (
                <JobPostCard key={job._id} job={job} index={i} onDelete={onDelete} onViewDetails={onViewDetails} />
              ))}
            </Box>

            {pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={(_, v) => onPageChange(v)}
                  shape="rounded"
                  size="small"
                  sx={{
                    "& .MuiPaginationItem-root": { fontWeight: 500 },
                    "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 },
                    "& .MuiPaginationItem-root:hover": { bgcolor: "#F3F4F6" },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
});

JobPostsList.displayName = "JobPostsList";

export default JobPostsList;
