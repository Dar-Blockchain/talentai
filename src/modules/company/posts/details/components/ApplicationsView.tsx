import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useApplicationsSummaryQuery } from "../queries";
import ContactCandidateModal, { ContactTarget } from "./ContactCandidateModal";
import ApplicationsToolbar from "./applications/ApplicationsToolbar";
import ApplicationsEmptyState from "./applications/ApplicationsEmptyState";
import ApplicationsList from "./applications/ApplicationsList";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import type { ApplicationSummaryItem } from "@/modules/company/applications/types";

const TEAL     = "#0D9488";
const PAGE_SIZE = 10;

interface Props { jobId: string }

const ApplicationsView: React.FC<Props> = ({ jobId }) => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [status, setStatus]           = useState("");
  const [sort, setSort]               = useState("appliedAt_desc");
  const [page, setPage]               = useState(1);
  const [contactTarget, setContactTarget] = useState<ContactTarget | null>(null);
  const [invitedIds, setInvitedIds]       = useState<Set<string>>(new Set());

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

  const rows: ApplicationSummaryItem[] = data?.data ?? [];
  const pagination: { totalPages: number; totalCount?: number } = data?.pagination ?? { totalPages: 0 };

  useEffect(() => {
    const fromServer = rows.filter((r) => !!r.invitedAt).map((r) => String(r.id));
    if (fromServer.length === 0) return;
    setInvitedIds(prev => {
      const merged = new Set(prev);
      fromServer.forEach((id: string) => merged.add(id));
      return merged;
    });
  }, [rows]);

  return (
    <div className="mt-4">
      <ApplicationsToolbar
        searchInput={searchInput}
        status={status}
        sort={sort}
        totalCount={pagination.totalCount}
        loading={loading}
        onSearchChange={setSearchInput}
        onStatusChange={setStatus}
        onSortChange={setSort}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-8" style={{ color: TEAL }} />
        </div>
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
          invitedIds={invitedIds}
          onInviteSuccess={markInvited}
        />
      )}

      <ContactCandidateModal open={!!contactTarget} target={contactTarget} onClose={() => setContactTarget(null)} />
    </div>
  );
};

export default ApplicationsView;
