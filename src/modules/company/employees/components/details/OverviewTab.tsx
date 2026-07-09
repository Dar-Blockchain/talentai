import React, { memo } from "react";
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
import { Badge } from "@/modules/shared/ui/shadcn/badge";
import StatCard from "./StatCard";
import MetricCard from "./MetricCard";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { PURPLE, fmtDate } from "@/modules/company/employees/constants";

const MOTION_PROPS = { key: "overview", initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -4 }, transition: { duration: 0.2 } } as const;

interface OverviewTabProps {
  member: ExtendedMember;
  email: string;
  roleLabel: string;
  roleColor: string;
  dept: string | null;
}

const OverviewTab: React.FC<OverviewTabProps> = memo(({ member, email, roleLabel, roleColor, dept }) => {
  const campaignsValue = member.campaignsCount ?? member.campaigns?.length ?? "—";
  const interviewsValue = member.interviewsPassed ?? "—";
  const skillsValue = member.skills?.length ?? "—";
  const jobPostsValue = member.jobPostsCount ?? "—";

  return (
    <motion.div {...MOTION_PROPS}>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard icon={<CampaignOutlined size={20} />} iconColor="#8310FF" label="Campaigns"  value={campaignsValue}  sub="participated in" />
        <MetricCard icon={<CheckCircleOutlined size={20} />} iconColor="#16A34A" label="Interviews" value={interviewsValue} sub="passed" />
        <MetricCard icon={<PsychologyOutlined size={20} />} iconColor="#0891B2" label="Skills"     value={skillsValue}     sub="listed" />
        <MetricCard icon={<WorkHistoryOutlined size={20} />} iconColor="#D97706" label="Job Posts" value={jobPostsValue}   sub="created" />
      </div>

      {Array.isArray(member.skills) && member.skills.length > 0 && (
        <div className="mb-4 rounded-2xl border border-[#E8EAED] bg-white p-[18px]">
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="h-[26px] rounded-lg px-2 text-xs font-semibold"
                style={{ backgroundColor: `${PURPLE}0C`, color: PURPLE, borderColor: `${PURPLE}20` }}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        <StatCard icon={<EmailOutlined size={18} />}         iconColor="#0891B2"   label="Email"        value={email} />
        <StatCard icon={<BadgeOutlined size={18} />}          iconColor={roleColor} label="Role"         value={roleLabel} />
        <StatCard icon={<BusinessOutlined size={18} />}      iconColor="#8B5CF6"   label="Department"   value={dept ?? "No department"} />
        <StatCard icon={<CalendarTodayOutlined size={18} />} iconColor="#16A34A"   label="Joined"       value={fmtDate(member.createdAt)} />
        <StatCard icon={<UpdateOutlined size={18} />}        iconColor="#D97706"   label="Last Updated" value={fmtDate(member.updatedAt)} />
      </div>
    </motion.div>
  );
});

OverviewTab.displayName = "OverviewTab";
export default OverviewTab;
