import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Avatar, LinearProgress, Button, Divider, Chip } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Header from "@/components/layout/dashboard/Header";
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
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import ExpandMoreOutlined from "@mui/icons-material/ExpandMoreOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import RecordVoiceOverOutlined from "@mui/icons-material/RecordVoiceOverOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { DashboardOutlined } from "@mui/icons-material";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

type ActiveView = "applications" | "skills" | "interviews" | null;

// ── Primitives ────────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: number | string; color: string; bg: string; border: string }> = ({ label, value, color, bg, border }) => (
  <Box sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: bg, border: `1px solid ${border}`, textAlign: "center" }}>
    <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
  </Box>
);

const HideBar: React.FC<{ onHide: () => void }> = ({ onHide }) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
    <Button size="small" startIcon={<ChevronLeftOutlined sx={{ fontSize: "14px !important" }} />} onClick={onHide}
      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 0.5, "&:hover": { bgcolor: "#F3F4F6" } }}>
      Hide
    </Button>
  </Box>
);

const CollapsedRow: React.FC<{
  icon: React.ReactNode; iconBg: string; iconBorder: string;
  title: string; subtitle: string; color: string; onExpand: () => void;
}> = ({ icon, iconBg, iconBorder, title, subtitle, color, onExpand }) => (
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
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color }}>View All</Typography>
      <ExpandMoreOutlined sx={{ fontSize: 14, color }} />
    </Box>
  </Box>
);

const QuickNavItem: React.FC<{
  icon: React.ElementType; label: string; sublabel?: string;
  color: string; bg: string; border: string; active: boolean; onExpand: () => void;
}> = ({ icon: Icon, label, sublabel, color, bg, border, active, onExpand }) => (
  <Box onClick={onExpand} sx={{
    display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1.1,
    borderRadius: "12px", cursor: "pointer",
    border: `1px solid ${active ? border : "#E5E7EB"}`,
    bgcolor: active ? bg : "#FAFAFA",
    transition: "all 0.18s ease",
    "&:hover": { borderColor: border, bgcolor: bg },
  }}>
    <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: active ? `${color}18` : "#fff", border: `1px solid ${active ? border : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 16, color: active ? color : "#6B7280" }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: active ? 700 : 500, color: active ? color : "#374151", lineHeight: 1.2 }}>{label}</Typography>
      {sublabel && <Typography sx={{ fontSize: "0.62rem", color: "#94A3B8" }}>{sublabel}</Typography>}
    </Box>
    {active && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />}
  </Box>
);

const DisabledAction: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, borderRadius: "10px", border: "1px solid #E5E7EB", bgcolor: "#F9FAFB", px: 1.5, py: 1, cursor: "not-allowed", opacity: 0.55 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 15, color: "#9CA3AF" }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#9CA3AF", lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.62rem", color: "#9CA3AF" }}>Coming soon</Typography>
    </Box>
    <LockOutlined sx={{ fontSize: 13, color: "#9CA3AF", flexShrink: 0 }} />
  </Box>
);

// ── Left sidebar cards ────────────────────────────────────────

const ProfileCard: React.FC<{
  displayName: string; email?: string; initial: string; avatarUrl?: string;
  targetRole?: string; experienceLevel?: string; totalApplications: number; totalInterviews: number;
}> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel, totalApplications, totalInterviews }) => (
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
      <Box sx={{ display: "flex", gap: 1 }}>
        <StatPill label="Applications" value={totalApplications} color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />
        <StatPill label="Interviews"   value={totalInterviews}   color={T}        bg={TBG}    border={TBRD}    />
      </Box>
    </Box>
  </Box>
);

const QuotaCard: React.FC<{ quota: number }> = ({ quota }) => {
  const quotaData = [
    { name: "Used",      value: quota,                  fill: T         },
    { name: "Remaining", value: Math.max(0, 5 - quota), fill: "#E5E7EB" },
  ];
  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <QuizOutlined sx={{ fontSize: 16, color: T }} />
        <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>Monthly Tests</Typography>
        <Chip label={quota >= 5 ? "Maxed" : `${5 - quota} left`} size="small"
          sx={{ ml: "auto", fontSize: "0.6rem", height: 18, fontWeight: 700, bgcolor: quota >= 5 ? "#FEF2F2" : TBG, color: quota >= 5 ? "#DC2626" : T, border: `1px solid ${quota >= 5 ? "#FECACA" : TBRD}` }} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ResponsiveContainer width={70} height={70}>
          <PieChart>
            <Pie data={quotaData} cx="50%" cy="50%" innerRadius={22} outerRadius={32} startAngle={90} endAngle={-270} dataKey="value" paddingAngle={2}>
              {quotaData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 14, fontWeight: 800, fill: NAVY }}>{quota}</text>
            <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 8, fill: "#9CA3AF" }}>of 5</text>
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <Box key={n} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: n <= quota ? T : "#E5E7EB", transition: "all 0.3s" }} />
              <Box sx={{ flex: 1, height: 4, borderRadius: "99px", bgcolor: "#F3F4F6", overflow: "hidden" }}>
                <Box sx={{ height: "100%", borderRadius: "99px", bgcolor: n <= quota ? T : "transparent", width: n <= quota ? "100%" : "0%", transition: "width 0.6s ease" }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const ProfileStrengthCard: React.FC<{ checklist: { label: string; done: boolean }[] }> = ({ checklist }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <TrendingUpOutlined sx={{ fontSize: 16, color: "#7C3AED" }} />
      <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>Profile Strength</Typography>
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

const QuotaBar: React.FC<{ quota: number }> = ({ quota }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, borderRadius: "10px", border: `1px solid ${quota >= 5 ? "#FECACA" : TBRD}`, bgcolor: quota >= 5 ? "#FEF2F2" : TBG, px: 1.5, py: 1 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: quota >= 5 ? "#FEE2E2" : "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <QuizOutlined sx={{ fontSize: 15, color: quota >= 5 ? "#DC2626" : T }} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.4 }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: quota >= 5 ? "#991B1B" : NAVY, lineHeight: 1 }}>Monthly Quota</Typography>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: quota >= 5 ? "#DC2626" : T }}>{quota}/5</Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 0.4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <Box key={n} sx={{ flex: 1, height: 4, borderRadius: "99px", bgcolor: n <= quota ? (quota >= 5 ? "#DC2626" : T) : "#E5E7EB" }} />
        ))}
      </Box>
    </Box>
  </Box>
);

// ── Page ─────────────────────────────────────────────────────

const QUICK_LINKS: { icon: React.ElementType; label: string; sublabel: string; view: ActiveView; color: string; bg: string; border: string }[] = [
  { icon: DashboardOutlined,  label: "Dashboard",    sublabel: "Overview",         view: null,           color: T,         bg: TBG,       border: TBRD      },
  { icon: AssignmentOutlined, label: "Applications", sublabel: "Your job applies", view: "applications", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { icon: PsychologyOutlined, label: "Skills",       sublabel: "Tech & soft",      view: "skills",       color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  { icon: SchoolOutlined,     label: "Interviews",   sublabel: "All assessments",  view: "interviews",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
];

const DashboardCandidate: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const stats    = useSelector(selectCandidateStats);
  const quota    = profile?.quota ?? 0;

  const [activeView, setActiveView] = useState<ActiveView>(null);

  useEffect(() => { dispatch(fetchCandidateStats()); }, [dispatch]);

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
    { label: "Complete your profile",      done: !!(profile?.firstName && profile?.lastName) },
    { label: "Add a target role",          done: !!profile?.targetRole                       },
    { label: "Set experience level",       done: !!profile?.requiredExperienceLevel          },
    { label: "Take your first skill test", done: quota > 0                                   },
    { label: "Submit an application",      done: totalApplications > 0                       },
  ];

  const expand = (view: ActiveView) => setActiveView(view);
  const hide   = () => setActiveView(null);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "rgb(249 250 251)" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header breadcrumb="Dashboard" onOpenMobile={() => {}} />
      </Box>

      <Box sx={{ flex: 1, mt: "64px", overflowY: "auto", overflowX: "hidden", p: { xs: 1.5, sm: 2.5, md: 3 } }} className="custom-scrollbar">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr", lg: "260px 1fr 240px" }, gap: 2.5, alignItems: "start" }}>

          {/* ── LEFT ── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16, maxHeight: "calc(100vh - 96px)", overflowY: "auto" }} className="custom-scrollbar">
            <ProfileCard
              displayName={displayName} email={user?.email} initial={initial} avatarUrl={avatarUrl}
              targetRole={profile?.targetRole} experienceLevel={profile?.requiredExperienceLevel}
              totalApplications={totalApplications} totalInterviews={totalInterviews}
            />
            <QuotaCard quota={quota} />
            <ProfileStrengthCard checklist={checklist} />
          </Box>

          {/* ── CENTER ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Action bar */}
            <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", px: 2, py: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.25 }}>
                <DisabledAction icon={CodeOutlined}            label="Skill Interview" />
                <DisabledAction icon={RecordVoiceOverOutlined} label="HR Interview"    />
                <QuotaBar quota={quota} />
              </Box>
            </Box>

            {/* Applications */}
            {activeView === "applications" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} />
                <CandidateApplications />
              </Box>
            ) : (
              <CandidateApplications previewCount={2} onViewAll={() => expand("applications")} />
            )}

            {/* Skills */}
            {activeView === "skills" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} />
                <CandidateSkills />
              </Box>
            ) : activeView === null && (
              <CollapsedRow
                icon={<PsychologyOutlined sx={{ fontSize: 16, color: "#2563EB" }} />}
                iconBg="#EFF6FF" iconBorder="#BFDBFE"
                title="Skills & Expertise" subtitle="Your technical and soft skills"
                color="#2563EB" onExpand={() => expand("skills")}
              />
            )}

            {/* Interviews */}
            {activeView === "interviews" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <HideBar onHide={hide} />
                <InterviewsBlock />
              </Box>
            ) : activeView === null && (
              <CollapsedRow
                icon={<SchoolOutlined sx={{ fontSize: 16, color: "#D97706" }} />}
                iconBg="#FFFBEB" iconBorder="#FDE68A"
                title="Interviews & Assessments" subtitle="Job interviews, technical & soft"
                color="#D97706" onExpand={() => expand("interviews")}
              />
            )}
          </Box>

          {/* ── RIGHT — Quick nav ── */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16 }}>
            <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.25 }}>Navigation</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {QUICK_LINKS.map(link => (
                  <QuickNavItem
                    key={link.label}
                    icon={link.icon} label={link.label} sublabel={link.sublabel}
                    color={link.color} bg={link.bg} border={link.border}
                    active={activeView === link.view}
                    onExpand={() => link.view === null ? hide() : expand(link.view)}
                  />
                ))}
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(DashboardCandidate), { ssr: false });
