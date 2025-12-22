import React from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ConditionIcon from '@mui/icons-material/AccountTree';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import Image from "next/image";
import { ArrowBack } from "@mui/icons-material";
import { useRouter } from "next/router";

const JobPostCreationMethod: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSelectAI = () => {
    dispatch(setCreationType("ai"));
  };

  const handleSelectPipeline = () => {
    dispatch(setCreationType("manual"));
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      <Box sx={{ maxWidth: 900, width: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            mb: 6,
          }}
        >
          {/* Back button (left) */}
          <Button
            startIcon={
              <ArrowBack
                sx={{
                  color: "#10b981",
                  transition: "transform 0.2s easeIn",
                }}
              />
            }
            onClick={() => router.back()}
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              textTransform: "none",
              px: 0,
              color: "#111827",
              "&:hover": {
                background: "transparent",
                transform: "scale(1.05)",
              },
            }}
          >
            Back
          </Button>

          {/* Centered title */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#111827",
                fontSize: '28px'
              }}
            >
              How would you like to create your job post?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#6b7280",
                maxWidth: 600,
                fontSize: '14px'
              }}
            >
              Choose the method that best suits your needs. You can either use AI
              to quickly generate a post or build a custom recruitment pipeline.
            </Typography>
          </Box>
        </Box>

        {/* Options */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          {/* AI Option */}
          <CreationCard
            title="AI-Powered Creation"
            description="Describe your ideal candidate and let AI generate a comprehensive job post with matching configuration in minutes."
            icon={SmartToyIcon}
            accent="#10b981"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            features={[
              "Quick & Easy (2 steps)",
              "AI-generated job description",
              "Automatic candidate matching",
            ]}
            chip={{ label: "Recommended", bg: "#d1fae5", color: "#065f46" }}
            onClick={handleSelectAI}
          />

          {/* Pipeline Option */}
          <CreationCard
            title="Custom Pipeline Builder"
            description="Design your own recruitment workflow with custom tests, interviews, and conditions for complete control."
            icon={ConditionIcon}
            accent="#6366f1"
            gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
            features={[
              "Full customization (3 steps)",
              "Visual pipeline builder",
              "Custom evaluation steps",
            ]}
            chip={{ label: "Advanced", bg: "#e0e7ff", color: "#4338ca" }}
            onClick={handleSelectPipeline}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default JobPostCreationMethod;

/* ========= Creation Card ========= */

interface CreationCardProps {
  title: string;
  description: string;
  icon: any;
  accent: string;
  gradient: string;
  features: string[];
  chip: {
    label: string;
    bg: string;
    color: string;
  };
  onClick: () => void;
}

const CreationCard: React.FC<CreationCardProps> = ({
  title,
  description,
  icon: Icon,
  accent,
  gradient,
  features,
  chip,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      p: 3, // ⬅️ reduced from 4
      border: "1.5px solid #e5e7eb",
      borderRadius: "12px", // ⬅️ smaller radius
      cursor: "pointer",
      transition: "all 0.25s ease",
      backgroundColor: "white",
      "&:hover": {
        borderColor: accent,
        boxShadow: `0 6px 18px ${accent}26`,
        transform: "translateY(-2px)", // ⬅️ softer hover
      },
    }}
  >
    {/* Icon */}
    <Box
      sx={{
        width: 48, // ⬅️ smaller
        height: 48,
        borderRadius: "10px",
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2,
      }}
    >
      <Icon sx={{ fontSize: 24, color: "white" }} />

    </Box>

    {/* Title */}
    <Typography
      sx={{
        fontWeight: 600,
        mb: 1,
        color: "#111827",
        fontSize: "16px",
      }}
    >
      {title}
    </Typography>

    {/* Description */}
    <Typography
      sx={{
        color: "#6b7280",
        lineHeight: 1.6,
        mb: 2,
        fontSize: "13px",
      }}
    >
      {description}
    </Typography>

    {/* Features */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {features.map((feature) => (
        <Box
          key={feature}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: accent,
            }}
          />
          <Typography sx={{ color: "#374151", fontSize: "12.5px" }}>
            {feature}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Footer */}
    <Box
      sx={{
        mt: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Chip
        label={chip.label}
        size="small"
        sx={{
          height: 22,
          fontSize: "11px",
          backgroundColor: chip.bg,
          color: chip.color,
          fontWeight: 600,
        }}
      />
      <Image src="/icons/arrow-up.svg" alt="arrowup" width={16} height={16} />
    </Box>
  </Box>
);

