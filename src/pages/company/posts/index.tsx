import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    : "closed";

  const load = useCallback(() => {
    dispatch(fetchMyPosts({ page, limit: 9, search, sort: sortBy, status: apiStatus }));
  }, [dispatch, page, search, sortBy, apiStatus]);

  useEffect(() => { load(); }, [load]);

  // Client-side sort only (API handles status + search filtering)
  const filteredPosts = useMemo(() => {
    const list = [...posts] as any[];
    if (sortBy === "oldest")     list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortBy === "title-asc")  list.sort((a, b) => (a.jobDetails?.title ?? "").localeCompare(b.jobDetails?.title ?? ""));
    if (sortBy === "title-desc") list.sort((a, b) => (b.jobDetails?.title ?? "").localeCompare(a.jobDetails?.title ?? ""));
    return list;
  }, [posts, sortBy]);

  const handleCopyLink = (id: string) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/interview/hr?jobId=${id}&ref=link`)
      .then(() => showToast({ message: "Interview link copied!", severity: "success" }))
      .catch(() => showToast({ message: "Failed to copy link", severity: "error" }));
  };

  const handleDelete = (id: string) => {
    setJobToDelete(id);
    deletePostHook.handleOpen();
  };

  const handleCreateClick = () => router.push("/company/posts/create");

  return (
    <RoleGuard allowedRoles={["Company"]}>
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
              onViewDetails={setSelectedJobId}
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
    </RoleGuard>
  );
};

export default PostsPage;
