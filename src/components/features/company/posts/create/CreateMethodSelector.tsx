import React from "react";
import { Box, Typography } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesome";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setCreationType } from "@/store/slices/postGenerationSlice";
import PageHeader from "@/components/layout/dashboard/PageHeader";

const TEAL = "#0D9488";

interface MethodCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: { label: string; color: string; bg: string };
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentBarColor: string;
  features: { text: string; note?: string }[];
  onClick: () => void;
}

const MethodCard: React.FC<MethodCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  accentColor,
  accentBg,
  accentBorder,
  accentBarColor,
  features,
  onClick,
}) => (
  <Box
    onClick={onClick}
    sx={{
      bgcolor: "#fff",
      border: "1.5px solid #E5E7EB",
      borderRadius: "20px",
      overflow: "hidden",
      cursor: "pointer",
      transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        borderColor: accentColor,
        boxShadow: `0 12px 40px ${accentColor}1A`,
        transform: "translateY(-3px)",
        "& .card-cta": { bgcolor: accentColor, color: "#fff" },
        "& .card-arrow": { color: "#fff" },
      },
    }}
  >
    {/* Top accent bar */}
    <Box sx={{ height: 4, bgcolor: accentBarColor, flexShrink: 0 }} />

    <Box sx={{ p: 3.5, display: "flex", flexDirection: "column", flex: 1 }}>

      {/* Header row: icon + badge */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5 }}>
        <Box
          sx={{
            width: 56, height: 56, borderRadius: "14px",
            bgcolor: accentBg, border: `1.5px solid ${accentBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 28, color: accentColor }} />
        </Box>

        <Box
          sx={{
            display: "inline-flex", alignItems: "center", gap: 0.5,
            px: 1.25, py: 0.5, borderRadius: "20px",
            bgcolor: badge.bg, border: `1px solid ${badge.color}30`,
          }}
        >
          <AutoAwesomeOutlined sx={{ fontSize: 10, color: badge.color }} />
          <Typography sx={{ fontSize: "10.5px", fontWeight: 700, color: badge.color, lineHeight: 1 }}>
            {badge.label}
          </Typography>
        </Box>
      </Box>

      {/* Title + subtitle */}
      <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#111827", lineHeight: 1.2, mb: 0.4 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: accentColor, mb: 1.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {subtitle}
      </Typography>

      {/* Description */}
      <Typography sx={{ fontSize: "13.5px", color: "#6B7280", lineHeight: 1.65, mb: 2.5 }}>
        {description}
      </Typography>

      {/* Divider */}
      <Box sx={{ height: "1px", bgcolor: "#F3F4F6", mb: 2 }} />

      {/* Features */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, mb: 3, flex: 1 }}>
        {features.map(({ text, note }) => (
          <Box key={text} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
            <Box
              sx={{
                width: 18, height: 18, borderRadius: "5px", flexShrink: 0, mt: "1px",
                bgcolor: accentBg, border: `1px solid ${accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <CheckOutlined sx={{ fontSize: 11, color: accentColor }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.4 }}>
                {text}
              </Typography>
              {note && (
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", lineHeight: 1.3 }}>
                  {note}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* CTA row */}
      <Box
        className="card-cta"
        sx={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 1,
          py: 1.25, borderRadius: "12px",
          bgcolor: accentBg, border: `1.5px solid ${accentBorder}`,
          transition: "all 0.22s",
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "inherit", lineHeight: 1 }}>
          Get started
        </Typography>
        <ArrowForwardOutlined className="card-arrow" sx={{ fontSize: 15, color: accentColor, transition: "color 0.22s" }} />
      </Box>
    </Box>
  </Box>
);

const CreateMethodSelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <Box>
      <PageHeader
        title="New Job Post"
        subtitle="Choose how you want to create your job post — AI-powered or fully custom."
        icon={WorkOutlineOutlined}
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Job Posts", href: "/company/posts" },
          { label: "New Job Post" },
        ]}
      />

      <Box sx={{ maxWidth: 900, mx: "auto" }}>

        {/* Section label */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Box sx={{ height: "1px", flex: 1, bgcolor: "#F3F4F6" }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
            Select a creation method
          </Typography>
          <Box sx={{ height: "1px", flex: 1, bgcolor: "#F3F4F6" }} />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
          <MethodCard
            title="AI-Powered"
            subtitle="Fastest — 1 step"
            description="Describe your ideal candidate and let AI generate a comprehensive job post with skills, requirements, and matching configuration in minutes."
            icon={SmartToyOutlined}
            badge={{ label: "Recommended", color: TEAL, bg: "#F0FDFA" }}
            accentColor={TEAL}
            accentBg="#F0FDFA"
            accentBorder="#99F6E4"
            accentBarColor={TEAL}
            features={[
              { text: "AI-generated job description", note: "Saves up to 30 minutes of writing" },
              { text: "Automatic skill extraction" },
              { text: "Smart candidate matching" },
            ]}
            onClick={() => dispatch(setCreationType("ai"))}
          />

          <MethodCard
            title="Custom Pipeline"
            subtitle="Full control — 2 steps"
            description="Design your own recruitment workflow with custom tests, interviews, and evaluation conditions. Perfect for structured hiring processes."
            icon={AccountTreeOutlined}
            badge={{ label: "Advanced", color: "#6366F1", bg: "#EEF2FF" }}
            accentColor="#6366F1"
            accentBg="#EEF2FF"
            accentBorder="#C7D2FE"
            accentBarColor="#818CF8"
            features={[
              { text: "Visual pipeline builder", note: "Drag-and-drop step configuration" },
              { text: "Custom evaluation steps" },
              { text: "Multi-stage interview flows" },
            ]}
            onClick={() => dispatch(setCreationType("manual"))}
          />
        </Box>

        {/* Bottom hint */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 3.5 }}>
          <EditNoteOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: "12px", color: "#9CA3AF" }}>
            Both methods let you fully edit all details before publishing.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateMethodSelector;
