import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useApplicationsSummaryQuery } from "../queries";
import ContactCandidateModal, { ContactTarget } from "./ContactCandidateModal";
import ApplicationsToolbar from "./applications/ApplicationsToolbar";
import ApplicationsEmptyState from "./applications/ApplicationsEmptyState";
import ApplicationsList from "./applications/ApplicationsList";
import { AssessmentDetailsModal, AssessmentTarget } from "@/modules/company/assessment/modal";

const TEAL     = "#0D9488";
const PAGE_SIZE = 10;

interface Props { jobId: string }

const ApplicationsView: React.FC<Props> = ({ jobId }) => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [sort, setSort]               = useState("appliedAt_desc");
  const [page, setPage]               = useState(1);
  const [contactTarget,    setContactTarget]    = useState<ContactTarget | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<AssessmentTarget | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const markInvited = useCallback((appId: string) => {
    setInvitedIds(prev => new Set(prev).add(appId));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [status, sort]);

  const queryParams = useMemo(() => ({
    postId: jobId,
    search:  search  || undefined,
    status:  status  || undefined,
    sort:    sort    || undefined,
    page,
    limit: PAGE_SIZE,
  }), [jobId, search, status, sort, page]);

  const { data, isLoading: loading } = useApplicationsSummaryQuery(queryParams);

  const rows       = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  useEffect(() => {
    const fromServer = rows.filter((r: any) => !!r.invitedAt).map((r: any) => String(r.id));
    if (fromServer.length === 0) return;
    setInvitedIds(prev => {
      const merged = new Set(prev);
      fromServer.forEach((id: string) => merged.add(id));
      return merged;
    });
  }, [rows]);

  return (
    <Box sx={{ mt: 2 }}>
      <ApplicationsToolbar
        searchInput={searchInput}
        status={status}
        sort={sort}
        totalCount={(pagination as any).totalCount}
        loading={loading}
        onSearchChange={setSearchInput}
        onStatusChange={setStatus}
        onSortChange={setSort}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={32} sx={{ color: TEAL }} />
        </Box>
      ) : rows.length === 0 ? (
        <ApplicationsEmptyState hasFilters={!!(search || status)} />
      ) : (
        <ApplicationsList
          rows={rows}
          postId={jobId}
          page={page}
          pagination={pagination}
          onPage={setPage}
          onContact={setContactTarget}
          onAssessment={setAssessmentTarget}
          invitedIds={invitedIds}
          onInviteSuccess={markInvited}
        />
      )}

      <ContactCandidateModal open={!!contactTarget} target={contactTarget} onClose={() => setContactTarget(null)} />
      <AssessmentDetailsModal open={!!assessmentTarget} target={assessmentTarget} onClose={() => setAssessmentTarget(null)} />
    </Box>
  );
};

export default ApplicationsView;
