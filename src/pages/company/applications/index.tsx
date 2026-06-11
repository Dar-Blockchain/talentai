import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Pagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import ApplicationMetrics from "@/components/features/company/applications/ApplicationMetrics";
import ApplicationCard from "@/components/features/company/applications/ApplicationCard";
import ContactCandidateModal, { ContactTarget } from "@/modules/company/posts/details/components/ContactCandidateModal";
import { AssessmentDetailsModal, AssessmentTarget } from "@/modules/company/assessment/modal";
import type { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { useApplicationsList } from "@/modules/company/applications/hooks";
import { ApplicationsToolbar, PostPickerModal } from "@/modules/company/applications/components";
import { TEAL } from "@/modules/company/applications/components/constants";

// ─── Static sx constants ──────────────────────────────────────────────────────

const LIST_BOX_SX       = { display: "flex", flexDirection: "column", gap: 1.5 } as const;
const PAGINATION_BOX_SX = { display: "flex", justifyContent: "center", mt: 1 } as const;
const PAGINATION_SX     = { "& .MuiPaginationItem-root": { fontWeight: 500 }, "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 } } as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

const ApplicationsPage: React.FC = () => {
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

  const [postPickerOpen,   setPostPickerOpen]   = useState(false);
  const [contactTarget,    setContactTarget]    = useState<ContactTarget | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<AssessmentTarget | null>(null);

  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

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
  const closeContact    = useCallback(() => setContactTarget(null),    []);
  const closeAssessment = useCallback(() => setAssessmentTarget(null), []);

  const handlePostSelect = useCallback((id: string, title: string) => {
    setPostId(id);
    setPostTitle(title);
    setPostPickerOpen(false);
  }, [setPostId, setPostTitle]);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, v: number) => {
    setPage(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setPage]);

  return (
    <DashboardLayout>
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
        <Box sx={LIST_BOX_SX}>
          {rows.map((app: ApplicationSummaryItem) => (
            <ApplicationCard
              key={String(app.id)}
              app={app}
              postId={app.postId || ""}
              showPostTitle
              onContact={setContactTarget}
              onAssessment={setAssessmentTarget}
              invitedIds={invitedIds}
              onInviteSuccess={markInvited}
            />
          ))}

          {pagination.totalPages > 1 && (
            <Box sx={PAGINATION_BOX_SX}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                size="small"
                sx={PAGINATION_SX}
              />
            </Box>
          )}
        </Box>
      )}

      <PostPickerModal
        open={postPickerOpen}
        selectedId={postId}
        onSelect={handlePostSelect}
        onClose={closePostPicker}
      />
      <ContactCandidateModal open={!!contactTarget} target={contactTarget} onClose={closeContact} />
      <AssessmentDetailsModal open={!!assessmentTarget} target={assessmentTarget} onClose={closeAssessment} />
    </DashboardLayout>
  );
};

export default ApplicationsPage;
