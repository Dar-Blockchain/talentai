import React from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import { Box, Typography } from "@mui/material";
import dynamic from "next/dynamic";

const EmployeeDashboard: React.FC = () => {
  return (
    <PageContainer>
      <Header />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
          Employee Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Welcome to your employee portal.
        </Typography>
      </Box>
    </PageContainer>
  );
};

export default dynamic(() => Promise.resolve(EmployeeDashboard), {
  ssr: false,
});
