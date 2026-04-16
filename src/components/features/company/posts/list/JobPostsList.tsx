import { memo } from "react";
import {
  Box,
  Typography,
  Skeleton,
  Pagination,
  Button,
} from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";
import JobPostCard from "./JobPostCard";

const TEAL = "#0D9488";

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
  hasFilters: boolean;
  page: number;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  onCreateClick: () => void;
  canCreate?: boolean;
  canDelete?: boolean;
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

/* ── Main component ────────────────────────────────────────── */
const JobPostsList = memo<JobPostsListProps>(({
  jobs,
  loading,
  error,
  hasFilters,
  page,
  pagination,
  onPageChange,
  onDelete,
  onViewDetails,
  onCreateClick,
  canCreate = true,
  canDelete = true,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: { xs: 1.5, md: 2 } }}>
        {Array.from({ length: 6 }).map((_, i) => <JobPostSkeletonCard key={i} />)}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, borderRadius: "10px", bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px" }}>
        {error}
      </Box>
    );
  }

  if (jobs.length === 0) {
    return (
      <Box sx={{ py: 12, textAlign: "center", border: "1.5px dashed #E5E7EB", borderRadius: "12px", bgcolor: "#FAFAFA" }}>
        <WorkOutlined sx={{ fontSize: 44, color: "#D1D5DB", mb: 1.5 }} />
        <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151", mb: 0.5 }}>
          {hasFilters ? "No posts match your filters" : "No job posts yet"}
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mb: hasFilters ? 0 : 2 }}>
          {hasFilters
            ? "Try different keywords or clear the filters."
            : "Create your first job post to start attracting candidates."}
        </Typography>
        {!hasFilters && (
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
    );
  }

  return (
    <Box>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
        gap: { xs: 2, md: 2.5 },
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
    </Box>
  );
});

JobPostsList.displayName = "JobPostsList";

export default JobPostsList;
