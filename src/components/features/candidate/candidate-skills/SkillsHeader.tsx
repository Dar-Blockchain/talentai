import React from "react";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBD  = "#99F6E4";
const NAVY = "#0D1B2A";

const SkillsHeader: React.FC = () => {
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const techSkills = profile?.skills?.length ?? 0;
  const softSkills = profile?.softSkills?.length ?? 0;
  const quota      = profile?.quota ?? 0;

  return (
    <Box sx={{
      bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB",
      p: 3, mb: 2.5, overflow: "hidden", position: "relative",
    }}>
      {/* Decorative glow */}
      <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", bgcolor: `${T}07`, pointerEvents: "none" }} />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: TBG, border: `1px solid ${TBD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <PsychologyOutlined sx={{ fontSize: 22, color: T }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: NAVY, lineHeight: 1 }}>Skills & Expertise</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.2 }}>Showcase your skills and track your assessment progress</Typography>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {[
            { icon: CodeOutlined,   label: "Technical", value: techSkills, color: "#2563EB" },
            { icon: PeopleOutlined, label: "Soft",      value: softSkills, color: "#D97706" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Box key={label} sx={{ textAlign: "center", px: 1.75, py: 1, borderRadius: "12px", bgcolor: `${color}0D`, border: `1px solid ${color}25`, minWidth: 64 }}>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ fontSize: "0.62rem", color: "#9CA3AF", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Quota bar */}
      <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid #F3F4F6" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
          <Typography sx={{ fontSize: "0.72rem", color: "#6B7280", fontWeight: 600 }}>Monthly Test Quota</Typography>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: quota >= 5 ? "#DC2626" : T }}>{quota}/5 used</Typography>
        </Box>
        <Box sx={{ height: 6, bgcolor: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
          <Box sx={{ height: "100%", width: `${(quota / 5) * 100}%`, bgcolor: quota >= 5 ? "#DC2626" : T, borderRadius: "99px", transition: "width 0.6s ease" }} />
        </Box>
        {quota >= 5 && (
          <Typography sx={{ fontSize: "0.67rem", color: "#DC2626", mt: 0.5, fontWeight: 500 }}>
            Monthly limit reached — tests reset at the start of next month.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SkillsHeader;
