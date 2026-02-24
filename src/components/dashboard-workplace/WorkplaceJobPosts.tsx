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
import WorkplaceJobDetail from "./WorkplaceJobDetail";
import { SectionCard, SectionHeader } from "./ui";

// Sub-components
import JobPostsHeader from "./JobPostsHeader";
import JobPostsActions from "./JobPostsActions";
import JobPostsFilters from "./JobPostsFilters";
import JobPostsList from "./JobPostsList";

// Helpers
const getDaysLeft = (expirationDate?: string) => {
  if (!expirationDate) return null;
  return Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
};

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc";
type TabType = "all" | "active" | "draft" | "expired";

const WorkplaceJobPosts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  // Redux selectors
  const posts = useSelector(selectMyPosts);
  const loading = useSelector(selectMyPostsLoading);
  const error = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);

  // State
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Delete hook
  const deletePostHook = useDeletePost({
    postId: jobToDelete!,
    refetchAfterDelete: true,
    onSuccess: () => {
      showToast({ message: "Post deleted successfully", severity: "success" });
      setJobToDelete(null);
    },
    onError: () => showToast({ message: "Failed to delete post", severity: "error" }),
  });

  // Fetch posts
  const load = useCallback(() => {
    dispatch(fetchMyPosts({ page, limit: 8, search, sort: sortBy }));
  }, [dispatch, page, search, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  // Handlers
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

  const handleViewPassed = (id: string) => {
    router.push(`/posts/${id}?tab=passed`);
  };

  const handleViewDetails = (id: string) => {
    setSelectedJobId(id);
  };

  // Filter posts
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

  // Calculate stats
  const total = pagination.total || posts.length;
  const active = posts.filter(
    (p: any) =>
      p.status !== "draft" &&
      (getDaysLeft(p.expirationDate) === null || getDaysLeft(p.expirationDate)! > 0)
  ).length;
  const drafts = posts.filter((p: any) => p.status === "draft").length;
  const expired = posts.filter(
    (p: any) => getDaysLeft(p.expirationDate) !== null && getDaysLeft(p.expirationDate)! <= 0
  ).length;

  const tabItems = [
    { id: "all", label: "All", count: posts.length },
    { id: "active", label: "Active", count: active },
    { id: "draft", label: "Drafts", count: drafts },
    { id: "expired", label: "Expired", count: expired },
  ];

  // Show detail view
  if (selectedJobId) {
    return (
      <WorkplaceJobDetail jobId={selectedJobId} onBack={() => { setSelectedJobId(null); load(); }} />
    );
  }

  const handleCreateClick = () => router.push("/posts/create");

  return (
    <Box>
      {/* Header with banner and stats */}
      <JobPostsHeader
        total={total}
        active={active}
        drafts={drafts}
        expired={expired}
        onCreateClick={handleCreateClick}
      />

      {/* Main content */}
      <SectionCard>
        <SectionHeader
          title="My Job Posts"
          subtitle={`${filtered.length} post${filtered.length !== 1 ? "s" : ""} shown`}
          action={
            <JobPostsActions
              sortBy={sortBy}
              onSortChange={(sort) => {
                setSortBy(sort);
                setPage(1);
              }}
              onCreateClick={handleCreateClick}
            />
          }
        />

        {/* Filters */}
        <JobPostsFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setPage(1);
          }}
          tabItems={tabItems}
        />

        {/* List */}
        <JobPostsList
          jobs={filtered}
          loading={loading}
          error={error}
          search={search}
          page={page}
          pagination={pagination}
          onPageChange={setPage}
          onDelete={handleDelete}
          onCopyLink={handleCopyLink}
          onViewPassed={handleViewPassed}
          onViewDetails={handleViewDetails}
          onCreateClick={handleCreateClick}
        />
      </SectionCard>

      {/* Delete modal */}
      <DeletePostModal
        open={deletePostHook.open}
        onClose={() => {
          deletePostHook.handleClose();
          setJobToDelete(null);
        }}
        onDelete={deletePostHook.handleDelete}
        isDeleting={deletePostHook.isDeleting}
      />
    </Box>
  );
};

export default WorkplaceJobPosts;
