import React, { useCallback, useEffect, useState } from "react";
import { Box, Pagination } from "@mui/material";
import { useTranslation } from "react-i18next";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import ApplicationMetrics from "@/components/features/company/applications/ApplicationMetrics";
import ApplicationCard from "@/components/features/company/applications/ApplicationCard";
import ContactCandidateModal, { ContactTarget } from "@/modules/posts/details/components/ContactCandidateModal";
import { AssessmentDetailsModal, AssessmentTarget } from "@/modules/assessments/post";
import type { ApplicationSummaryItem } from "@/store/slices/jobApplicationSlice";
import { useApplicationsList } from "@/modules/company/applications/hooks";
import { ApplicationsToolbar, PostPickerModal } from "@/modules/company/applications/components";
import { TEAL } from "@/modules/company/applications/components/constants";

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

  const [postPickerOpen, setPostPickerOpen] = useState(false);
  const [contactTarget,    setContactTarget]    = useState<ContactTarget | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<AssessmentTarget | null>(null);

  // Track which applicationIds were invited this session
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const markInvited = useCallback((appId: string) => {
    setInvitedIds((prev) => new Set(prev).add(appId));
  }, []);

  // Seed invited state from server data (persists across refreshes)
  useEffect(() => {
    const fromServer = rows.filter((r) => !!r.invitedAt).map((r) => String(r.id));
    if (!fromServer.length) return;
    setInvitedIds((prev) => {
      const merged = new Set(prev);
      fromServer.forEach((id) => merged.add(id));
      return merged;
    });
  }, [rows]);

  const hasFilters = !!(search || status || postId);

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
        onPostPickerOpen={() => setPostPickerOpen(true)}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                shape="rounded"
                size="small"
                sx={{ "& .MuiPaginationItem-root": { fontWeight: 500 }, "& .Mui-selected": { bgcolor: `${TEAL}18`, color: TEAL, fontWeight: 700 } }}
              />
            </Box>
          )}
        </Box>
      )}

      <PostPickerModal
        open={postPickerOpen}
        selectedId={postId}
        onSelect={(id, title) => { setPostId(id); setPostTitle(title); setPostPickerOpen(false); }}
        onClose={() => setPostPickerOpen(false)}
      />
      <ContactCandidateModal open={!!contactTarget} target={contactTarget} onClose={() => setContactTarget(null)} />
      <AssessmentDetailsModal open={!!assessmentTarget} target={assessmentTarget} onClose={() => setAssessmentTarget(null)} />
    </DashboardLayout>
  );
};

export default ApplicationsPage;
