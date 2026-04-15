import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { AppDispatch } from "@/store/store";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
  selectMyPostsError,
  selectMyPostsPagination,
} from "@/store/slices/postSlice";
import { useToast } from "@/hooks/useToast";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import WorkplaceJobDetail from "@/components/features/company/posts/details/WorkplaceJobDetail";
import JobPostsList, { StatusFilter, SortOption } from "@/components/features/company/posts/list/JobPostsList";
import PostsStats from "@/components/features/company/posts/list/Stats";
import AddOutlined from "@mui/icons-material/AddOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";

const TEAL = "#0D9488";

const PostsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const { showToast } = useToast();

  const posts      = useSelector(selectMyPosts);
  const loading    = useSelector(selectMyPostsLoading);
  const error      = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy]             = useState<SortOption>("newest");
  const [search, setSearch]             = useState("");
  const [page, setPage]                 = useState(1);
  const [jobToDelete, setJobToDelete]   = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const deletePostHook = useDeletePost({
    postId: jobToDelete!,
    refetchAfterDelete: true,
    onSuccess: () => {
      showToast({ message: "Post deleted successfully", severity: "success" });
      setJobToDelete(null);
    },
    onError: () => showToast({ message: "Failed to delete post", severity: "error" }),
  });

  const apiStatus = statusFilter === "all"     ? undefined
    : statusFilter === "active"  ? "open"
    : statusFilter === "draft"   ? "draft"
    : statusFilter === "expired" ? "closed"
    : undefined;

  const apiSort = sortBy === "title-asc"  ? "title_asc"
    : sortBy === "title-desc" ? "title_desc"
    : sortBy;

  const load = useCallback(() => {
    dispatch(fetchMyPosts({ page, limit: 8, search, sort: apiSort, status: apiStatus }));
  }, [dispatch, page, search, apiSort, apiStatus]);

  useEffect(() => { load(); }, [load]);

  const filteredPosts = posts as any[];
  const totalCount    = (pagination as any)?.total ?? filteredPosts.length;

  const handleDelete = (id: string) => {
    setJobToDelete(id);
    deletePostHook.handleOpen();
  };

  const handleCreateClick = () => router.push("/company/posts/create");

  return (
    <DashboardLayout>
      {selectedJobId ? (
        <WorkplaceJobDetail
          jobId={selectedJobId}
          onBack={() => { setSelectedJobId(null); load(); }}
        />
      ) : (
        <Box>
          {/* ── Header card ── */}
          <Box sx={{
            mb: 3, bgcolor: "#fff", border: "1px solid #E5E7EB", borderTop: "3px solid #E5E7EB",
            borderRadius: "16px", overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <Box sx={{ px: 3, pt: 2.5, pb: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${TEAL}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <WorkOutlineOutlined sx={{ fontSize: 20, color: TEAL }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827", lineHeight: 1.2 }}>
                    Job Posts
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {loading ? "Loading…" : `${totalCount} post${totalCount !== 1 ? "s" : ""}`}
                  </Typography>
                </Box>
              </Box>

              {/* New Job Post button */}
              <Box
                component="button"
                onClick={handleCreateClick}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.75,
                  height: 36, px: 1.75, border: "none", borderRadius: "10px",
                  cursor: "pointer", outline: "none",
                  background: `linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)`,
                  boxShadow: `0 2px 8px ${TEAL}40`,
                  color: "#fff",
                  transition: "all 0.15s",
                  "&:hover": { opacity: 0.9, boxShadow: `0 4px 14px ${TEAL}50` },
                }}
              >
                <AddOutlined sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                  New Job Post
                </Typography>
              </Box>
            </Box>
          </Box>

          <PostsStats />

          <JobPostsList
            jobs={filteredPosts}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            statusFilter={statusFilter}
            onStatusFilterChange={(f) => { setStatusFilter(f); setPage(1); }}
            sortBy={sortBy}
            onSortChange={(s) => { setSortBy(s); setPage(1); }}
            page={page}
            pagination={pagination}
            onPageChange={setPage}
            onDelete={handleDelete}
            onViewDetails={(id) => router.push(`/company/posts/${id}`)}
            onCreateClick={handleCreateClick}
          />

          <DeletePostModal
            open={deletePostHook.open}
            onClose={() => { deletePostHook.handleClose(); setJobToDelete(null); }}
            onDelete={deletePostHook.handleDelete}
            isDeleting={deletePostHook.isDeleting}
          />
        </Box>
      )}
    </DashboardLayout>
  );
};

export default PostsPage;
