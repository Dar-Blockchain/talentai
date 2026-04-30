import React, { useState } from "react";
import { Box, Typography, Avatar, Button, Stack, Chip } from "@mui/material";
import PlayArrowOutlined from "@mui/icons-material/PlayArrowOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import AssessmentModal from "./AssessmentModal";
import { RootState } from "@/store/store";

const T  = "#0D9488";
const TL = "#14B8A6";
const TBG = "#F0FDFA";
const TBORDER = "#99F6E4";

const WelcomeHeader = () => {
  const router = useRouter();
  const { user, profile } = useSelector((state: RootState) => state.user.connectedUser);
  const quota = profile?.quota || 0;
  const [testModalOpen, setTestModalOpen] = useState(false);

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";

  const initial = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : undefined;

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <Box sx={{
      bgcolor: "#fff",
      borderRadius: "14px",
      border: "1px solid #E5E7EB",
      overflow: "hidden",
    }}>
      {/* Teal accent bar */}
      <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T}, ${TL})` }} />

      <Box sx={{
        display: "flex", flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        gap: 3, px: 3, py: 2.5,
      }}>
        {/* Left — avatar + info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Avatar
            src={avatarUrl}
            sx={{ width: 56, height: 56, bgcolor: T, fontSize: "1.25rem", fontWeight: 700, flexShrink: 0 }}
          >
            {initial}
          </Avatar>

          <Box>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              Welcome back, {displayName} 👋
            </Typography>
            <Typography sx={{ fontSize: "12.5px", color: "#6B7280", mt: 0.25 }}>
              Ready to continue your journey? Let's make today productive!
            </Typography>

            {/* Meta chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
              {user?.email && (
                <Chip icon={<EmailOutlined sx={{ fontSize: 13 }} />} label={user.email}
                  size="small" sx={{ fontSize: "11px", height: 22, bgcolor: TBG, border: `1px solid ${TBORDER}`, color: T, "& .MuiChip-icon": { color: T } }} />
              )}
              {joinDate && (
                <Chip icon={<CalendarTodayOutlined sx={{ fontSize: 13 }} />} label={`Joined ${joinDate}`}
                  size="small" sx={{ fontSize: "11px", height: 22, bgcolor: TBG, border: `1px solid ${TBORDER}`, color: T, "& .MuiChip-icon": { color: T } }} />
              )}
              {profile?.targetRole && (
                <Chip icon={<WorkOutlined sx={{ fontSize: 13 }} />} label={profile.targetRole}
                  size="small" sx={{ fontSize: "11px", height: 22, bgcolor: TBG, border: `1px solid ${TBORDER}`, color: T, "& .MuiChip-icon": { color: T } }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Right — stat cards + actions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: { xs: "flex-start", md: "flex-end" } }}>
          {/* Stat cards */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{
              px: 2, py: 1.5, borderRadius: "10px",
              bgcolor: TBG, border: `1px solid ${TBORDER}`,
              textAlign: "center", minWidth: 90,
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.25 }}>
                <QuizOutlined sx={{ fontSize: 14, color: T }} />
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: T, lineHeight: 1 }}>
                  {quota}/5
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "10.5px", color: "#6B7280", fontWeight: 500 }}>Tests Passed</Typography>
            </Box>

            <Box sx={{
              px: 2, py: 1.5, borderRadius: "10px",
              bgcolor: TBG, border: `1px solid ${TBORDER}`,
              textAlign: "center", minWidth: 110,
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.25 }}>
                <SchoolOutlined sx={{ fontSize: 14, color: T }} />
                <Typography sx={{ fontSize: "14px", fontWeight: 700, color: T, lineHeight: 1 }}>
                  {profile?.requiredExperienceLevel || "Beginner"}
                </Typography>
              </Box>
              <Typography sx={{ fontSize: "10.5px", color: "#6B7280", fontWeight: 500 }}>Experience Level</Typography>
            </Box>
          </Box>

          {/* Action buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PlayArrowOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setTestModalOpen(true)}
              disabled
              sx={{
                bgcolor: T, color: "#fff", fontWeight: 600, borderRadius: "8px",
                textTransform: "none", fontSize: "12.5px", px: 2,
                "&:hover": { bgcolor: TL },
                "&:disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF" },
              }}
            >
              Start Test
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Image src="/icons/cv.svg" alt="cv" width={13} height={13} />}
              onClick={() => {
                const level = profile?.requiredExperienceLevel || "Mid-Level";
                const role  = profile?.targetRole || "Software Engineer";
                router.push(`/interview/hr?type=hr&role=${encodeURIComponent(role)}&proficiency=${encodeURIComponent(level)}`);
              }}
              disabled
              sx={{
                borderColor: "#D1D5DB", color: "#374151", fontWeight: 600,
                borderRadius: "8px", textTransform: "none", fontSize: "12.5px", px: 2,
                "&:hover": { borderColor: T, color: T },
                "&:disabled": { borderColor: "#E5E7EB", color: "#9CA3AF" },
              }}
            >
              HR Interview
            </Button>
          </Stack>
        </Box>
      </Box>

      <AssessmentModal open={testModalOpen} onClose={() => setTestModalOpen(false)} />
    </Box>
  );
};

export default WelcomeHeader;
