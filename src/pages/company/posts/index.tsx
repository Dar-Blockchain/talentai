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
import DeletePostModal from "@/components/posts/delete/DeletePostModal";
import { useDeletePost } from "@/components/posts/delete/useDeletePost";
import WorkplaceJobDetail from "@/components/dashboard-workplace/WorkplaceJobDetail";
import JobPostsHeader from "@/components/features/company/posts/list/JobPostsHeader";
import JobPostsList from "@/components/features/company/posts/list/JobPostsList";

const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";
type TabType = "all" | "active" | "draft" | "expired";

const PostsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const posts = useSelector(selectMyPosts);
  const loading = useSelector(selectMyPostsLoading);
  const error = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
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
    dispatch(fetchMyPosts({ page, limit: 8, search, sort: sortBy }));
  }, [dispatch, page, search, sortBy]);

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

  const filtered = useMemo(() => {
    if (activeTab === "all") return posts;
    return posts.filter((p: any) => {
      if (activeTab === "draft") return p.status === "draft";
      if (activeTab === "expired")
        return getDaysLeft(p.expirationDate) !== null && getDaysLeft(p.expirationDate)! <= 0;
      if (activeTab === "active")
        return (
          p.status !== "draft" &&
          (getDaysLeft(p.expirationDate) === null || getDaysLeft(p.expirationDate)! > 0)
        );
      return true;
    });
  }, [posts, activeTab]);

  const total   = pagination.total || posts.length;
  const active  = posts.filter((p: any) => p.status !== "draft" && (getDaysLeft(p.expirationDate) === null || getDaysLeft(p.expirationDate)! > 0)).length;
  const drafts  = posts.filter((p: any) => p.status === "draft").length;
  const expired = posts.filter((p: any) => getDaysLeft(p.expirationDate) !== null && getDaysLeft(p.expirationDate)! <= 0).length;

  const tabItems = [
    { id: "all",     label: "All",     count: posts.length },
    { id: "active",  label: "Active",  count: active },
    { id: "draft",   label: "Drafts",  count: drafts },
    { id: "expired", label: "Expired", count: expired },
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
            <JobPostsHeader
              total={total}
              active={active}
              drafts={drafts}
              expired={expired}
              onCreateClick={handleCreateClick}
            />

            <JobPostsList
              jobs={filtered}
              loading={loading}
              error={error}
              search={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              activeTab={activeTab}
              onTabChange={(t) => { setActiveTab(t); setPage(1); }}
              tabItems={tabItems}
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
