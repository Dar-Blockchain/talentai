import React from "react";
import { Box, Stack, Typography, Avatar, Button, Card } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import Image from "next/image";

type WelcomeHeaderProps = {
  profile: any;
  quota: number;
  onStartTest: () => void;
  onHrInterview: () => void;
};

export default function WelcomeHeader({
  profile,
  quota,
  onStartTest,
  onHrInterview,
}: WelcomeHeaderProps) {
  return (
    <Box
      sx={{
        background: "rgba(255, 255, 255, 1)",
        color: "#000000",
        px: 5,
        py: 3,
        marginBottom: 2,
        position: "relative",
        overflow: "hidden",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 4,
        alignItems: "flex-start",
        maxWidth: "100%",
        justifyContent: "space-between",
      }}
    >
      {/* Left Section - Welcome and User Info (2/3 width) */}
      <Box sx={{ flex: 1 }}>
        {/* Welcome Header */}
        <Typography
          variant="h4"
          sx={{
            color: "#000000",
            fontSize: { xs: "1rem", sm: "1.75rem", md: "2rem" },
            mb: 1,
            lineHeight: 1.2,
            fontFamily: "Poppins",
            fontWeight: 600,
            fontStyle: "normal",
            letterSpacing: "0",
          }}
        >
          Welcome back,{" "}
          {profile?.firstName
            ? `${profile?.firstName}`
            : profile?.userId?.username}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#000000",
            fontSize: "13px",
            mb: 3,
            fontWeight: 400,
            lineHeight: 1.4,
          }}
        >
          Ready to continue your journey? Let's make today productive!
        </Typography>

        {/* User Information - Horizontal Layout */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 3 },
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon
              sx={{ color: "rgba(189, 133, 255, 1)", fontSize: "1.2rem" }}
            />
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
            <EmailIcon
              sx={{ color: "rgba(189, 133, 255, 1)", fontSize: "1.2rem" }}
            />
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

                    {profile?.userId?.createdAt && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon
                sx={{ color: "rgba(189, 133, 255, 1)", fontSize: "1.1rem" }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              >
                {new Date(profile.userId.createdAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </Typography>
            </Box>
          )}

          {profile?.targetRole && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WorkIcon
                sx={{ color: "rgba(189, 133, 255, 1)", fontSize: "1.2rem" }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              >
                {profile.targetRole}
              </Typography>
            </Box>
          )}

          {profile?.requiredExperienceLevel && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SchoolIcon
                sx={{ color: "rgba(189, 133, 255, 1)", fontSize: "1.2rem" }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                }}
              >
                {profile.requiredExperienceLevel}
              </Typography>
            </Box>
          )}


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
              background: "rgba(163, 98, 239, 1)",
              color: "#ffffff",
              fontWeight: 600,
              borderRadius: "38px",
              px: 3,
              py: 1,
              textTransform: "none",
              maxWidth: "230px",
              fontSize: "0.875rem",
              width: "100%",
              "&:hover": {
                background: "rgba(163, 98, 239, 0.8)",
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
            startIcon={<Image src='/icons/cv.svg' alt='cv' width={16} height={16} />}
            onClick={onHrInterview}
            disabled={quota >= 5}
            sx={{
              border: "0.76px solid rgba(25, 25, 25, 1)",
              color: "#000000",
              fontWeight: 600,
              borderRadius: "38px",
              px: 3,
              py: 1,
              maxWidth: "230px",
              width: "100%",
              textTransform: "none",
              fontSize: "0.875rem",
              "&:hover": {
                borderColor: "0.76px solid rgba(25, 25, 25, 1)",
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
        </Stack>
      </Box>

      {/* Right Section - Progress Cards (1/3 width) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {/* Tasks Completed Card */}
        <Box
          sx={{
            padding: 3,
            borderRadius: 3,
            background: "#ffffff",
            boxShadow: "0px 0px 8.7px 0px rgba(0, 0, 0, 0.06)",
            textAlign: "left",
            height: "93px",
            width: "205px",
            border: "1px solid rgba(157, 61, 255, 0.18)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "rgba(56, 68, 85, 1)",
              fontSize: "24px",
              mb: 2,
              lineHeight: "18px",
            }}
          >
            {`${quota || 0}/5`}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(100, 113, 131, 1)",
              fontSize: "17px",
              lineHeight: "18px",
              fontWeight: 400,
            }}
          >
            Tasks completed
          </Typography>
        </Box>

        {/* Experience Level Card */}
        <Box
          sx={{
            padding: 3,
            borderRadius: 3,
            background: "#ffffff",
            boxShadow: "0px 0px 8.7px 0px rgba(0, 0, 0, 0.06)",
            textAlign: "left",
            height: "93px",
            width: "205px",
            border: "1px solid rgba(157, 61, 255, 0.18)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "rgba(56, 68, 85, 1)",
              fontSize: "24px",
              mb: 2,
              lineHeight: "18px",
            }}
          >
            {profile?.requiredExperienceLevel || "Beginner"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(100, 113, 131, 1)",
              fontSize: "17px",
              lineHeight: "18px",
              fontWeight: 400,
            }}
          >
            Experience Level
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
