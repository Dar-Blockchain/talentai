import React from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import BoltOutlined from "@mui/icons-material/BoltOutlined";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

const T   = "#0D9488";
const TBG = "#F0FDFA";
const TBD = "#99F6E4";

function CandidateSkills() {
  const { t } = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.skills.${k}`, opts) as string;

  const profile   = useSelector((state: RootState) => state.user.connectedUser.profile);
  const techCount = profile?.skills?.length ?? 0;
  const softCount = profile?.softSkills?.length ?? 0;
  const quota     = profile?.quota ?? 0;
  const quotaFull = quota >= 5;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2.25, pb: 2, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: TBG, border: `1px solid ${TBD}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CodeOutlined sx={{ fontSize: 16, color: T }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>{s("title")}</Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8" }}>{s("subtitle", { count: techCount + softCount })}</Typography>
            </Box>
          </Box>

          <Box sx={{
            display: "flex", alignItems: "center", gap: 0.75,
            px: 1.25, py: 0.5, borderRadius: "10px",
            bgcolor: quotaFull ? "#FEF2F2" : TBG,
            border: `1px solid ${quotaFull ? "#FECACA" : TBD}`,
          }}>
            <BoltOutlined sx={{ fontSize: 13, color: quotaFull ? "#DC2626" : T }} />
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: quotaFull ? "#DC2626" : T }}>
              {s("quota", { used: quota })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Technical ── */}
      <Box>
        <Box sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
          <Box sx={{ width: 5, height: 14, borderRadius: "99px", bgcolor: "#2563EB" }} />
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("technical")}</Typography>
          <Box sx={{ ml: 0.5, px: 0.75, py: 0.1, borderRadius: "99px", bgcolor: "#DBEAFE" }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#1D4ED8" }}>{techCount}</Typography>
          </Box>
        </Box>
        <TechnicalSkills />
      </Box>

      {/* ── Soft ── */}
      <Box sx={{ borderTop: "1px solid #E2E8F0" }}>
        <Box sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
          <Box sx={{ width: 5, height: 14, borderRadius: "99px", bgcolor: "#D97706" }} />
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s("soft")}</Typography>
          <Box sx={{ ml: 0.5, px: 0.75, py: 0.1, borderRadius: "99px", bgcolor: "#FEF3C7" }}>
            <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, color: "#B45309" }}>{softCount}</Typography>
          </Box>
        </Box>
        <SoftSkills />
      </Box>

    </Box>
  );
}

export default CandidateSkills;
