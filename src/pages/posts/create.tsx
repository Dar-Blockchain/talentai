"use client";
import React, { useEffect, useState } from "react";
import HeaderDashboard from "@/components/HeaderDashboard";
import CreatePostStepper from "@/components/posts/create/CreatePostStepper";
import { Box, Container } from "@mui/material";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { resetCreateConfig } from "@/store/slices/agentConfigSlice";

const CreateJobPage: React.FC = () => {
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
        <HeaderDashboard />
        <CreatePostStepper />
      </Container>
    </Box>
  );
};

export default CreateJobPage;
