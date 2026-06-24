import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSkills } from "@/hooks/useSkills";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

const T   = "#0D9488";
const TBG = "#F0FDFA";
const TBD = "#99F6E4";

function CandidateSkills() {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const tech = useSkills({ kind: "technical", limit: 8 });
  const soft = useSkills({ kind: "soft",      limit: 8 });

  const techCount  = tech.pagination?.total ?? 0;
  const softCount  = soft.pagination?.total ?? 0;
  const totalCount = techCount + softCount;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2.25, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: TBG, border: `1px solid ${TBD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CodeOutlined sx={{ fontSize: 16, color: T }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>{s("title")}</Typography>
            {(tech.loading && soft.loading) ? (
              <Skeleton width={80} height={14} />
            ) : (
              <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>{s("subtitle", { count: totalCount })}</Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Technical ── */}
      <Box>
        <Box sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
          <Box sx={{ width: 5, height: 14, borderRadius: "99px", bgcolor: "#2563EB" }} />
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("technical")}</Typography>
          <Box sx={{ ml: 0.5, px: 0.75, py: 0.1, borderRadius: "99px", bgcolor: "#DBEAFE" }}>
            {tech.loading ? (
              <Skeleton width={16} height={14} />
            ) : (
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#1D4ED8" }}>{techCount}</Typography>
            )}
          </Box>
        </Box>
        <TechnicalSkills {...tech} />
      </Box>

      {/* ── Soft ── */}
      <Box sx={{ borderTop: "1px solid #E2E8F0" }}>
        <Box sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
          <Box sx={{ width: 5, height: 14, borderRadius: "99px", bgcolor: "#D97706" }} />
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("soft")}</Typography>
          <Box sx={{ ml: 0.5, px: 0.75, py: 0.1, borderRadius: "99px", bgcolor: "#FEF3C7" }}>
            {soft.loading ? (
              <Skeleton width={16} height={14} />
            ) : (
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#B45309" }}>{softCount}</Typography>
            )}
          </Box>
        </Box>
        <SoftSkills {...soft} />
      </Box>

    </Box>
  );
}

export default CandidateSkills;
