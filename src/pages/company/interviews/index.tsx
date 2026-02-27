import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import InterviewsHeader from "@/components/features/company/interviews/list/InterviewsHeader";
import InterviewsList from "@/components/features/company/interviews/list/InterviewsList";
import InterviewDetail from "@/components/features/company/interviews/details/InterviewDetail";
import { getScore } from "@/components/features/company/interviews/list/InterviewCard";
import type { InterviewAssessment } from "@/components/features/company/interviews/list/InterviewCard";
import { AppDispatch } from "@/store/store";
import {
  fetchCompanyInterviews,
  fetchCompanyInterviewMetrics,
  selectCompanyInterviews,
  selectCompanyInterviewsLoading,
  selectCompanyInterviewsTotal,
  selectCompanyMetrics,
} from "@/store/slices/interviewSlice";

type TabType = "all" | "excellent" | "satisfactory" | "needs-work";

const TABS = [
  { id: "all",          label: "All"          },
  { id: "excellent",    label: "Excellent"    },
  { id: "satisfactory", label: "Satisfactory" },
  { id: "needs-work",   label: "Needs Work"   },
];

const ROW = 12;

const InterviewsPage: React.FC = () => {
  const dispatch  = useDispatch<AppDispatch>();
  const results   = useSelector(selectCompanyInterviews) as InterviewAssessment[];
  const loading   = useSelector(selectCompanyInterviewsLoading);
  const total     = useSelector(selectCompanyInterviewsTotal) as number;
  const metrics   = useSelector(selectCompanyMetrics);

  const [search,   setSearch]   = useState("");
  const [tab,      setTab]      = useState<TabType>("all");
  const [detail,   setDetail]   = useState<InterviewAssessment | null>(null);
  const [page,     setPage]     = useState(0);

  useEffect(() => {
    dispatch(fetchCompanyInterviewMetrics());
    dispatch(fetchCompanyInterviews({ page: page + 1, limit: ROW }));
  }, [dispatch, page]);

  const filtered = useMemo(() => {
    let list = results;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) =>
        a.candidate?.username?.toLowerCase().includes(q) ||
        a.candidate?.email?.toLowerCase().includes(q) ||
        a.post?.jobDetails?.title?.toLowerCase().includes(q)
      );
    }
    if (tab === "excellent")    list = list.filter((a) => getScore(a) >= 70);
    if (tab === "satisfactory") list = list.filter((a) => { const s = getScore(a); return s >= 50 && s < 70; });
    if (tab === "needs-work")   list = list.filter((a) => getScore(a) < 50);
    return list;
  }, [results, search, tab]);

  const satisfactory = results.filter((a) => { const s = getScore(a); return s >= 50 && s < 70; }).length;

  const tabItems = TABS.map((t) => ({
    id: t.id, label: t.label,
    count:
      t.id === "all"          ? total :
      t.id === "excellent"    ? metrics.excellent :
      t.id === "satisfactory" ? satisfactory :
                                metrics.needWork,
  }));

  const handleTabChange = useCallback((t: TabType) => { setTab(t); setPage(0); }, []);
  const handleLoadMore  = useCallback(() => setPage((p) => p + 1), []);

  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        {detail ? (
          <Box>
            <InterviewDetail
              assessment={detail}
              onBack={() => setDetail(null)}
            />
          </Box>
        ) : (
          <Box>
            <PageHeader
              title="Interviews"
              subtitle="Track all candidate interview assessments for your company."
              breadcrumbs={[
                { label: "Dashboard", href: "/company/dashboard" },
                { label: "Interviews" },
              ]}
            />

            <InterviewsHeader
              stats={{
                total:     metrics.total,
                excellent: metrics.excellent,
                avgScore:  metrics.avgScore,
                needsWork: metrics.needWork,
              }}
              loading={metrics.loading && page === 0}
            />

            <InterviewsList
              assessments={filtered}
              loading={loading && page === 0}
              search={search}
              onSearchChange={setSearch}
              activeTab={tab}
              onTabChange={handleTabChange}
              tabItems={tabItems}
              onSelect={setDetail}
              hasMore={results.length < total}
              onLoadMore={handleLoadMore}
            />
          </Box>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
};

export default InterviewsPage;
