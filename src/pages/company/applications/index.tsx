import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users as PeopleAltOutlined, Briefcase as WorkOutlineOutlined, ListFilter as ListFilterOutlined, X as XOutlined } from "lucide-react";
import EmptyState   from "@/modules/shared/ui/EmptyState";
import LoadingState from "@/modules/shared/ui/LoadingState";
import ApplicationMetrics  from "@/modules/company/applications/components/ApplicationMetrics";
import ApplicationCard     from "@/modules/company/applications/components/ApplicationCard";
import ContactCandidateModal, { ContactTarget } from "@/modules/company/applications/components/ContactCandidateModal";
import type { ApplicationSummaryItem } from "@/modules/company/applications/types";
import { useApplicationsList } from "@/modules/company/applications/hooks";
import { ApplicationsToolbar, PostPickerModal } from "@/modules/company/applications/components";
import { TEAL } from "@/modules/company/applications/components/constants";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

// ─── Page ─────────────────────────────────────────────────────────────────────

const ApplicationsPage: NextPageWithLayout = () => {
  const { t } = useTranslation("dashboard");
  const {
    searchInput, setSearchInput,
    search, status, setStatus,
    postId, postTitle, setPostId, setPostTitle, clearPost,
    applicationId, setApplicationId,
    sort, setSort,
    page, setPage,
    actionFilter, setActionFilter,
    rows, pagination, metrics, loading,
    downloading, handleDownloadCVs,
  } = useApplicationsList();

  const ACTION_FILTER_LABELS: Record<string, string> = {
    pending_shortlist: t("pages.kpi.shortlists_pending", "Shortlists pending decision"),
    unreviewed:        t("pages.kpi.interviews_unreviewed", "Interviews not reviewed >48h"),
    no_show:           t("pages.kpi.noshows", "No-shows to follow up"),
  };

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
      {applicationId && (
        <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-2.5 mb-4">
          <ListFilterOutlined size={14} color="#0D9488" className="shrink-0" />
          <span className="text-[13px] font-medium text-teal-800">
            {t("pages.applications.application_filter_showing", "Showing a single application")}
          </span>
          <button
            onClick={() => setApplicationId("")}
            className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-teal-600 hover:text-teal-800 transition-colors shrink-0"
          >
            <XOutlined size={13} />
            {t("pages.applications.action_filter_clear", "Clear")}
          </button>
        </div>
      )}
      {actionFilter && ACTION_FILTER_LABELS[actionFilter] && (
        <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-2.5 mb-4">
          <ListFilterOutlined size={14} color="#0D9488" className="shrink-0" />
          <span className="text-[13px] font-medium text-teal-800">
            {t("pages.applications.action_filter_showing", "Showing")}: {ACTION_FILTER_LABELS[actionFilter]}
          </span>
          <button
            onClick={() => setActionFilter("")}
            className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-teal-600 hover:text-teal-800 transition-colors shrink-0"
          >
            <XOutlined size={13} />
            {t("pages.applications.action_filter_clear", "Clear")}
          </button>
        </div>
      )}
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
            <Pagination
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
