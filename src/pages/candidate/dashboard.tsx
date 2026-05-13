import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Typography, Avatar, LinearProgress, Button, Divider, Chip } from "@mui/material";
import CandidateWorkspaceLayout from "@/components/layout/candidate/CandidateWorkspaceLayout";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCandidateStats, selectCandidateStats } from "@/store/slices/jobApplicationSlice";
import CandidateApplications from "@/components/features/candidate/CandidateApplications";
import CandidateSkills from "@/components/features/candidate/candidate-skills/CandidateSkills";
import InterviewsBlock from "@/components/features/candidate/candidate-interviews/InterviewsBlock";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import RecordVoiceOverOutlined from "@mui/icons-material/RecordVoiceOverOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

type ActiveView = "applications" | "skills" | "interviews" | null;

const StatPill: React.FC<{ label: string; value: number | string; color: string; bg: string; border: string }> = ({ label, value, color, bg, border }) => (
  <Box sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: bg, border: `1px solid ${border}`, textAlign: "center" }}>
    <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
  </Box>
);

const HideBar: React.FC<{ onHide: () => void; label: string }> = ({ onHide, label }) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
    <Button size="small" startIcon={<ChevronLeftOutlined sx={{ fontSize: "14px !important" }} />} onClick={onHide}
      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 0.5, "&:hover": { bgcolor: "#F3F4F6" } }}>
      {label}
    </Button>
  </Box>
);

const CollapsedRow: React.FC<{
  icon: React.ReactNode; iconBg: string; iconBorder: string;
  title: string; subtitle: string; color: string; viewAllLabel: string; onExpand: () => void;
}> = ({ icon, iconBg, iconBorder, title, subtitle, color, viewAllLabel, onExpand }) => (
  <Box onClick={onExpand} sx={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB",
    px: 2.5, py: 1.5, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    transition: "all 0.18s",
    "&:hover": { borderColor: color, boxShadow: `0 2px 12px ${color}18`, bgcolor: "#FAFAFA" },
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: iconBg, border: `1px solid ${iconBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ fontSize: "0.66rem", color: "#9CA3AF" }}>{subtitle}</Typography>
      </Box>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.5, borderRadius: "8px", bgcolor: `${color}10`, border: `1px solid ${color}30` }}>
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color }}>{viewAllLabel}</Typography>
      <ExpandMoreOutlined sx={{ fontSize: 14, color }} />
    </Box>
  </Box>
);

const DisabledAction: React.FC<{ icon: React.ElementType; label: string; sublabel: string }> = ({ icon: Icon, label, sublabel }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, borderRadius: "10px", border: "1px solid #E5E7EB", bgcolor: "#F9FAFB", px: 1.5, py: 1, cursor: "not-allowed", opacity: 0.55 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 15, color: "#9CA3AF" }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#9CA3AF", lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.62rem", color: "#9CA3AF" }}>{sublabel}</Typography>
    </Box>
    <LockOutlined sx={{ fontSize: 13, color: "#9CA3AF", flexShrink: 0 }} />
  </Box>
);

const ProfileCard: React.FC<{
  displayName: string; email?: string; initial: string; avatarUrl?: string;
  targetRole?: string; experienceLevel?: string; totalApplications: number; totalInterviews: number;
  labelApplications: string; labelInterviews: string;
}> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel, totalApplications, totalInterviews, labelApplications, labelInterviews }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ height: 56, background: `linear-gradient(135deg, ${NAVY} 0%, ${T} 100%)`, position: "relative" }}>
      <Box sx={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", bgcolor: `${TL}30`, border: `1px solid ${TL}40` }} />
    </Box>
    <Box sx={{ px: 2, pb: 2 }}>
      <Box sx={{ mt: -3, mb: 1 }}>
        <Avatar src={avatarUrl} sx={{ width: 52, height: 52, bgcolor: T, fontSize: "1.2rem", fontWeight: 700, border: "2.5px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          {initial}
        </Avatar>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: NAVY, lineHeight: 1.2 }}>{displayName}</Typography>
      {email && <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF", mt: 0.25, mb: 1 }}>{email}</Typography>}
      {targetRole && <Chip label={targetRole} size="small" sx={{ fontSize: "0.65rem", height: 20, bgcolor: TBG, border: `1px solid ${TBRD}`, color: T, fontWeight: 600, mb: 1 }} />}
      {experienceLevel && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <EmojiEventsOutlined sx={{ fontSize: 12, color: "#D97706" }} />
          <Typography sx={{ fontSize: "0.7rem", color: "#6B7280", fontWeight: 500 }}>{experienceLevel}</Typography>
        </Box>
      )}
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderRadius: "10px", bgcolor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AssignmentOutlined sx={{ fontSize: 14, color: "#7C3AED" }} />
            </Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{labelApplications}</Typography>
          </Box>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: "#7C3AED" }}>{totalApplications}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1, borderRadius: "10px", bgcolor: TBG, border: `1px solid ${TBRD}` }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SchoolOutlined sx={{ fontSize: 14, color: T }} />
            </Box>
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{labelInterviews}</Typography>
          </Box>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: T }}>{totalInterviews}</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

const ProfileStrengthCard: React.FC<{ checklist: { label: string; done: boolean }[]; label: string }> = ({ checklist, label }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <TrendingUpOutlined sx={{ fontSize: 16, color: "#7C3AED" }} />
      <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>{label}</Typography>
    </Box>
    <LinearProgress variant="determinate"
      value={Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)}
      sx={{ height: 5, borderRadius: "99px", bgcolor: "#F3F4F6", mb: 1.5, "& .MuiLinearProgress-bar": { borderRadius: "99px", bgcolor: "#7C3AED" } }} />
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {checklist.map((item, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {item.done
            ? <CheckCircleOutlined sx={{ fontSize: 14, color: "#059669" }} />
            : <RadioButtonUncheckedOutlined sx={{ fontSize: 14, color: "#D1D5DB" }} />}
          <Typography sx={{ fontSize: "0.72rem", color: item.done ? "#374151" : "#9CA3AF", fontWeight: item.done ? 500 : 400 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

const DashboardCandidate: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const stats    = useSelector(selectCandidateStats);

  const [activeView, setActiveView] = useState<ActiveView>(null);

  useEffect(() => { dispatch(fetchCandidateStats()); }, [dispatch]);

  useEffect(() => {
    const view = router.query.view;
    if (view === "applications" || view === "skills" || view === "interviews") {
      setActiveView(view);
      return;
    }
    setActiveView(null);
  }, [router.query.view]);

  const totalApplications = stats?.totalApplications ?? 0;
  const totalInterviews   = stats?.totalInterviews   ?? 0;

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : undefined;

  const checklist = [
    { label: t("candidate.checklist.complete_profile"), done: !!(profile?.firstName && profile?.lastName) },
    { label: t("candidate.checklist.add_target_role"),  done: !!profile?.targetRole                       },
    { label: t("candidate.checklist.set_experience"),   done: !!profile?.requiredExperienceLevel          },
    { label: t("candidate.checklist.first_application"),done: totalApplications > 0                       },
  ];

  const expand = (view: ActiveView) => {
    if (!view) {
      setActiveView(null);
      router.replace("/candidate/dashboard", undefined, { shallow: true });
      return;
    }
    setActiveView(view);
    router.replace(`/candidate/dashboard?view=${view}`, undefined, { shallow: true });
  };
  const hide = () => expand(null);

  return (
    <CandidateWorkspaceLayout breadcrumb={t("candidate.nav.dashboard")}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr" }, gap: 2.5, alignItems: "start" }}>

          {/* ── LEFT ── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16, maxHeight: "calc(100vh - 96px)", overflowY: "auto" }} className="custom-scrollbar">
            <ProfileCard
              displayName={displayName} email={user?.email} initial={initial} avatarUrl={avatarUrl}
              targetRole={profile?.targetRole} experienceLevel={profile?.requiredExperienceLevel}
              totalApplications={totalApplications} totalInterviews={totalInterviews}
              labelApplications={t("candidate.profile.applications")}
              labelInterviews={t("candidate.profile.interviews")}
            />
            <ProfileStrengthCard checklist={checklist} label={t("candidate.profile.profile_strength")} />
          </Box>

          {/* ── CENTER ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Action bar */}
            <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", px: 2, py: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.25 }}>
                <DisabledAction icon={CodeOutlined}            label={t("candidate.actions.skill_interview")} sublabel={t("candidate.actions.coming_soon")} />
                <DisabledAction icon={RecordVoiceOverOutlined} label={t("candidate.actions.hr_interview")}    sublabel={t("candidate.actions.coming_soon")} />
              </Box>
            </Box>

            {/* Applications */}
            {activeView === "applications" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} label={t("candidate.actions.hide")} />
                <CandidateApplications />
              </Box>
            ) : (
              <CandidateApplications previewCount={2} onViewAll={() => expand("applications")} />
            )}

            {/* Skills */}
            {activeView === "skills" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} label={t("candidate.actions.hide")} />
                <CandidateSkills />
              </Box>
            ) : activeView === null && (
              <CollapsedRow
                icon={<PsychologyOutlined sx={{ fontSize: 16, color: "#2563EB" }} />}
                iconBg="#EFF6FF" iconBorder="#BFDBFE"
                title={t("candidate.sections.skills_title")} subtitle={t("candidate.sections.skills_subtitle")}
                color="#2563EB" onExpand={() => expand("skills")}
                viewAllLabel={t("candidate.actions.view_all")}
              />
            )}

            {/* Interviews */}
            {activeView === "interviews" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} label={t("candidate.actions.hide")} />
                <InterviewsBlock />
              </Box>
            ) : activeView === null && (
              <CollapsedRow
                icon={<SchoolOutlined sx={{ fontSize: 16, color: "#D97706" }} />}
                iconBg="#FFFBEB" iconBorder="#FDE68A"
                title={t("candidate.sections.interviews_title")} subtitle={t("candidate.sections.interviews_subtitle")}
                color="#D97706" onExpand={() => expand("interviews")}
                viewAllLabel={t("candidate.actions.view_all")}
              />
            )}
          </Box>
        </Box>
    </CandidateWorkspaceLayout>
  );
};

export default dynamic(() => Promise.resolve(DashboardCandidate), { ssr: false });
