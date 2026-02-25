import RoleGuard from "@/components/guards/RoleGuard";
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
  selectPostMetrics,
} from "@/store/slices/postSlice";
import { useToast } from "@/hooks/useToast";
import DeletePostModal from "@/components/features/company/posts/details/DeletePostModal";
import { useDeletePost } from "@/components/features/company/posts/details/useDeletePost";
import WorkplaceJobDetail from "@/components/dashboard-workplace/WorkplaceJobDetail";
import JobPostsList from "@/components/features/company/posts/list/JobPostsList";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import AddOutlined from "@mui/icons-material/AddOutlined";
import PostsStats from "@/components/features/company/posts/list/Stats";

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";
type TabType = "all" | "active" | "draft" | "expired";

const PostsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const { showToast } = useToast();

  const posts      = useSelector(selectMyPosts);
  const loading    = useSelector(selectMyPostsLoading);
  const error      = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);
  const metrics    = useSelector(selectPostMetrics);

  const [activeTab, setActiveTab]         = useState<TabType>("all");
  const [search, setSearch]               = useState("");
  const sortBy: SortOption                = "newest";
  const [page, setPage]                   = useState(1);
  const [jobToDelete, setJobToDelete]     = useState<string | null>(null);
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

  const load = useCallback(() => {
    dispatch(fetchMyPosts({ page, limit: 9, search, sort: sortBy, status: activeTab }));
  }, [dispatch, page, search, sortBy, activeTab]);

  useEffect(() => { load(); }, [load]);

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

  // Tab counts use real API metrics totals, not the current page slice
  const tabItems = [
    { id: "all",     label: "All",     count: metrics?.total   ?? pagination.total },
    { id: "active",  label: "Active",  count: metrics?.active  ?? 0 },
    { id: "draft",   label: "Drafts",  count: metrics?.draft   ?? 0 },
    { id: "expired", label: "Expired", count: metrics?.expired ?? 0 },
  ];

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
              jobs={posts}
              loading={loading}
              error={error}
              search={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              activeTab={activeTab}
              onTabChange={(t) => { setActiveTab(t as TabType); setPage(1); }}
              tabItems={tabItems}
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
