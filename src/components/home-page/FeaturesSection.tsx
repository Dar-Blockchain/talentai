import React from "react";
import { Box, Typography, Stack, useMediaQuery, useTheme } from "@mui/material";
import FeatureCard from "./components/FeatureCard";
import RobotIcon from "../icons/RobotIcon";
import ThunderIcon from "../icons/ThunderIcon";
import ChartIcon from "../icons/ChartIcon";
import UsersIcon from "../icons/UsersIcon";
import VerifiedIcon from "../icons/VerifiedIcon";
import DiplomaIcon from "../icons/DiplomaIcon";
import StandOutIcon from "../icons/StandOutIcon";
import TokenIcon from "../icons/TokenIcon";
const featuresJobSeeker = [
  {
    icon: <VerifiedIcon />,
    title: (
      <>
        Get Verified,  <br /> Not Just Judged
      </>
    ),
    description:
      "Our advanced algorithms analyze thousands of data points to find the perfect match for your open positions.",
  },
  {
    icon: <DiplomaIcon />,
    title: "Own Your Credentials",
    description:
      "Save hours of manual work with our intelligent resume screening and initial candidate assessment.",
  },
  {
    icon: <StandOutIcon />,
    title: (
      <>
        Stand Out   <br /> to the Right Companies
      </>
    ), description:
      "Make data-driven hiring decisions with our predictive analytics and performance insights.",
  },
  {
    icon: <TokenIcon />,
    title: "Earn Talent Tokens",
    description:
      "Get rewarded for completing interviews, learning new skills, and staying active.",
  },
];
const features = [
  {
    icon: <RobotIcon />,
    title: (
      <>
        AI-Powered <br /> Candidate Matching
      </>
    ),
    description:
      "Our advanced algorithms analyze thousands of data points to find the perfect match for your open positions.",
  },
  {
    icon: <ThunderIcon />,
    title: "Automated Screening",
    description:
      "Save hours of manual work with our intelligent resume screening and initial candidate assessment.",
  },
  {
    icon: <ChartIcon />,
    title: "Predictive Analytics",
    description:
      "Make data-driven hiring decisions with our predictive analytics and performance insights.",
  },
  {
    icon: <UsersIcon />,
    title: "Collaborative Hiring",
    description:
      "Streamline your hiring process with real-time collaboration tools for your entire team.",
  },
];

type FeaturesSectionProps = {
  type?: "company" | "jobseeker";
  color?: string;
};

const FeaturesSection = ({ type, color }: FeaturesSectionProps) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const itemWidth = isMdUp ? "23%" : isSmUp ? "48%" : "100%";

  return (
    <Box
      id="features"
      sx={{
        px: 3,
        py: { xs: 3, sm: 4, md: 5 },
        backgroundColor: "#ffffff",
        color: "#000000",
      }}
    >
      <Typography
        variant="h3"
        fontWeight={600}
        gutterBottom
        sx={{
          fontSize: 'clamp(1rem, 7vw, 3.25rem)',
          lineHeight: 1.3,
          mb: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {type === "company" ? "Hiring is broken" : "WHY"}
          {type === "jobseeker" && (
            <>
              <Box
                component="img"
                src={type as "company" | "jobseeker" === "company" ? "/logo.svg" : "/logojobSeeker.svg"}
                alt="TalentAI Logo"
                sx={{
                  height: "1em",
                  display: "inline-block",
                }}
              />
              <Typography
                variant="h3"
                fontWeight={600}
                sx={{
                  fontSize: 'clamp(1rem, 7vw, 3.25rem)',
                  lineHeight: 1.3,
                  mb: 0,
                }}
              >
                ?
              </Typography>
            </>)}
          {type === "company" && (
            <>
              <Box
                component="span"
                sx={{
                  width: "0.2em",
                  height: "0.2em",
                  backgroundColor: "rgba(0, 255, 157, 1)",
                  borderRadius: "50%",
                  display: "inline-block",
                  mx: "0.25rem",
                }}
              />
              We're fixing it
              <Box
                component="span"
                sx={{
                  width: "0.2em",
                  height: "0.2em",
                  backgroundColor: "rgba(0, 255, 157, 1)",
                  borderRadius: "50%",
                  display: "inline-block",
                  mx: "0.25rem",
                }}
              />{" "}
            </>
          )}
        </Box>


      </Typography>

      <Typography
        variant="body1"
        color="#000000"
        sx={{
          my: { xs: 2, md: 2 },
          fontSize: { xs: "0.95rem", sm: "1rem" },
        }}
      >
        {type === "jobseeker" ? `Traditional resumes don't tell your full story—TalentAI does` : `From Job Description to Offer — Powered by AI, Verified on Blockchain`}
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        justifyContent="space-between"
        useFlexGap
        sx={{ pt: 2 }}
      >
        {type === "jobseeker" ? featuresJobSeeker.map((feature, index) => (
          <Stack key={index} sx={{ width: itemWidth }}>
            <FeatureCard
              type="jobseeker"
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </Stack>
        )) : features.map((feature, index) => (
          <Stack key={index} sx={{ width: itemWidth }}>
            <FeatureCard
              type="company"
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default FeaturesSection;
