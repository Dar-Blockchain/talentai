import React from "react";
import { Box, Stack, Typography, Avatar, Button } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";

type WelcomeHeaderProps = {
  profile: any;
  quota: number;
  onStartTest: () => void;
  onHrInterview: () => void;
  onCvBuilder: () => void;
};

export default function WelcomeHeader({ profile, quota, onStartTest, onHrInterview, onCvBuilder }: WelcomeHeaderProps) {
  return (
    <>
      {/* Welcome Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 3, lg: 4 },
        }}
      >
        {/* Left side - Welcome message and user info */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 3 }}>
          {/* User Avatar */}
          <Avatar
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              fontWeight: 700,
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
            }}
          >
            {profile?.userId?.username?.[0] || profile?.userId?.email?.[0] || "U"}
          </Avatar>

          {/* Welcome Text */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: "#1a1a1a",
                fontSize: { xs: "1.75rem", sm: "2.125rem", md: "2.5rem", lg: "3rem" },
                lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
              }}
            >
              {`Welcome back, ${profile?.userId?.username || "User"}!`}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#666666",
                fontWeight: 400,
                fontSize: { xs: "1rem", sm: "1.125rem" },
                mb: 1,
              }}
            >
              Ready to continue your journey? Let's make today productive!
            </Typography>

            {/* Role and Member Since Info */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon sx={{ color: "#667eea", fontSize: "1.2rem" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666666",
                    fontWeight: 500,
                  }}
                >
                  {profile?.userId?.role || "Member"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: "#667eea", fontSize: "1.2rem" }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666666",
                    fontWeight: 500,
                  }}
                >
                  {`Member since ${profile?.userId?.createdAt ? new Date(profile.userId.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right side - Quick Stats */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "row", sm: "column" },
            gap: 2,
            minWidth: { xs: "auto", sm: 200 },
          }}
        >
          {/* Tests Completed */}
          <Box
            sx={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: 2,
              textAlign: "center",
              border: "1px solid #e9ecef",
              minWidth: { xs: 120, sm: 140 },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {`${quota || 0}/5`}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666666",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 500,
              }}
            >
              Tests Completed
            </Typography>
          </Box>

          {/* Experience Level */}
          <Box
            sx={{
              background: "#f8f9fa",
              borderRadius: "12px",
              padding: 2,
              textAlign: "center",
              border: "1px solid #e9ecef",
              minWidth: { xs: 120, sm: 140 },
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                fontSize: { xs: "1.5rem", sm: "2rem" },
              }}
            >
              {profile?.requiredExperienceLevel || "Beginner"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666666",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 500,
              }}
            >
              Experience Level
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 2 }}
        sx={{
          mt: 4,
          "& .MuiButton-root": {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#ffffff",
            fontWeight: 600,
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
            },
          },
        }}
      >
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onStartTest}
          disabled={quota >= 5}
          sx={{
            background: quota >= 5
              ? "rgba(128,128,128,0.3)"
              : "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)",
            color: quota >= 5 ? "#888888" : "#ffffff",
            width: { xs: "100%", sm: "auto" },
            cursor: quota >= 5 ? "not-allowed" : "pointer",
            border: "1px solid rgba(255,255,255,0.2)",
            "&:hover": {
              background: quota >= 5
                ? "rgba(128,128,128,0.3)"
                : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.3) 100%)",
            },
            "&.Mui-disabled": {
              background: "rgba(128,128,128,0.3)",
              color: "#888888",
              cursor: "not-allowed",
            },
          }}
        >
          Technical/Soft Test
        </Button>
        <Button
          variant="contained"
          startIcon={<PersonIcon />}
          onClick={onHrInterview}
          disabled={quota >= 5}
          sx={{
            background: quota >= 5
              ? "linear-gradient(135deg, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0.2) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)",
            color: quota >= 5 ? "#888888" : "#ffffff",
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              background: quota >= 5
                ? "linear-gradient(135deg, rgba(128,128,128,0.3) 0%, rgba(128,128,128,0.2) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.3) 100%)",
            },
            "&:disabled": {
              cursor: "not-allowed",
            },
          }}
        >
          HR Test
        </Button>
        <Button
          variant="outlined"
          startIcon={<DescriptionIcon />}
          onClick={onCvBuilder}
          sx={{
            borderColor: "rgba(255,255,255,0.3)",
            color: "#ffffff",
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              borderColor: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          CV Builder
        </Button>
      </Stack>
    </>
  );
}


