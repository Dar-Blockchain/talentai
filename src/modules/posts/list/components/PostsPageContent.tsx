import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { AppDispatch } from "@/store/store";
import { fetchCombinedSubscriptionDetails, selectCombinedDetails } from "@/store/slices/paymentSlice";
import { useToast } from "@/hooks/useToast";
import JobPostsList from "./JobPostsList";
import PostsStats from "./PostsStats";
import DeletePostModal from "./DeletePostModal";
import PublishConfirmModal from "./PublishConfirmModal";
import PostsToolbar from "./PostsToolbar";
import { useDeletePost } from "../hooks/useDeletePost";
import { useMyPosts } from "../hooks/useMyPosts";
import { usePublishPost } from "../hooks/usePublishPost";

const PostsPageContent: React.FC = () => {
  const { t }        = useTranslation("posts");
  const dispatch     = useDispatch<AppDispatch>();
  const router       = useRouter();
  const { showToast } = useToast();

  const combined     = useSelector(selectCombinedDetails);
  const postsUsed    = combined?.combined.usage.posts.used ?? 0;
  const postsLimit   = combined?.combined.usage.posts.limit ?? Infinity;
  const postsAtLimit = !!combined && postsLimit !== Infinity && postsLimit !== -1 && postsUsed >= postsLimit;

  useEffect(() => { dispatch(fetchCombinedSubscriptionDetails()); }, [dispatch]);

  const {
    posts, loading, error, pagination,
    page, search, statusFilter, typeFilter, sortBy,
    hasFilters, setPage, reload,
    handleSearchChange, handleStatusChange, handleTypeChange, handleSortChange,
  } = useMyPosts({ limit: 9 });

  const deleteHook = useDeletePost({
    refetchAfterDelete: true,
    onSuccess: () => showToast({ message: t("delete_success"), severity: "success" }),
    onError:   () => showToast({ message: t("delete_error"),   severity: "error"   }),
  });

  const publishHook = usePublishPost({
    onSuccess: () => {
      showToast({ message: t("publish_success"), severity: "success" });
      reload();
    },
    onError: () => showToast({ message: t("publish_error"), severity: "error" }),
  });

  const handleCreateClick = () => { if (!postsAtLimit) router.push("/company/posts/create"); };
  const totalCount = (pagination as any)?.total ?? posts.length;

  return (
    <Box>
      <PostsToolbar
        totalCount={totalCount}
        loading={loading}
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        sortBy={sortBy}
        postsUsed={postsUsed}
        postsLimit={postsLimit}
        postsAtLimit={postsAtLimit}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onTypeChange={handleTypeChange}
        onSortChange={handleSortChange}
        onCreateClick={handleCreateClick}
      />

      <PostsStats />

      <JobPostsList
        jobs={posts as any[]}
        loading={loading}
        error={error}
        hasFilters={hasFilters}
        page={page}
        pagination={pagination}
        onPageChange={setPage}
        onDelete={deleteHook.handleOpen}
        onPublish={publishHook.handleOpen}
        onViewDetails={(id) => router.push(`/company/posts/${id}`)}
        onCreateClick={handleCreateClick}
      />

      <DeletePostModal
        open={deleteHook.open}
        onClose={deleteHook.handleClose}
        onDelete={deleteHook.handleDelete}
        isDeleting={deleteHook.isDeleting}
      />

      <PublishConfirmModal
        open={!!publishHook.confirmId}
        publishing={publishHook.publishing}
        onClose={publishHook.handleClose}
        onConfirm={publishHook.handleConfirm}
        onEdit={() => {
          publishHook.handleClose();
          router.push(`/company/posts/${publishHook.confirmId}`);
        }}
      />
    </Box>
  );
};

export default PostsPageContent;
