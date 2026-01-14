import React from "react";
import { Box, Typography } from "@mui/material";

const SkillsHeader: React.FC = () => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
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
            Skills & Expertise
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(56, 68, 85, 1)",
              fontSize: "14px",
              mb: 1,
              fontWeight: 500,
            }}
          >
            Showcase your technical and soft skills to potential employers
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(26, 26, 26, 1)",
              fontSize: "16px",
              mb: 1,
              fontWeight: 500,
            }}
          >
            💪 Keep growing your skills
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(56, 68, 85, 1)",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            Start by taking skill assessments to build your profile and track
            your progress
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SkillsHeader;
