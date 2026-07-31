import React, { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCombinedDetails } from "@/store/slices/paymentSlice";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { useToast } from "@/hooks/useToast";
import JobPostsList      from "./JobPostsList";
import PostsStats        from "./PostsStats";
import DeletePostModal   from "./DeletePostModal";
import PublishConfirmModal from "./PublishConfirmModal";
import PostsToolbar      from "./PostsToolbar";
import NoPlanModal       from "./NoPlanModal";
import { useDeletePost }  from "../hooks/useDeletePost";
import { useMyPosts }     from "../hooks/useMyPosts";
import { usePublishPost } from "../hooks/usePublishPost";

const fetchSubscription = () =>
  axiosInstance.get("subscriptions/combined").then(r => r.data?.data ?? r.data);

const PostsPageContent: React.FC = () => {
  const { t }         = useTranslation("posts");
  const router        = useRouter();
  const { showToast } = useToast();

  // Use cached selector if already in Redux; otherwise fetch independently
  const cached    = useSelector(selectCombinedDetails);
  const { data: subData } = useQuery({
    queryKey: ["subscription", "combined"],
    queryFn:  fetchSubscription,
    staleTime: 60_000,
    enabled:  !cached,
  });
  const combined     = cached ?? subData;
  const postsUsed    = combined?.combined?.usage?.posts?.used  ?? 0;
  const postsLimit   = combined?.combined?.usage?.posts?.limit ?? Infinity;
  const postsAtLimit = !!combined && postsLimit !== Infinity && postsLimit !== -1 && postsUsed >= postsLimit;
  const hasNoPlan    = !combined;

  const [planModalOpen, setPlanModalOpen] = useState(false);

  const {
    posts, loading, error, pagination,
    page, search, statusFilter, sortBy,
    hasFilters, setPage, reload,
    handleSearchChange, handleStatusChange, handleSortChange,
  } = useMyPosts({ limit: 9 });

  const deleteHook = useDeletePost({
    refetchAfterDelete: true,
    onSuccess: () => showToast({ message: t("delete_success"), severity: "success" }),
    onError:   () => showToast({ message: t("delete_error"),   severity: "error"   }),
  });

  const publishHook = usePublishPost({
    onSuccess: () => { showToast({ message: t("publish_success"), severity: "success" }); reload(); },
    onError:   () => showToast({ message: t("publish_error"),     severity: "error"   }),
  });

  const handleCreateClick = () => {
    if (hasNoPlan || postsAtLimit) { setPlanModalOpen(true); return; }
    router.push("/company/posts/create");
  };
  const totalCount = pagination?.total ?? posts.length;

  return (
    <div>
      <PostsToolbar
        totalCount={totalCount} loading={loading}
        search={search} statusFilter={statusFilter} sortBy={sortBy}
        postsUsed={postsUsed} postsLimit={postsLimit} postsAtLimit={postsAtLimit}
        onSearchChange={handleSearchChange} onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
        onCreateClick={handleCreateClick}
      />

      <PostsStats />

      <JobPostsList
        jobs={posts} loading={loading} error={error}
        hasFilters={hasFilters} page={page} pagination={pagination}
        onPageChange={setPage}
        onDelete={deleteHook.handleOpen}
        onPublish={publishHook.handleOpen}
        onViewDetails={(id) => router.push(`/company/posts/${id}`)}
        onCreateClick={handleCreateClick}
      />

      <DeletePostModal
        open={deleteHook.open} onClose={deleteHook.handleClose}
        onDelete={deleteHook.handleDelete} isDeleting={deleteHook.isDeleting}
      />

      <PublishConfirmModal
        open={!!publishHook.confirmId} publishing={publishHook.publishing}
        onClose={publishHook.handleClose} onConfirm={publishHook.handleConfirm}
        onEdit={() => { publishHook.handleClose(); router.push(`/company/posts/${publishHook.confirmId}`); }}
      />

      <NoPlanModal
        open={planModalOpen}
        isAtLimit={postsAtLimit}
        postsUsed={postsUsed}
        postsLimit={postsLimit !== Infinity ? postsLimit : undefined}
        onClose={() => setPlanModalOpen(false)}
      />
    </div>
  );
};

export default PostsPageContent;
