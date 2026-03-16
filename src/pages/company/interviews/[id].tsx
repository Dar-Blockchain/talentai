import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import InterviewDetail from "@/components/features/company/interviews/details/InterviewDetail";
import { AppDispatch, RootState } from "@/store/store";
import { fetchInterviewById } from "@/store/slices/interviewSlice";

const InterviewDetailPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const { data: assessment, loading, error } = useSelector(
    (s: RootState) => s.interview.interviewDetail
  );

  useEffect(() => {
    if (!router.isReady || !id) return;
    dispatch(fetchInterviewById(id as string));
  }, [router.isReady, id, dispatch]);

  const handleBack = () => router.push("/company/interviews");

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <CircularProgress sx={{ color: "#8310FF" }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !assessment) {
    return (
      <DashboardLayout>
        <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
          <Typography color="text.secondary">
            {error || "Interview not found."}
          </Typography>
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
