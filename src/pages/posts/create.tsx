import CreatePostStepper from "@/components/posts/create/CreatePostStepper";
import RecruitmentFlowBuilder from "@/components/posts/RecruitmentFlowBuilder";
import React, { useEffect } from "react";
import HeaderDashboard from "@/components/HeaderDashboard";
import { Box, Container } from "@mui/material";
import { AppDispatch } from '@/store/store';
import { useDispatch } from "react-redux";
import { resetCreateConfig } from "@/store/slices/agentConfigSlice";

const CreateJobPage: React.FC = () => {
  
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    return () => {
      dispatch(resetCreateConfig());
    }
  }, []);

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
