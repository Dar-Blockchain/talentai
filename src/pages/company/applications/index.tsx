import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PeopleAltOutlined   from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlined  from "@mui/icons-material/WorkOutline";
import EmptyState   from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import ApplicationMetrics  from "@/modules/company/applications/components/ApplicationMetrics";
import ApplicationCard     from "@/modules/company/applications/components/ApplicationCard";
import ContactCandidateModal, { ContactTarget } from "@/modules/company/applications/components/ContactCandidateModal";
import type { ApplicationSummaryItem } from "@/modules/company/applications/types";
import { useApplicationsList } from "@/modules/company/applications/hooks";
import { ApplicationsToolbar, PostPickerModal } from "@/modules/company/applications/components";
import { TEAL } from "@/modules/company/applications/components/constants";
import { SimplePagination } from "@/modules/shared/ui/shadcn/pagination-simple";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

// ─── Page ─────────────────────────────────────────────────────────────────────

const ApplicationsPage: NextPageWithLayout = () => {
  const { t } = useTranslation("dashboard");
  const {
    searchInput, setSearchInput,
    search, status, setStatus,
    postId, postTitle, setPostId, setPostTitle, clearPost,
    sort, setSort,
    page, setPage,
    rows, pagination, metrics, loading,
    downloading, handleDownloadCVs,
  } = useApplicationsList();

  const [postPickerOpen, setPostPickerOpen] = useState(false);
  const [contactTarget,  setContactTarget]  = useState<ContactTarget | null>(null);
  const [invitedIds,     setInvitedIds]     = useState<Set<string>>(new Set());

  const markInvited = useCallback((appId: string) => {
    setInvitedIds((prev) => new Set(prev).add(appId));
  }, []);

  useEffect(() => {
    const fromServer = rows.filter((r) => !!r.invitedAt).map((r) => String(r.id));
    if (!fromServer.length) return;
    setInvitedIds((prev) => {
      const merged = new Set(prev);
      fromServer.forEach((id) => merged.add(id));
      return merged;
    });
  }, [rows]);

  const hasFilters = useMemo(() => !!(search || status || postId), [search, status, postId]);

  const openPostPicker  = useCallback(() => setPostPickerOpen(true),  []);
  const closePostPicker = useCallback(() => setPostPickerOpen(false), []);
  const closeContact    = useCallback(() => setContactTarget(null),   []);

  const handlePostSelect = useCallback((id: string, title: string) => {
    setPostId(id); setPostTitle(title); setPostPickerOpen(false);
  }, [setPostId, setPostTitle]);

  const handlePageChange = useCallback((v: number) => {
    setPage(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setPage]);

  return (
    <>
      <ApplicationsToolbar
        searchInput={searchInput}
        status={status}
        postId={postId}
        postTitle={postTitle}
        sort={sort}
        loading={loading}
        totalCount={pagination.totalCount}
        downloading={downloading}
        onSearchChange={setSearchInput}
        onStatusChange={setStatus}
        onPostPickerOpen={openPostPicker}
        onClearPost={clearPost}
        onSortChange={setSort}
        onDownload={handleDownloadCVs}
      />

      <ApplicationMetrics metrics={metrics} />

      {loading ? (
        <LoadingState message={t("pages.common.loading")} color={TEAL} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={hasFilters ? <WorkOutlineOutlined /> : <PeopleAltOutlined />}
          title={hasFilters ? t("pages.applications.empty_filtered_title") : t("pages.applications.empty_no_apps_title")}
          description={hasFilters ? t("pages.applications.empty_filtered_sub") : t("pages.applications.empty_no_apps_sub")}
          minHeight={320}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((app: ApplicationSummaryItem) => (
            <ApplicationCard
              key={String(app.id)}
              app={app}
              postId={app.postId || ""}
              showPostTitle
              onContact={setContactTarget}
              invitedIds={invitedIds}
              onInviteSuccess={markInvited}
            />
          ))}

          {pagination.totalPages > 1 && (
            <SimplePagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      <PostPickerModal
        open={postPickerOpen}
        selectedId={postId}
        onSelect={handlePostSelect}
        onClose={closePostPicker}
      />
      <ContactCandidateModal open={!!contactTarget} target={contactTarget} onClose={closeContact} />
    </>
  );
};
ApplicationsPage.getLayout = getDashboardLayout;

export default ApplicationsPage;
