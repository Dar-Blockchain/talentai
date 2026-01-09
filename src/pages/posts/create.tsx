"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container, Alert, CircularProgress } from "@mui/material";
import { AppDispatch, RootState } from "@/store/store";
import { resetCreateConfig } from "@/store/slices/agentConfigSlice";
import { clearPost, selectCreationType } from "@/store/slices/postGenerationSlice";
import JobPostCreationMethod from "@/components/posts/create/JobPostCreationMethod";
import Header from "@/components/layout/Header";
import CreatePostStepper from "@/components/posts/create/CreatePostStepper";
import { resetManualPost } from "@/store/slices/manualPostSlice";
import { resetFlow, resetSavePost } from "@/store/slices/postSlice";
import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/router";

const CreateJobPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const creationType = useSelector(selectCreationType);
  const profile = useSelector((state: RootState) => state.profile.profile);

  // Get user permissions
  const userId = profile?.userId?._id;
  const profileId = profile?._id;
  const { hasPermission, loading: loadingPermissions } = usePermissions(userId, profileId);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return () => {
      dispatch(resetCreateConfig());
      dispatch(clearPost())
      dispatch(resetManualPost())
      dispatch(resetFlow())
      dispatch(resetSavePost())
    };
  }, []);

  // Check permission and redirect if not authorized
  useEffect(() => {
    if (mounted && !loadingPermissions && !hasPermission('canCreateJobPosts')) {
      router.push('/dashboard/company');
    }
  }, [mounted, loadingPermissions, hasPermission, router]);

  if (!mounted) return null;

  // Show loading while checking permissions
  if (loadingPermissions) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgba(251, 254, 255, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error if no permission
  if (!hasPermission('canCreateJobPosts')) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "rgba(251, 254, 255, 1)",
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Header />
          <Alert severity="error" sx={{ mt: 4 }}>
            You don't have permission to create job posts. Please contact your administrator.
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "rgba(251, 254, 255, 1)",
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Header />
        {!creationType && <JobPostCreationMethod/>}
        {creationType && <CreatePostStepper />}
      </Container>
    </Box>
  );
};

export default CreateJobPage;
