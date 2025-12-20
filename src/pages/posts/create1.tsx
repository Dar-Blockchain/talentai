"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Box, Container } from "@mui/material";
import { AppDispatch } from "@/store/store";
import { resetCreateConfig } from "@/store/slices/agentConfigSlice";
import RecruitmentFlowBuilder from "@/components/posts/RecruitmentFlowBuilder";

const CreateJobPage1: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);

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
        <RecruitmentFlowBuilder/>
      </Container>
    </Box>
  );
};

export default CreateJobPage1;
