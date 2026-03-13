import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import InterviewDetail from "@/components/features/company/interviews/details/InterviewDetail";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCompanyInterviews, selectCompanyInterviews } from "@/store/slices/interviewSlice";
import type { InterviewAssessment } from "@/components/features/company/interviews/list/InterviewCard";

const InterviewDetailPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const interviews = useSelector(selectCompanyInterviews) as InterviewAssessment[];
  const loading    = useSelector((s: RootState) => s.interview.companyInterviews.loading);

  // If store is empty (direct URL access), fetch a batch large enough to find the record
  useEffect(() => {
    if (interviews.length === 0) {
      dispatch(fetchCompanyInterviews({ page: 1, limit: 100 }));
    }
  }, [dispatch, interviews.length]);

  const assessment = interviews.find((a) => a._id === id);

  const handleBack = () => router.push("/company/interviews");

  if (loading && !assessment) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <CircularProgress sx={{ color: "#8310FF" }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (!assessment) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <Typography color="text.secondary">Interview not found.</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <InterviewDetail assessment={assessment} onBack={handleBack} />
    </DashboardLayout>
  );
};

export default InterviewDetailPage;
