import React from "react";
import { Box, Stack, Typography, Avatar, Button, Card } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";

type WelcomeHeaderProps = {
  profile: any;
  quota: number;
  onStartTest: () => void;
  onHrInterview: () => void;
  onCvBuilder: () => void;
};

export default function WelcomeHeader({ profile, quota, onStartTest, onHrInterview, onCvBuilder }: WelcomeHeaderProps) {
  return (
    <Card
      sx={{
        mb: 4,
        padding: 4,
        borderRadius: 6,
        border: "1px solid #E0E0E0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        background: "#ffffff",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 4,
        alignItems: "flex-start",
        maxWidth: "100%",
      }}
    >
      {/* Left Section - Welcome and User Info (2/3 width) */}
      <Box sx={{ flex: 2, width: "100%" }}>
        {/* Welcome Header */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "#000000",
            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
            mb: 1,
            lineHeight: 1.2,
          }}
        >
          Welcome back, {profile?.userId?.FirstName && profile?.userId?.LastName 
            ? `${profile.userId.FirstName} ${profile.userId.LastName}` 
            :  profile?.userId?.username || "User"}
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: "#000000",
            fontSize: { xs: "1rem", sm: "1.125rem" },
            mb: 3,
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          Ready to continue your journey? Let's make today productive!
        </Typography>

        {/* User Information - Horizontal Layout */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 3 }, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon sx={{ color: "#8310FF", fontSize: "1.2rem" }} />
            <Typography
              variant="body2"
              sx={{
                color: "#000000",
                fontSize: "0.875rem",
                fontWeight: 400,
              }}
            >
              {profile?.userId?.FirstName && profile?.userId?.LastName 
                ? `${profile.userId.FirstName} ${profile.userId.LastName}` 
                : profile?.userId?.username || "User"}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon sx={{ color: "#8310FF", fontSize: "1.2rem" }} />
            <Typography
              variant="body2"
              sx={{
                color: "#000000",
                fontSize: "0.875rem",
                fontWeight: 400,
              }}
            >
              {profile?.userId?.email || "ahmed@mail.com"}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon sx={{ color: "#8310FF", fontSize: "1.2rem" }} />
            <Typography
              variant="body2"
              sx={{
                color: "#000000",
                fontSize: "0.875rem",
                fontWeight: 400,
              }}
            >
              {profile?.userId?.createdAt 
                ? new Date(profile.userId.createdAt).toLocaleDateString("en-US", { 
                    month: "long", 
                    day: "numeric", 
                    year: "numeric" 
                  })
                : "June 10, 2025"
              }
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons - Horizontal Layout */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onStartTest}
            disabled={quota >= 5}
            sx={{
              background: "linear-gradient(90deg, #8310FF 0%, #6B0BC7 100%)",
              color: "#ffffff",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              minWidth: { xs: "100%", sm: "140px" },
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                background: "linear-gradient(90deg, #6B0BC7 0%, #5A0A9E 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(131, 16, 255, 0.3)",
              },
              "&:disabled": {
                background: "#CCCCCC",
                color: "#888888",
              },
            }}
          >
            Start Test
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={onHrInterview}
            disabled={quota >= 5}
            sx={{
              borderColor: "#000000",
              color: "#000000",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              minWidth: { xs: "100%", sm: "160px" },
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                borderColor: "#333333",
                background: "rgba(0, 0, 0, 0.04)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                borderColor: "#CCCCCC",
                color: "#888888",
              },
            }}
          >
            HR Interview Test
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
            onClick={onCvBuilder}
            sx={{
              borderColor: "#000000",
              color: "#000000",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              minWidth: { xs: "100%", sm: "120px" },
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                borderColor: "#333333",
                background: "rgba(0, 0, 0, 0.04)",
                transform: "translateY(-1px)",
              },
            }}
          >
            CV Builder
          </Button>
        </Stack>
      </Box>

      {/* Right Section - Progress Cards (1/3 width) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
          minWidth: { xs: "100%", lg: "200px" },
        }}
      >
        {/* Tasks Completed Card */}
        <Card
          sx={{
            padding: 3,
            borderRadius: 3,
            background: "#ffffff",
            border: "1px solid #E0E0E0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#000000",
              fontSize: { xs: "1.75rem", sm: "2rem" },
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {`${quota || 0}/5`}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#000000",
              fontSize: "0.875rem",
              fontWeight: 400,
            }}
          >
            Tasks completed
          </Typography>
        </Card>

        {/* Experience Level Card */}
        <Card
          sx={{
            padding: 3,
            borderRadius: 3,
            background: "#ffffff",
            border: "1px solid #E0E0E0",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#000000",
              fontSize: { xs: "1.75rem", sm: "2rem" },
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            {profile?.requiredExperienceLevel || "Beginner"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#000000",
              fontSize: "0.875rem",
              fontWeight: 400,
            }}
          >
            Experience Level
          </Typography>
        </Card>
      </Box>
    </Card>
  );
}


