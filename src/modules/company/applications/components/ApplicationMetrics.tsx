import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Skeleton } from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUp";
import { WorkOutlineOutlined } from "@mui/icons-material";

// ─── Static constants ─────────────────────────────────────────────────────────

const GRID_SX   = { display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 } as const;
const CARD_SX   = { bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, display: "flex", alignItems: "center", gap: 2 } as const;
const ICON_SX_BASE = { width: 42, height: 42, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
const VALUE_SX  = { fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 } as const;
const LABEL_SX  = { fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.4 } as const;

interface Props {
  metrics: { totalApplicants: number; totalJobPosts: number; avgCVScore: number; topCVScore: number } | null;
}

const STAT_DEFS = [
  { key: "totalApplicants", icon: PeopleOutlined,      i18nKey: "pages.applications.metrics.total_applicants", color: "#0D9488", bg: "#F0FDFA", fmt: (v: number) => v },
  { key: "totalJobPosts",   icon: WorkOutlineOutlined, i18nKey: "pages.applications.metrics.job_posts",        color: "#10B981", bg: "#F0FDF4", fmt: (v: number) => v },
  { key: "avgCVScore",      icon: StarOutlined,        i18nKey: "pages.applications.metrics.avg_cv_score",     color: "#6366F1", bg: "#EEF2FF", fmt: (v: number) => v != null ? `${v}%` : "N/A" },
  { key: "topCVScore",      icon: TrendingUpOutlined,  i18nKey: "pages.applications.metrics.top_cv_score",     color: "#6366F1", bg: "#EEF2FF", fmt: (v: number) => v != null ? `${v}%` : "N/A" },
];

const ApplicationMetrics = memo<Props>(({ metrics }) => {
  const { t } = useTranslation("dashboard");
  return (
    <Box sx={GRID_SX}>
      {STAT_DEFS.map(({ key, icon: Icon, i18nKey, color, bg, fmt }) => (
        <Box key={key} sx={CARD_SX}>
          <Box sx={{ ...ICON_SX_BASE, bgcolor: bg }}>
            <Icon sx={{ fontSize: 20, color }} />
          </Box>
          <Box>
            {!metrics ? (
              <Skeleton variant="text" width={50} height={28} />
            ) : (
              <Typography sx={VALUE_SX}>
                {fmt((metrics as any)[key])}
              </Typography>
            )}
            <Typography sx={LABEL_SX}>{t(i18nKey)}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
});
ApplicationMetrics.displayName = "ApplicationMetrics";

export default ApplicationMetrics;
