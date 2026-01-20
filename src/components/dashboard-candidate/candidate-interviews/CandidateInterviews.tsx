import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Stack } from "@mui/material";
import dynamic from "next/dynamic";
import PostInterviews from "./PostInterviews";

const INTERVIEW_TYPES = [
  {
    label: "Applications",
    value: "application",
  },
  {
    label: "Technical Skills",
    value: "technical",
  },
  {
    label: "Soft Skills",
    value: "soft",
  },
];

const CandidateInterviews = () => {
  const [tab, setTab] = useState("application");

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
  };

  return (
    <Box
      sx={{
        px: 5,
        py: 3,
        mb: 2,
        color: "#000",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        backgroundColor: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: "#000000",
          fontSize: "20px",
          mb: 3,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-4px",
            left: 0,
            width: "38px",
            height: "5px",
            background: "#8310FF",
            borderRadius: "2px",
          },
        }}
      >
        Interviews & Skills assessments
      </Typography>
      <Box>
        <Box
          sx={{
            mb: 4,
            backgroundColor: "rgba(250, 246, 255, 1)",
            borderRadius: "12px",
            px: 1,
            height: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, newValue) => handleTabChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              width: "100%",
              "& .MuiTab-root": {
                flex: 1,
                mr: 1,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "16px",
                borderRadius: "12px",
                height: 45,
                color: "rgba(189, 133, 255, 1)",
                transition: "all 0.3s ease",
                backgroundColor: "rgba(244, 235, 255, 1)",
                "&:hover": {
                  backgroundColor: "rgba(189, 133, 255, 1)",
                  color: "white",
                },
                "&.Mui-selected": {
                  color: "white",
                  backgroundColor: "rgba(189, 133, 255, 1)",
                },
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            {INTERVIEW_TYPES.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t.label}
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>
        {tab === "application" && <PostInterviews/>}
        {tab === "technical" && <PostInterviews/>}
        {tab === "soft" && <PostInterviews/>}
      </Box>
    </Box>
  );
}
// Export with dynamic import to prevent SSR issues
export default dynamic(() => Promise.resolve(CandidateInterviews), {
  ssr: false
});