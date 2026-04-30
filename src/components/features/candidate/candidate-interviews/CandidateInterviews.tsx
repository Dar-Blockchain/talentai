import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import PostInterviews from "./PostInterviews";
import SkillInterviews from "./SkillInterviews";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBD  = "#99F6E4";
const NAVY = "#0D1B2A";

const TABS = [
  { value: "application", label: "Applications",     Icon: WorkOutlineOutlined, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { value: "technical",   label: "Technical Skills", Icon: CodeOutlined,        color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { value: "soft",        label: "Soft Skills",      Icon: PeopleOutlined,      color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

interface CandidateInterviewsProps {
  onViewAll?: () => void;
  onBackToAll?: () => void;
  hidden?: boolean;
  showViewAll?: boolean;
}

const CandidateInterviews: React.FC<CandidateInterviewsProps> = ({
  onViewAll, onBackToAll, hidden = false, showViewAll = false,
}) => {
  const [tab, setTab] = useState("application");
  if (hidden) return null;

  return (
    <Box>
      {/* ── Header panel ── */}
      <Box sx={{
        bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB",
        p: 3, mb: 2.5, overflow: "hidden", position: "relative",
      }}>
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", bgcolor: `${T}07`, pointerEvents: "none" }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
          <Box sx={{ width: 42, height: 42, borderRadius: "12px", bgcolor: TBG, border: `1px solid ${TBD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <SchoolOutlined sx={{ fontSize: 22, color: T }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 900, color: NAVY, lineHeight: 1 }}>Interviews & Assessments</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.2 }}>Track your interviews and skill assessment history</Typography>
          </Box>
        </Box>

        {/* Tab switcher */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {TABS.map(({ value, label, Icon, color, bg, border }) => {
            const isActive = tab === value;
            return (
              <Box
                key={value}
                onClick={() => setTab(value)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  px: 2, py: 1, borderRadius: "12px", cursor: "pointer",
                  border: isActive ? `1.5px solid ${border}` : "1.5px solid #E5E7EB",
                  bgcolor: isActive ? bg : "#FAFAFA",
                  transition: "all 0.18s ease",
                  "&:hover": { borderColor: border, bgcolor: bg },
                }}
              >
                <Icon sx={{ fontSize: 16, color: isActive ? color : "#9CA3AF" }} />
                <Typography sx={{ fontSize: "0.8rem", fontWeight: isActive ? 700 : 500, color: isActive ? color : "#6B7280", whiteSpace: "nowrap" }}>
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ bgcolor: "#fff", borderRadius: "18px", border: "1px solid #E5E7EB", p: 3 }}>
        {tab === "application" && (
          <PostInterviews onViewAll={onViewAll} onBackToAll={onBackToAll} showViewAll={showViewAll} initialDisplayCount={5} />
        )}
        {tab === "technical" && <SkillInterviews skillType="technical" />}
        {tab === "soft"      && <SkillInterviews skillType="soft" />}
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateInterviews), { ssr: false });
