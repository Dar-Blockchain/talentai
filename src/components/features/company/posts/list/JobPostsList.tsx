import React from "react";
import { Box, Button, Pagination } from "@mui/material";
import SectionCard from "@/components/dashboard-workplace/ui/SectionCard";
import SectionHeader from "@/components/dashboard-workplace/ui/SectionHeader";
import LoadingOverlay from "@/components/dashboard-workplace/ui/LoadingOverlay";
import EmptyState from "@/components/dashboard-workplace/ui/EmptyState";
import JobPostCard from "./JobPostCard";
import JobPostsFilters from "./JobPostsFilters";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";

const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";

type TabType = "all" | "active" | "draft" | "expired";

interface TabItem {
  id: string;
  label: string;
  count: number;
}

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
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabItems: TabItem[];
  page: number;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onCopyLink: (id: string) => void;
  onViewPassed: (id: string) => void;
  onViewDetails: (id: string) => void;
  onCreateClick: () => void;
}

const JobPostsList: React.FC<JobPostsListProps> = ({
  jobs,
  loading,
  error,
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  tabItems,
  page,
  pagination,
  onPageChange,
  onDelete,
  onCopyLink,
  onViewPassed,
  onViewDetails,
  onCreateClick,
}) => {
  const body = () => {
    if (loading) {
      return <LoadingOverlay height={300} message="Loading job posts…" color={TEAL} />;
    }
    if (error) {
      return (
        <Box sx={{ p: 3, borderRadius: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px" }}>
          {error}
        </Box>
      );
    }
    if (jobs.length === 0) {
      return (
        <EmptyState
          icon={<WorkOutlined />}
          title={search ? "No posts match your search" : "No job posts yet"}
          description={
            search
              ? "Try different keywords or clear the search."
              : "Create your first job post to start attracting candidates."
          }
          minHeight={220}
          action={
            !search ? (
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={onCreateClick}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: TEAL, "&:hover": { bgcolor: "#0F766E" }, borderRadius: 2 }}
              >
                Create Job Post
              </Button>
            ) : undefined
          }
        />
      );
    }
    return (
      <>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          {jobs.map((job: any) => (
            <JobPostCard
              key={job._id}
              job={job}
              onDelete={onDelete}
              onCopyLink={onCopyLink}
              onViewPassed={onViewPassed}
              onViewDetails={onViewDetails}
            />

          ))}
        </Box>
        {pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, v) => onPageChange(v)}
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: 500,
                  "&.Mui-selected": { bgcolor: TEAL_BG, color: TEAL, fontWeight: 700 },
                  "&:hover": { bgcolor: "#F3F4F6" },
                },
              }}
            />
          </Box>
        )}
      </>
    );
  };

  return (
    <SectionCard>
      <SectionHeader
        title="My Job Posts"
        subtitle={pagination.total != null ? `${pagination.total} post${pagination.total !== 1 ? "s" : ""} total` : `${jobs.length} post${jobs.length !== 1 ? "s" : ""} shown`}
      />
      <JobPostsFilters
        search={search}
        onSearchChange={onSearchChange}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabItems={tabItems}
      />
      {body()}
    </SectionCard>
  );
};

export default JobPostsList;
