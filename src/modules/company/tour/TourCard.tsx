import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("dashboard");
  const isCentered = current.position === "center";
  const isFirst = step === 0;
  const isLast = step === TOTAL - 1;

  return (
    <Box sx={{
      bgcolor: "#fff",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
      border: "1px solid #E5E7EB",
      pointerEvents: "auto",
      width: isCentered ? 440 : W,
      maxWidth: "calc(100vw - 24px)",
      display: "flex",
      flexDirection: "column",
      maxHeight: "calc(100vh - 80px)",
    }}>

      {/* Progress bar */}
      <Box sx={{ height: 4, bgcolor: "#F3F4F6", position: "relative", flexShrink: 0 }}>
        <Box sx={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${((step + 1) / TOTAL) * 100}%`, background: `linear-gradient(90deg, ${TEAL}, #34D399)`, transition: "width 0.3s ease" }} />
      </Box>

      {/* Title — fixed */}
      <Box sx={{ px: 3, pt: 3, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.25 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#111827", lineHeight: 1.3, pr: 1 }}>
            {t(current.titleKey)}
          </Typography>
          <Box onClick={onFinish} sx={{ cursor: "pointer", color: "#9CA3AF", "&:hover": { color: "#374151" }, flexShrink: 0, mt: 0.25 }}>
            <CloseOutlined sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Box>

      {/* Description — scrollable */}
      <Box sx={{ px: 3, overflowY: "auto", flex: 1, minHeight: 0 }}>
        <Typography sx={{ fontSize: "0.83rem", color: "#6B7280", lineHeight: 1.7, whiteSpace: "pre-line", pb: 2 }}>
          {t(current.descKey)}
        </Typography>
      </Box>

      {/* Footer — always visible */}
      <Box sx={{ px: 3, pb: 3, pt: 2, flexShrink: 0, borderTop: "1px solid #F3F4F6" }}>
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
              <Button size="sm" variant="ghost" onClick={onPrev} className="min-w-0 rounded-lg px-3 text-[0.78rem] font-semibold text-gray-500">
                <ArrowBackOutlined sx={{ fontSize: 13 }} />
                {t("tour.nav.back")}
              </Button>
            )}
            <Button
              size="sm"
              variant="default"
              onClick={onNext}
              className="rounded-lg px-4 text-[0.78rem] font-bold shadow-none"
              style={{ backgroundColor: TEAL, color: "#fff" }}
            >
              {isLast ? t("tour.nav.done") : t("tour.nav.next")}
              {isLast ? <CheckOutlined sx={{ fontSize: 13 }} /> : <ArrowForwardOutlined sx={{ fontSize: 13 }} />}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

TourCard.displayName = "TourCard";
export default TourCard;
