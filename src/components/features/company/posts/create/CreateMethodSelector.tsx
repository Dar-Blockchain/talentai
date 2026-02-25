import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import PageBanner from "@/components/dashboard-workplace/ui/PageBanner";
import WorkOutlined from "@mui/icons-material/WorkOutlined";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface MethodCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  features: string[];
  chip: { label: string; color: string; bg: string };
  onClick: () => void;
}

const MethodCard: React.FC<MethodCardProps> = ({
  title,
  description,
  icon: Icon,
  accentColor,
  accentBg,
  accentBorder,
  features,
  chip,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      bgcolor: "#fff",
      border: `1.5px solid #E5E7EB`,
      borderRadius: 3,
      p: 3,
      cursor: "pointer",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: accentColor,
        boxShadow: `0 8px 24px ${accentColor}20`,
        transform: "translateY(-2px)",
      },
    }}
  >
    {/* Icon */}
    <Box
      sx={{
        width: 52, height: 52, borderRadius: 2,
        bgcolor: accentBg, border: `1px solid ${accentBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5,
      }}
    >
      <Icon sx={{ fontSize: 26, color: accentColor }} />
    </Box>

    {/* Title + chip */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
      <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
        {title}
      </Typography>
      <Chip
        label={chip.label}
        size="small"
        sx={{
          height: 20, fontSize: "10px", fontWeight: 700,
          color: chip.color, bgcolor: chip.bg,
        }}
      />
    </Box>

    {/* Description */}
    <Typography sx={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, mb: 2.5 }}>
      {description}
    </Typography>

    {/* Features */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
      {features.map((f) => (
        <Box key={f} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CheckOutlined sx={{ fontSize: 14, color: accentColor }} />
          <Typography sx={{ fontSize: "12px", color: "#374151" }}>{f}</Typography>
        </Box>
      ))}
    </Box>

    {/* CTA */}
    <Box
      sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pt: 2, borderTop: "1px solid #F3F4F6",
      }}
    >
      <Typography sx={{ fontSize: "12px", fontWeight: 700, color: accentColor }}>
        Select this method
      </Typography>
      <Box
        sx={{
          width: 28, height: 28, borderRadius: "50%",
          bgcolor: accentBg, border: `1px solid ${accentBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <ArrowForwardOutlined sx={{ fontSize: 14, color: accentColor }} />
      </Box>
    </Box>
  </Box>
);

const CreateMethodSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Box>
      <PageBanner
        title="Create Job Post"
        subtitle="Choose how you want to create your job post — AI-powered or fully custom."
        icon={<WorkOutlined />}
        gradient="135deg, #0D9488 0%, #0891B2 100%"
      />

      <Box sx={{ maxWidth: 840, mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
            Select creation method
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280" }}>
            Both methods produce a fully featured job post. Pick the one that fits your workflow.
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <MethodCard
            title="AI-Powered"
            description="Describe your ideal candidate and let AI generate a comprehensive job post with matching configuration in minutes."
            icon={SmartToyOutlined}
            accentColor={TEAL}
            accentBg={TEAL_BG}
            accentBorder={TEAL_BORDER}
            features={[
              "Quick & easy — 1 step",
              "AI-generated job description",
              "Automatic candidate matching",
            ]}
            chip={{ label: "Recommended", color: TEAL, bg: TEAL_BG }}
            onClick={() => dispatch(setCreationType("ai"))}
          />

          <MethodCard
            title="Custom Pipeline"
            description="Design your own recruitment workflow with custom tests, interviews, and conditions for complete control."
            icon={AccountTreeOutlined}
            accentColor="#6366F1"
            accentBg="#EEF2FF"
            accentBorder="#C7D2FE"
            features={[
              "Full customization — 2 steps",
              "Visual pipeline builder",
              "Custom evaluation steps",
            ]}
            chip={{ label: "Advanced", color: "#6366F1", bg: "#EEF2FF" }}
            onClick={() => dispatch(setCreationType("manual"))}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CreateMethodSelector;
