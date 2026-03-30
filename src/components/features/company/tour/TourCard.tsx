import React, { memo } from "react";
import { Box, Typography, Button } from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { STEPS, TOTAL, type Step } from "./tourSteps";
import { W } from "./tourUtils";

const TEAL = "#0D9488";

interface TourCardProps {
  step: number;
  current: Step;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
  onJump: (i: number) => void;
}

const TourCard: React.FC<TourCardProps> = memo(({ step, current, onPrev, onNext, onFinish, onJump }) => {
  const isCentered = current.position === "center";
  const isFirst = step === 0;
  const isLast = step === TOTAL - 1;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", border: "1px solid #E5E7EB", pointerEvents: "auto", width: isCentered ? 440 : W, maxWidth: "calc(100vw - 24px)" }}>

      {/* Progress bar */}
      <Box sx={{ height: 4, bgcolor: "#F3F4F6", position: "relative" }}>
        <Box sx={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${((step + 1) / TOTAL) * 100}%`, background: `linear-gradient(90deg, ${TEAL}, #34D399)`, transition: "width 0.3s ease" }} />
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Title */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.25 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#111827", lineHeight: 1.3, pr: 1 }}>
            {current.title}
          </Typography>
          <Box onClick={onFinish} sx={{ cursor: "pointer", color: "#9CA3AF", "&:hover": { color: "#374151" }, flexShrink: 0, mt: 0.25 }}>
            <CloseOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Description */}
        <Typography sx={{ fontSize: "0.83rem", color: "#6B7280", lineHeight: 1.7, mb: 2.5, whiteSpace: "pre-line" }}>
          {current.description}
        </Typography>

        {/* Footer */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Dots */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", maxWidth: 160 }}>
            {STEPS.map((_, i) => (
              <Box key={i} onClick={() => onJump(i)} sx={{ width: i === step ? 14 : 5, height: 5, borderRadius: "4px", bgcolor: i === step ? TEAL : i < step ? `${TEAL}60` : "#E5E7EB", transition: "all 0.2s", cursor: "pointer" }} />
            ))}
          </Box>

          {/* Counter + nav buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 500 }}>{step + 1} / {TOTAL}</Typography>
            {!isFirst && (
              <Button size="small" onClick={onPrev} startIcon={<ArrowBackOutlined sx={{ fontSize: 13 }} />}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem", color: "#6B7280", borderRadius: "8px", px: 1.5, minWidth: 0, "&:hover": { bgcolor: "#F3F4F6" } }}>
                Back
              </Button>
            )}
            <Button size="small" variant="contained" onClick={onNext}
              endIcon={isLast ? <CheckOutlined sx={{ fontSize: 13 }} /> : <ArrowForwardOutlined sx={{ fontSize: 13 }} />}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: TEAL, color: "#fff", borderRadius: "8px", px: 2, boxShadow: "none", "&:hover": { bgcolor: "#0F766E", boxShadow: "none" } }}>
              {isLast ? "Done!" : "Next"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

TourCard.displayName = "TourCard";
export default TourCard;
