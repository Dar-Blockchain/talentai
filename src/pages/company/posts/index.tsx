import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
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
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import AddOutlined from "@mui/icons-material/AddOutlined";
import PostsStats from "@/components/features/company/posts/list/Stats";


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

  // Map UI filter → API status param
  const apiStatus = statusFilter === "all"     ? undefined
    : statusFilter === "active"  ? "open"
    : statusFilter === "draft"   ? "draft"
    : statusFilter === "expired" ? "closed"
    : undefined;

  // Map UI sort → API sort param (UI uses dash, API uses underscore)
  const apiSort = sortBy === "title-asc"  ? "title_asc"
    : sortBy === "title-desc" ? "title_desc"
    : sortBy; // "newest" | "oldest" pass through

  const load = useCallback(() => {
    dispatch(fetchMyPosts({ page, limit: 8, search, sort: apiSort, status: apiStatus }));
  }, [dispatch, page, search, apiSort, apiStatus]);

  useEffect(() => { load(); }, [load]);

  // API handles all filtering + sorting server-side
  const filteredPosts = posts as any[];

  const handleCopyLink = (id: string, companyId?: string) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/interview/hr?jobId=${id}&companyId=${companyId}&ref=link`)
      .then(() => showToast({ message: "Interview link copied!", severity: "success" }))
      .catch(() => showToast({ message: "Failed to copy link", severity: "error" }));
  };

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
            <PageHeader
              title="Job Posts"
              subtitle="Manage your open positions, track candidates, and share interview links."
              breadcrumbs={[
                { label: "Dashboard", href: "/company/dashboard" },
                { label: "Job Posts" },
              ]}
              actions={[
                <AppButton
                  key="new"
                  label="New Job Post"
                  variant="contained"
                  startIcon={<AddOutlined />}
                  size="medium"
                  onClick={handleCreateClick}
                />,
              ]}
            />

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
              onCopyLink={handleCopyLink}
              onViewPassed={(id) => router.push(`/posts/${id}?tab=passed`)}
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
