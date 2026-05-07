import React from "react";
import { Box, Typography, Card, Chip, Button, Stack } from "@mui/material";
import {
  Verified as VerifiedIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Work as WorkIcon,
  BusinessCenter as BusinessCenterIcon,
} from "@mui/icons-material";

const CandidateRewardsSection: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#000",
        color: "#fff",
        py: { xs: 6, md: 10 },
        px: 3,
      }}
    >
      {/* Title */}
      <Typography
        variant="h2"
        align="center"
        sx={{
          color: "rgba(204, 204, 204, 1)",
          fontWeight: 700,
          fontSize: { xs: "28px", sm: "36px", md: "48px" },
          mb: 3,
        }}
      >
        Your Skills, Verified and Rewarded
      </Typography>

      <Typography
        variant="h6"
        align="center"
        sx={{
          color: "#888",
          mb: 8,
          maxWidth: 800,
          mx: "auto",
          fontSize: { xs: "14px", sm: "16px", md: "18px" },
        }}
      >
        Build your professional profile with blockchain-verified credentials.
        Every interview earns tokens and increases your visibility to top
        employers.
      </Typography>

      {/* 3-Column Reward Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 4,
          maxWidth: 1200,
          mx: "auto",
          mb: 8,
        }}
      >
        {/* Card 1: TAI Tokens */}
        <Card
          sx={{
            p: 5,
            background: "rgba(131, 16, 255, 0.05)",
            border: "2px solid rgba(131, 16, 255, 0.2)",
            borderRadius: 2,
            textAlign: "center",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(131, 16, 255, 0.25)",
              borderColor: "rgba(131, 16, 255, 0.4)",
            },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#8310FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <AccountBalanceWalletIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#fff" mb={2}>
            Token Rewards
          </Typography>
          <Typography variant="body1" color="#888" mb={3}>
            Every interview completed earns you up to 33.33 TAI tokens based on
            your score.
          </Typography>
          <Box
            sx={{
              background: "rgba(131, 16, 255, 0.15)",
              p: 2,
              borderRadius: 2,
              border: "1px solid rgba(131, 16, 255, 0.3)",
            }}
          >
            <Typography variant="h4" fontWeight={700} color="#A855F7">
              Up to 33.33 TAI
            </Typography>
            <Typography variant="caption" color="#888">
              Per interview • Score-based
            </Typography>
          </Box>
        </Card>

        {/* Card 2: Verified Badges */}
        <Card
          sx={{
            p: 5,
            background: "rgba(131, 16, 255, 0.05)",
            border: "2px solid rgba(131, 16, 255, 0.2)",
            borderRadius: 2,
            textAlign: "center",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(131, 16, 255, 0.25)",
              borderColor: "rgba(131, 16, 255, 0.4)",
            },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#8310FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <VerifiedIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#fff" mb={2}>
            Blockchain Verification
          </Typography>
          <Typography variant="body1" color="#888" mb={3}>
            Receive blockchain-verified skill badges you can share on LinkedIn
            and your resume.
          </Typography>
          <Stack spacing={1} alignItems="center">
            <Chip
              icon={<VerifiedIcon sx={{ color: "#A855F7 !important" }} />}
              label="JavaScript Verified"
              sx={{
                bgcolor: "rgba(131, 16, 255, 0.15)",
                color: "#A855F7",
                fontWeight: 600,
                width: "100%",
                justifyContent: "flex-start",
                "& .MuiChip-icon": { color: "#A855F7" },
              }}
            />
            <Chip
              icon={<VerifiedIcon sx={{ color: "#A855F7 !important" }} />}
              label="React Verified"
              sx={{
                bgcolor: "rgba(131, 16, 255, 0.15)",
                color: "#A855F7",
                fontWeight: 600,
                width: "100%",
                justifyContent: "flex-start",
                "& .MuiChip-icon": { color: "#A855F7" },
              }}
            />
            <Chip
              icon={<VerifiedIcon sx={{ color: "#A855F7 !important" }} />}
              label="Python Verified"
              sx={{
                bgcolor: "rgba(131, 16, 255, 0.15)",
                color: "#A855F7",
                fontWeight: 600,
                width: "100%",
                justifyContent: "flex-start",
                "& .MuiChip-icon": { color: "#A855F7" },
              }}
            />
          </Stack>
        </Card>

        {/* Card 3: Career Opportunities */}
        <Card
          sx={{
            p: 5,
            background: "rgba(131, 16, 255, 0.05)",
            border: "2px solid rgba(131, 16, 255, 0.2)",
            borderRadius: 2,
            textAlign: "center",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 20px 40px rgba(131, 16, 255, 0.25)",
              borderColor: "rgba(131, 16, 255, 0.4)",
            },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#8310FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 32, color: "#fff" }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="#fff" mb={2}>
            Career Advancement
          </Typography>
          <Typography variant="body1" color="#888" mb={3}>
            Higher scores = Better visibility. Companies find you based on
            verified skills.
          </Typography>
          <Box sx={{ textAlign: "left" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "rgba(131, 16, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 24, color: "#A855F7" }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="#fff" fontWeight={600}>
                  Global Ranking
                </Typography>
                <Typography variant="caption" color="#888">
                  Top performers get noticed
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "rgba(131, 16, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WorkIcon sx={{ fontSize: 24, color: "#A855F7" }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="#fff" fontWeight={600}>
                  Direct Job Matches
                </Typography>
                <Typography variant="caption" color="#888">
                  Companies request interviews
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "rgba(131, 16, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BusinessCenterIcon sx={{ fontSize: 24, color: "#A855F7" }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="#fff" fontWeight={600}>
                  Profile Visibility
                </Typography>
                <Typography variant="caption" color="#888">
                  Share verified credentials
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Bottom CTA */}
      <Box sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h4" fontWeight={700} color="#fff" mb={3}>
          Ready to Get Verified?
        </Typography>
        <Typography variant="body1" color="#888" mb={4}>
          Join professionals who've verified their skills and advanced their
          careers
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="/candidate/profile/settings"
          sx={{
            background: "linear-gradient(135deg, #8310FF 0%, #A855F7 100%)",
            color: "#fff",
            px: 6,
            py: 2,
            fontSize: "1.1rem",
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "none",
            boxShadow: "0 8px 24px rgba(131, 16, 255, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #6D0DD9 0%, #8B5CF6 100%)",
              transform: "translateY(-2px)",
              boxShadow: "0 12px 32px rgba(131, 16, 255, 0.5)",
            },
          }}
        >
          Start Building Your Profile
        </Button>
      </Box>
    </Box>
  );
};

export default CandidateRewardsSection;
