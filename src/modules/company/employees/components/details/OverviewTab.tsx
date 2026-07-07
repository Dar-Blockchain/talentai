import React, { memo, useMemo } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import {
  Mail as EmailOutlined,
  Calendar as CalendarTodayOutlined,
  Building2 as BusinessOutlined,
  IdCard as BadgeOutlined,
  RefreshCw as UpdateOutlined,
  Megaphone as CampaignOutlined,
  CheckCircle2 as CheckCircleOutlined,
  Brain as PsychologyOutlined,
  History as WorkHistoryOutlined,
} from "lucide-react";
import StatCard from "./StatCard";
import MetricCard from "./MetricCard";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { PURPLE, fmtDate } from "@/modules/company/employees/constants";

const METRICS_GRID_SX = { display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 } as const;
const SKILLS_BOX_SX = { bgcolor: "#fff", border: "1px solid #E8EAED", borderRadius: "16px", p: 2.25, mb: 2 } as const;
const SKILLS_LABEL_SX = { fontSize: "0.75rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em", mb: 1.25 } as const;
const SKILLS_WRAP_SX = { display: "flex", flexWrap: "wrap", gap: 0.75 } as const;
const STATS_GRID_SX = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 1.5 } as const;
const MOTION_PROPS = { key: "overview", initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: 0.2 } } as const;

interface OverviewTabProps {
  member: ExtendedMember;
  email: string;
  roleLabel: string;
  roleColor: string;
  dept: string | null;
}

const OverviewTab: React.FC<OverviewTabProps> = memo(({ member, email, roleLabel, roleColor, dept }) => {
  const skillChipSx = useMemo(() => ({
    fontSize: "12px", fontWeight: 600,
    bgcolor: `${PURPLE}0C`, color: PURPLE,
    border: `1px solid ${PURPLE}20`,
    borderRadius: "8px", height: 26,
  }), []);

  const campaignsValue = member.campaignsCount ?? member.campaigns?.length ?? "—";
  const interviewsValue = member.interviewsPassed ?? "—";
  const skillsValue = member.skills?.length ?? "—";
  const jobPostsValue = member.jobPostsCount ?? "—";

  return (
    <motion.div {...MOTION_PROPS}>
      <Box sx={METRICS_GRID_SX}>
        <MetricCard icon={<CampaignOutlined size={20} />} iconColor="#8310FF" label="Campaigns"  value={campaignsValue}  sub="participated in" />
        <MetricCard icon={<CheckCircleOutlined size={20} />} iconColor="#16A34A" label="Interviews" value={interviewsValue} sub="passed" />
        <MetricCard icon={<PsychologyOutlined size={20} />} iconColor="#0891B2" label="Skills"     value={skillsValue}     sub="listed" />
        <MetricCard icon={<WorkHistoryOutlined size={20} />} iconColor="#D97706" label="Job Posts" value={jobPostsValue}   sub="created" />
      </Box>

      {Array.isArray(member.skills) && member.skills.length > 0 && (
        <Box sx={SKILLS_BOX_SX}>
          <Typography sx={SKILLS_LABEL_SX}>Skills</Typography>
          <Box sx={SKILLS_WRAP_SX}>
            {member.skills.map((skill) => (
              <Chip key={skill} label={skill} size="small" sx={skillChipSx} />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={STATS_GRID_SX}>
        <StatCard icon={<EmailOutlined size={18} />}         iconColor="#0891B2"   label="Email"        value={email} />
        <StatCard icon={<BadgeOutlined size={18} />}          iconColor={roleColor} label="Role"         value={roleLabel} />
        <StatCard icon={<BusinessOutlined size={18} />}      iconColor="#8B5CF6"   label="Department"   value={dept ?? "No department"} />
        <StatCard icon={<CalendarTodayOutlined size={18} />} iconColor="#16A34A"   label="Joined"       value={fmtDate(member.createdAt)} />
        <StatCard icon={<UpdateOutlined size={18} />}        iconColor="#D97706"   label="Last Updated" value={fmtDate(member.updatedAt)} />
      </Box>
    </motion.div>
  );
});

OverviewTab.displayName = "OverviewTab";
export default OverviewTab;
