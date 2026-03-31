import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import InterviewsHeader from "@/components/features/company/interviews/list/InterviewsHeader";
import InterviewsList, { ScoreFilter, SortOption } from "@/components/features/company/interviews/list/InterviewsList";
import { getScore } from "@/components/features/company/interviews/list/InterviewCard";
import type { InterviewAssessment } from "@/components/features/company/interviews/list/InterviewCard";
import { AppDispatch } from "@/store/store";
import {
  fetchCompanyInterviews,
  fetchCompanyInterviewMetrics,
  selectCompanyInterviews,
  selectCompanyInterviewsLoading,
  selectCompanyInterviewsTotal,
  selectCompanyInterviewsTotalPages,
  selectCompanyMetrics,
} from "@/store/slices/interviewSlice";

const ROW = 12;

const InterviewsPage: React.FC = () => {
  useCompanyAccess("canViewInterviewResults");
  const dispatch    = useDispatch<AppDispatch>();
  const router      = useRouter();
  const results     = useSelector(selectCompanyInterviews) as InterviewAssessment[];
  const loading     = useSelector(selectCompanyInterviewsLoading);
  const total       = useSelector(selectCompanyInterviewsTotal) as number;
  const totalPages  = useSelector(selectCompanyInterviewsTotalPages) as number;
  const metrics     = useSelector(selectCompanyMetrics);

  const [search,      setSearch]      = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sortBy,      setSortBy]      = useState<SortOption>("newest");
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    dispatch(fetchCompanyInterviews({
      page,
      limit: ROW,
      ...(search.trim() ? { search: search.trim() } : {}),
    }));
  }, [dispatch, page, search]);

  useEffect(() => {
    dispatch(fetchCompanyInterviewMetrics());
  }, [dispatch]);

  // Client-side score filter + sort only
  const filtered = useMemo(() => {
    let list = results;
    if (scoreFilter === "excellent")    list = list.filter((a) => getScore(a) >= 70);
    if (scoreFilter === "satisfactory") list = list.filter((a) => { const s = getScore(a); return s >= 50 && s < 70; });
    if (scoreFilter === "needs-work")   list = list.filter((a) => getScore(a) < 50);
    if (sortBy === "newest")  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "highest") return [...list].sort((a, b) => getScore(b) - getScore(a));
    if (sortBy === "lowest")  return [...list].sort((a, b) => getScore(a) - getScore(b));
    return list;
  }, [results, scoreFilter, sortBy]);

  const handleSearch      = useCallback((v: string) => { setSearch(v); setPage(1); }, []);
  const handleScoreFilter = useCallback((f: ScoreFilter) => { setScoreFilter(f); setPage(1); }, []);
  const handlePageChange  = useCallback((p: number) => setPage(p), []);
  const handleSelect      = useCallback((a: InterviewAssessment) => router.push(`/company/interviews/${a._id}`), [router]);

  return (
    <DashboardLayout>
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
          stats={{ total: metrics.total || total, excellent: metrics.excellent, avgScore: Math.round(metrics.avgScore), needsWork: metrics.needWork }}
          loading={metrics.loading}
        />

        <InterviewsList
          assessments={filtered}
          loading={loading && page === 1}
          search={search}
          onSearchChange={handleSearch}
          scoreFilter={scoreFilter}
          onScoreFilterChange={handleScoreFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelect={handleSelect}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>
    </DashboardLayout>
  );
};

export default InterviewsPage;
