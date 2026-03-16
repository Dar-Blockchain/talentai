import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
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
import { fetchMyPosts, selectMyPosts } from "@/store/slices/postSlice";

const ROW = 12;

const InterviewsPage: React.FC = () => {
  const dispatch    = useDispatch<AppDispatch>();
  const router      = useRouter();
  const results     = useSelector(selectCompanyInterviews) as InterviewAssessment[];
  const loading     = useSelector(selectCompanyInterviewsLoading);
  const total       = useSelector(selectCompanyInterviewsTotal) as number;
  const totalPages  = useSelector(selectCompanyInterviewsTotalPages) as number;
  const metrics     = useSelector(selectCompanyMetrics);
  const myPosts     = useSelector(selectMyPosts) as any[];

  const [searchName,  setSearchName]  = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sortBy,      setSortBy]      = useState<SortOption>("newest");
  const [page,        setPage]        = useState(1);

  useEffect(() => {
    dispatch(fetchCompanyInterviews({ page, limit: ROW }));
  }, [dispatch, page]);

  useEffect(() => {
    dispatch(fetchCompanyInterviewMetrics());
    dispatch(fetchMyPosts({ limit: 100 }));
  }, [dispatch]);

  const jobTitleOptions = useMemo(() =>
    Array.from(new Set(
      (myPosts || []).map((p: any) => p.jobDetails?.title).filter(Boolean)
    )) as string[],
  [myPosts]);


  // Client-side filtering by name, email, job title
  const filtered = useMemo(() => {
    let list = results;

    if (searchName.trim()) {
      const q = searchName.toLowerCase();
      list = list.filter((a) => a.candidate?.username?.toLowerCase().includes(q));
    }
    if (searchEmail.trim()) {
      const q = searchEmail.toLowerCase();
      list = list.filter((a) => a.candidate?.email?.toLowerCase().includes(q));
    }
    if (searchTitle.trim()) {
      const q = searchTitle.toLowerCase();
      list = list.filter((a) => a.post?.jobDetails?.title?.toLowerCase().includes(q));
    }

    if (scoreFilter === "excellent")    list = list.filter((a) => getScore(a) >= 70);
    if (scoreFilter === "satisfactory") list = list.filter((a) => { const s = getScore(a); return s >= 50 && s < 70; });
    if (scoreFilter === "needs-work")   list = list.filter((a) => getScore(a) < 50);

    if (sortBy === "newest")  return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === "highest") return [...list].sort((a, b) => getScore(b) - getScore(a));
    if (sortBy === "lowest")  return [...list].sort((a, b) => getScore(a) - getScore(b));
    return list;
  }, [results, searchName, searchEmail, searchTitle, scoreFilter, sortBy]);

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
            searchName={searchName}
            onSearchNameChange={setSearchName}
            searchEmail={searchEmail}
            onSearchEmailChange={setSearchEmail}
            searchTitle={searchTitle}
            onSearchTitleChange={setSearchTitle}
            jobTitleOptions={jobTitleOptions}
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
