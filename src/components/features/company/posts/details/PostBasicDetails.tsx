import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentJob } from "@/store/slices/postSlice";
import { Box, Typography, Chip, Divider } from "@mui/material";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import SectionCard from "@/components/ui/ui/SectionCard";
import { formatSalary, getLevelFromNumber, getPostSkills, getSoftSkillLevelLabel, Skill } from "@/utils/postHelpers";
import { formatDate } from "@/utils/functions";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  canEdit: boolean;
  onEdit: () => void;
}

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>
      {icon}
    </Box>
    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 }}>
      {title}
    </Typography>
  </Box>
);

const PostBasicDetails: React.FC<Props> = () => {
  const job = useSelector(selectCurrentJob);
  if (!job) return null;

  const jd = job.jobDetails || {};
  const displaySkills = getPostSkills(job);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

      {/* Overview */}
      <SectionCard>
        <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title="Job Overview" />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {jd.workMode && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <LocationOnOutlined sx={{ fontSize: 14, color: "#2563EB" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#2563EB" }}>{jd.workMode}</Typography>
            </Box>
          )}
          {jd.employmentType && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <WorkOutlined sx={{ fontSize: 14, color: "#7C3AED" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#7C3AED" }}>{jd.employmentType}</Typography>
            </Box>
          )}
          {jd.salary && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <AttachMoneyOutlined sx={{ fontSize: 14, color: "#16A34A" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#16A34A" }}>{formatSalary(jd.salary)}</Typography>
            </Box>
          )}
          {job.createdAt && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, px: 1.5, py: 0.75 }}>
              <CalendarTodayOutlined sx={{ fontSize: 14, color: "#6B7280" }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>{formatDate(job.createdAt)}</Typography>
            </Box>
          )}
        </Box>

        {jd.description && (
          <>
            <Divider sx={{ my: 2.5 }} />
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#374151", mb: 1 }}>Description</Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.8 }}>{jd.description}</Typography>
          </>
        )}
      </SectionCard>

      {/* Skills */}
      {displaySkills.length > 0 && (
        <SectionCard>
          <SectionTitle icon={<CodeOutlined sx={{ fontSize: 15 }} />} title="Required Skills" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {displaySkills.map((skill: Skill, i: number) => {
              const level = skill.type === "soft"
                ? getSoftSkillLevelLabel(Number(skill.level) || 1)
                : getLevelFromNumber(skill.level || 1);
              return (
                <Chip
                  key={i}
                  label={`${skill.name} · ${level}`}
                  size="small"
                  sx={{ fontSize: "11px", fontWeight: 600, height: 24, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}` }}
                />
              );
            })}
          </Box>
        </SectionCard>
      )}

      {/* Requirements */}
      {jd.requirements?.length > 0 && (
        <SectionCard>
          <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title="Requirements" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {jd.requirements.map((req: string, i: number) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: TEAL, mt: 0.75, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>{req}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}

      {/* Responsibilities */}
      {jd.responsibilities?.length > 0 && (
        <SectionCard>
          <SectionTitle icon={<WorkOutlined sx={{ fontSize: 15 }} />} title="Responsibilities" />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {jd.responsibilities.map((r: string, i: number) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#6366F1", mt: 0.75, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "13px", color: "#374151", lineHeight: 1.7 }}>{r}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}
    </Box>
  );
};

export default PostBasicDetails;
