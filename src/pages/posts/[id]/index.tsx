import React, { useEffect } from "react";
import { AppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchJobById,
  selectCurrentJob,
  selectCurrentJobError,
  selectCurrentJobLoading,
} from "@/store/slices/postSlice";
import { Box, Button, Container, Alert } from "@mui/material";
import HeaderDashboard from "@/components/layout/HeaderDashboard";
import { ArrowBack } from "@mui/icons-material";
import PostBasicDetails from "@/components/posts/details/PostBasicDetails";
import RecruitmentFlowDetails from "@/components/posts/details/RecruitmentFlowDetails";
import AgentConfigurationDetails from "@/components/posts/details/AgentConfigurationDetails";
import Loader from "@/components/ui/Loader";

const PostDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = router.query;

  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id as string));
    }
  }, [id, dispatch]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "rgba(251, 254, 255, 1)",
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <HeaderDashboard />

        {/* Back button */}
        <Button
          startIcon={
            <ArrowBack
              sx={{
                color: "#10b981",
                transition: "transform 0.2s easeIn",
              }}
            />
          }
          onClick={() => router.back()}
          sx={{
            mt: 2,
            textTransform: "none",
            px: 0,
            color: "#111827",
            "&:hover": {
              background: "transparent",
              transform: "scale(1.05)",
            },
          }}
        >
          Back
        </Button>

        {/* Loading */}
        {loading && (
          <Loader
            title="Loading job details…"
            subtitle="Please wait while we load the job information."
          />
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error || "Failed to load job details."}
          </Alert>
        )}

        {/* Success */}
        {!loading && !error && job && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2,
              mt: 2,
              border: "1px solid rgba(238, 240, 242, 1)",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 1)",
            }}
          >
            <PostBasicDetails />
            <RecruitmentFlowDetails />
            <AgentConfigurationDetails />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PostDetails;