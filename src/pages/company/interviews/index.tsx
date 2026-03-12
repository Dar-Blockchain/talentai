import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import InterviewsHeader from "@/components/features/company/interviews/list/InterviewsHeader";
import InterviewsList, { ScoreFilter, SortOption } from "@/components/features/company/interviews/list/InterviewsList";
import InterviewDetail from "@/components/features/company/interviews/details/InterviewDetail";
import { getScore } from "@/components/features/company/interviews/list/InterviewCard";
import type { InterviewAssessment } from "@/components/features/company/interviews/list/InterviewCard";
import { AppDispatch } from "@/store/store";
import {
  fetchCompanyInterviews,
  selectCompanyInterviews,
  selectCompanyInterviewsLoading,
  selectCompanyInterviewsTotal,
} from "@/store/slices/interviewSlice";
import { fetchMyPosts, selectMyPosts } from "@/store/slices/postSlice";

const ROW = 12;

const InterviewsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const results  = useSelector(selectCompanyInterviews) as InterviewAssessment[];
  const loading  = useSelector(selectCompanyInterviewsLoading);
  const total    = useSelector(selectCompanyInterviewsTotal) as number;
  const myPosts  = useSelector(selectMyPosts) as any[];

  const [searchName,  setSearchName]  = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [sortBy,      setSortBy]      = useState<SortOption>("newest");
  const [detail,      setDetail]      = useState<InterviewAssessment | null>(null);
  const [page,        setPage]        = useState(0);

  // Fetch only on page change — all filtering is client-side
  useEffect(() => {
    dispatch(fetchCompanyInterviews({ page: page + 1, limit: ROW }));
  }, [dispatch, page]);

  // Fetch all job titles for autocomplete (once)
  useEffect(() => {
    dispatch(fetchMyPosts({ limit: 100 }));
  }, [dispatch]);

  const jobTitleOptions = useMemo(() =>
    Array.from(new Set(
      (myPosts || []).map((p: any) => p.jobDetails?.title).filter(Boolean)
    )) as string[],
  [myPosts]);

  const { excellentCount, needsWorkCount, avgScore } = useMemo(() => {
    let excellent = 0, needsWork = 0, scoreSum = 0;
    for (const a of results) {
      const s = getScore(a);
      scoreSum += s;
      if (s >= 70) excellent++;
      else if (s < 50) needsWork++;
    }
    return {
      excellentCount: excellent,
      needsWorkCount: needsWork,
      avgScore:       results.length > 0 ? Math.round(scoreSum / results.length) : 0,
    };
  }, [results]);

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

  const handleScoreFilter = useCallback((f: ScoreFilter) => { setScoreFilter(f); setPage(0); }, []);
  const handleLoadMore    = useCallback(() => setPage((p) => p + 1), []);
  const handleBack        = useCallback(() => setDetail(null), []);

  return (
      <DashboardLayout>
        {detail ? (
          <Box>
            <InterviewDetail assessment={detail} onBack={handleBack} />
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
              stats={{ total, excellent: excellentCount, avgScore, needsWork: needsWorkCount }}
              loading={loading && page === 0}
            />

            <InterviewsList
              assessments={filtered}
              loading={loading && page === 0}
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
              onSelect={setDetail}
              hasMore={results.length < total}
              onLoadMore={handleLoadMore}
            />
          </Box>
        )}
      </DashboardLayout>
  );
};

export default InterviewsPage;
