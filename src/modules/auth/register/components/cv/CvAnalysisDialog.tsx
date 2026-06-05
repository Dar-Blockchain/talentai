import React from "react";
import { Box, CircularProgress, Dialog, DialogContent, LinearProgress, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslation } from "react-i18next";
import { ACCENT, ACCENT2 } from "@/modules/auth/shared/types";

interface Props {
  open: boolean;
  progress: number;
}

const STEPS = [
  { key: "analyzing_reading", threshold: 0  },
  { key: "analyzing_skills",  threshold: 30 },
  { key: "analyzing_profile", threshold: 65 },
] as const;

const CvAnalysisDialog: React.FC<Props> = ({ open, progress }) => {
  const { t } = useTranslation("auth");

  return (
    <Dialog open={open} disableEscapeKeyDown PaperProps={{ sx: { borderRadius: "20px", p: 0, minWidth: { xs: 300, sm: 340 }, maxWidth: { xs: "calc(100% - 32px)", sm: 380 }, overflow: "hidden", boxShadow: `0 24px 60px ${ACCENT}25` } }}>
      {/* Top progress strip */}
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4, borderRadius: 0, backgroundColor: `${ACCENT}22`, "& .MuiLinearProgress-bar": { background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` } }} />

      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5, md: 4 }, py: { xs: 2.75, md: 3.5 }, display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: { xs: 40, md: 44 }, height: { xs: 40, md: 44 }, borderRadius: "12px", background: `${ACCENT}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CircularProgress size={22} thickness={5} sx={{ color: ACCENT }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, color: "#111", lineHeight: 1.3, fontFamily: "Poppins", fontSize: { xs: "0.9375rem", sm: "1rem", md: "1.0625rem" } }}>
              {t("candidate_form.analyzing_title")}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.72rem", sm: "0.75rem", md: "0.78rem" }, color: "#888", fontFamily: "Poppins" }}>
              {t("candidate_form.analyzing_sub")}
            </Typography>
          </Box>
        </Box>

        {/* Steps */}
        {STEPS.map(({ key, threshold }) => (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box sx={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: progress > threshold ? `${ACCENT}15` : "rgba(0,0,0,0.04)", transition: "background 0.4s" }}>
              {progress > threshold
                ? <CheckCircleOutlineIcon sx={{ fontSize: 13, color: ACCENT }} />
                : <CircularProgress size={10} thickness={5} sx={{ color: progress >= threshold ? ACCENT : "#ccc" }} />}
            </Box>
            <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.79rem", md: "0.82rem" }, color: progress > threshold ? "#333" : "#aaa", fontWeight: progress > threshold ? 600 : 400, fontFamily: "Poppins", transition: "color 0.4s" }}>
              {t(`candidate_form.${key}`)}
            </Typography>
          </Box>
        ))}

        {/* Progress bar with % */}
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.625rem", md: "0.65rem" }, color: "#999", fontFamily: "Poppins" }}>
              {t("candidate_form.analyzing_processing")}
            </Typography>
            <Typography sx={{ fontSize: { xs: "0.6rem", sm: "0.625rem", md: "0.65rem" }, color: ACCENT, fontWeight: 700, fontFamily: "Poppins" }}>
              {progress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, backgroundColor: `${ACCENT}15`, "& .MuiLinearProgress-bar": { borderRadius: 3, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})` } }} />
        </Box>

        <Typography sx={{ fontSize: { xs: "0.6625rem", sm: "0.69rem", md: "0.72rem" }, color: "#bbb", textAlign: "center", mt: -1, fontFamily: "Poppins" }}>
          {t("candidate_form.analyzing_warning")}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default CvAnalysisDialog;
