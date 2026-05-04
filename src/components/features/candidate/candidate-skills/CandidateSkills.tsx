import React from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import TechnicalSkills from "./TechnicalSkills";
import SoftSkills from "./SoftSkills";

const T   = "#0D9488";
const TBG = "#F0FDFA";
const TBD = "#99F6E4";

function CandidateSkills() {
  const profile    = useSelector((state: RootState) => state.user.connectedUser.profile);
  const techCount  = profile?.skills?.length ?? 0;
  const softCount  = profile?.softSkills?.length ?? 0;
  const quota      = profile?.quota ?? 0;

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.75, borderBottom: "1px solid #F1F5F9" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CodeOutlined sx={{ fontSize: 18, color: T }} />
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>Skills & Expertise</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "20px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE" }}>
              <CodeOutlined sx={{ fontSize: 10, color: "#2563EB" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#2563EB" }}>{techCount} technical</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "20px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <PeopleOutlined sx={{ fontSize: 10, color: "#D97706" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#D97706" }}>{softCount} soft</Typography>
            </Box>
            {/* Quota badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.25, borderRadius: "20px", bgcolor: quota >= 5 ? "#FEF2F2" : TBG, border: `1px solid ${quota >= 5 ? "#FECACA" : TBD}` }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: quota >= 5 ? "#DC2626" : T }}>{quota}/5 tests</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Technical ── */}
      <Box>
        <Box sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
          <CodeOutlined sx={{ fontSize: 13, color: "#2563EB" }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.05em" }}>Technical</Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", ml: 0.25 }}>{techCount}</Typography>
        </Box>
        <TechnicalSkills />
      </Box>

      {/* ── Soft ── */}
      <Box sx={{ borderTop: "1px solid #E2E8F0" }}>
        <Box sx={{ px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
          <PeopleOutlined sx={{ fontSize: 13, color: "#D97706" }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.05em" }}>Soft Skills</Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#94A3B8", ml: 0.25 }}>{softCount}</Typography>
        </Box>
        <SoftSkills />
      </Box>

    </Box>
  );
}

export default CandidateSkills;
