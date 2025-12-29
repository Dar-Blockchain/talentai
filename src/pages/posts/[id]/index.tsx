import React, { useEffect, useMemo } from "react";
import { AppDispatch, RootState } from "@/store/store";
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
import EditPostDetails from "@/components/posts/edit/EditPostDetails";
import EditRecruitmentFlow from "@/components/posts/edit/EditRecruitmentFlow";
import EditAgentConfiguration from "@/components/posts/edit/EditAgentConfiguration";
import { getMyProfile, selectProfile } from "@/store/slices/profileSlice";
const PostDetails: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = router.query;
  const connectedUser = useSelector((state: RootState) => state.auth.user);

  const job = useSelector(selectCurrentJob);
  const loading = useSelector(selectCurrentJobLoading);
  const error = useSelector(selectCurrentJobError);

  const [activeEdit, setActiveEdit] = React.useState<
    "post" | "recruitment" | "agent" | null
  >(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id as string));
    }
  }, [id, dispatch]);

  const isOwner = useMemo(() => {
    if (!job || !connectedUser) return false;

    return job.user?._id === connectedUser._id;
  }, [job, connectedUser]);

  const handleCancelEdit = () => setActiveEdit(null);

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

        <Button
          startIcon={
            <ArrowBack
              sx={{ color: "#10b981", transition: "transform 0.2s easeIn" }}
            />
          }
          onClick={() => router.back()}
          sx={{
            mt: 2,
            textTransform: "none",
            px: 0,
            color: "#111827",
            "&:hover": { background: "transparent", transform: "scale(1.05)" },
          }}
        >
          Back
        </Button>

        {loading && (
          <Loader
            title="Loading job details…"
            subtitle="Please wait while we load the job information."
          />
        )}
        {!loading && error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error || "Failed to load job details."}
          </Alert>
        )}

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
            {activeEdit === "post" && (
              <EditPostDetails onCancel={handleCancelEdit} />
            )}
            {activeEdit === "recruitment" && (
              <EditRecruitmentFlow onCancel={handleCancelEdit} />
            )}
            {activeEdit === "agent" && (
              <EditAgentConfiguration onCancel={handleCancelEdit} />
            )}

            {activeEdit === null && (
              <>
                <PostBasicDetails
                  onEdit={() => setActiveEdit("post")}
                  canEdit={isOwner}
                />

                <RecruitmentFlowDetails
                  onEdit={() => setActiveEdit("recruitment")}
                  canEdit={isOwner}
                />

                {isOwner && (
                  <AgentConfigurationDetails
                    onEdit={() => setActiveEdit("agent")}
                  />
                )}
              </>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PostDetails;