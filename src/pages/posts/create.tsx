"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Container } from "@mui/material";
import { AppDispatch } from "@/store/store";
import { resetCreateConfig } from "@/store/slices/agentConfigSlice";
import { selectCreationType } from "@/store/slices/postGenerationSlice";
import JobPostCreationMethod from "@/components/posts/create/JobPostCreationMethod";
import HeaderDashboard from "@/components/HeaderDashboard";
import CreatePostStepper from "@/components/posts/create/CreatePostStepper";

const CreateJobPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const creationType = useSelector(selectCreationType)

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return () => {
      dispatch(resetCreateConfig());
    };
  }, []);
  if (!mounted) return null;

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
        {!creationType && <JobPostCreationMethod/>}
        {creationType && <CreatePostStepper />}
      </Container>
    </Box>
  );
};

export default CreateJobPage;
