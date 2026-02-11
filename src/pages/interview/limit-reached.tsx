"use client";

import { useRouter } from "next/router";
import { Box, Typography, Button } from "@mui/material";
import { BlockOutlined } from "@mui/icons-material";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";

export default function InterviewLimitReached() {
  const router = useRouter();
  const { jobTitle } = router.query;

  return (
    <PageContainer>
      <Header />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          px: 3,
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 152, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <BlockOutlined sx={{ fontSize: 56, color: "#FF9800" }} />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "22px", md: "28px" },
            color: "#111827",
            mb: 2,
          }}
        >
          Interview Temporarily Unavailable
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "14px", md: "16px" },
            color: "rgba(84, 98, 116, 0.8)",
            maxWidth: 500,
            lineHeight: 1.7,
            mb: 1,
          }}
        >
          {jobTitle
            ? `The company posting "${jobTitle}" has reached their monthly interview limit.`
            : "The hiring company has reached their monthly interview limit."}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "13px", md: "14px" },
            color: "rgba(84, 98, 116, 0.53)",
            maxWidth: 460,
            lineHeight: 1.6,
            mb: 5,
          }}
        >
          This interview is temporarily unavailable. Please try again later or
          contact the recruiter for more information.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "38px",
              height: 46,
              px: 4,
              backgroundColor: "rgba(41, 210, 145, 1)",
              color: "#fff",
              "&:hover": {
                backgroundColor: "rgba(41, 210, 145, 0.85)",
              },
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
