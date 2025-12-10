import CreatePostStepper from "@/components/posts/create/CreatePostStepper";
import RecruitmentFlowBuilder from "@/components/posts/RecruitmentFlowBuilder";
import React from "react";
import HeaderDashboard from "@/components/HeaderDashboard";
import { Box, Container } from "@mui/material";

const CreateJobPage: React.FC = () => {
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
