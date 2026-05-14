import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Box, Typography, Chip, Skeleton, Divider, Button, Avatar, LinearProgress,
} from "@mui/material";
import Header from "@/components/layout/dashboard/Header";
import { RootState } from "@/store/store";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTime";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import EmojiEventsOutlined from "@mui/icons-material/EmojiEventsOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUncheckedOutlined";
import Cookies from "js-cookie";

const T    = "#0D9488";
const TL   = "#14B8A6";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  applied:             { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  pending:             { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  shortlisted:         { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  accepted:            { bg: TBG,       color: T,         border: TBRD      },
  rejected:            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  withdrawn:           { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
  interview_scheduled: { bg: TBG,       color: T,         border: TBRD      },
  interview_completed: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  viewed:              { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" },
  visited:             { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const StatPill: React.FC<{ label: string; value: number | string; color: string; bg: string; border: string }> = ({ label, value, color, bg, border }) => (
  <Box sx={{ flex: 1, px: 1.5, py: 1.25, borderRadius: "10px", bgcolor: bg, border: `1px solid ${border}`, textAlign: "center" }}>
    <Typography sx={{ fontSize: "1.3rem", fontWeight: 900, color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 500, mt: 0.25 }}>{label}</Typography>
  </Box>
);

const ProfileCard: React.FC<{
  displayName: string; email?: string; initial: string; avatarUrl?: string;
  targetRole?: string; experienceLevel?: string; totalApplications: number;
  t: (k: string, opts?: any) => string;
}> = ({ displayName, email, initial, avatarUrl, targetRole, experienceLevel, totalApplications, t }) => (
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
        <StatPill label={t("profile.applications")} value={totalApplications} color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />
        <StatPill label={t("profile.active")}       value={1}                 color={T}        bg={TBG}    border={TBRD}    />
      </Box>
    </Box>
  </Box>
);

const ProfileStrengthCard: React.FC<{ title: string; checklist: { label: string; done: boolean }[] }> = ({ title, checklist }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      <TrendingUpOutlined sx={{ fontSize: 16, color: "#7C3AED" }} />
      <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: NAVY }}>{title}</Typography>
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


const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);

const CandidateApplicationDetailPage: React.FC = () => {
  const router  = useRouter();
  const { id }  = router.query;
  const { t }   = useTranslation("dashboard");
  const s = (k: string, opts?: any) => t(`candidate.application_detail.${k}`, opts) as string;
  const statusLabel = (st: string) => {
    const key = `candidate.my_applications.status.${st}`;
    const res = t(key) as string;
    return res === key ? st : res;
  };
  const profile = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user    = useSelector((state: RootState) => state.user.connectedUser.user);

  const [app,     setApp]     = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = Cookies.get("api_token");
    if (!token) { setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}job-applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => setApp(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const displayName = profile?.firstName
    ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
    : user?.username || "Candidate";
  const initial   = displayName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : undefined;
  const quota = profile?.quota ?? 0;
  const checklist = [
    { label: s("checklist.complete_profile"), done: !!(profile?.firstName && profile?.lastName) },
    { label: s("checklist.add_target_role"),  done: !!profile?.targetRole                       },
    { label: s("checklist.set_experience"),   done: !!profile?.requiredExperienceLevel          },
    { label: s("checklist.first_skill_test"), done: quota > 0                                   },
  ];

  const post           = app?.post || {};
  const jd             = post.jobDetails || {};
  const title          = jd.title || "—";
  const location       = jd.location || "";
  const employmentType = jd.employmentType || "";
  const workMode       = jd.workMode || "";
  const description    = jd.description || "";
  const requirements   = jd.requirements || [];
  const salary         = jd.salary || null;
  const rawStatus      = (app?.status || "applied").toLowerCase();
  const sc             = STATUS_STYLE[rawStatus] ?? STATUS_STYLE.applied;
  const isScheduled    = rawStatus === "interview_scheduled";
  const interviewDate  = app?.interviewDate || null;
  const interviewTime  = app?.interviewTime || null;
  const interviewLink  = app?.interviewLink || null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "rgb(249 250 251)" }}>
      <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1200 }}>
        <Header breadcrumb={t("candidate.nav.dashboard")} onOpenMobile={() => {}} />
      </Box>

      <Box sx={{ flex: 1, mt: "64px", overflowY: "auto", overflowX: "hidden", p: { xs: 1.5, sm: 2.5, md: 3 } }} className="custom-scrollbar">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "240px 1fr", lg: "260px 1fr 240px" }, gap: 2.5, alignItems: "start" }}>

          {/* ── LEFT: profile sidebar ── */}
          <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16, maxHeight: "calc(100vh - 96px)", overflowY: "auto" }} className="custom-scrollbar">
            <ProfileCard
              displayName={displayName} email={user?.email} initial={initial} avatarUrl={avatarUrl}
              targetRole={profile?.targetRole} experienceLevel={profile?.requiredExperienceLevel}
              totalApplications={1}
              t={(k, opts) => t(`candidate.application_detail.${k}`, opts) as string}
            />
            <ProfileStrengthCard title={s("profile_strength")} checklist={checklist} />
          </Box>

          {/* ── CENTER: main content ── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Back nav */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                size="small"
                startIcon={<ChevronLeftOutlined sx={{ fontSize: "14px !important" }} />}
                onClick={() => router.push("/candidate/dashboard")}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.72rem", color: "#6B7280", bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "10px", px: 1.5, py: 0.5, "&:hover": { bgcolor: "#F3F4F6" }, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                {s("back_to_dashboard")}
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "0.72rem", color: "#94A3B8" }}>
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{t("candidate.nav.dashboard")}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1" }}>›</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{t("candidate.nav.applications")}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#CBD5E1" }}>›</Typography>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: NAVY }}>{loading ? s("loading_title") : title}</Typography>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Skeleton variant="text" width="50%" height={28} />
                <Skeleton variant="text" width="30%" height={18} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mt: 2 }} />
              </Box>
            ) : !app ? (
              <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", py: 10, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <AssignmentOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
                <Typography sx={{ color: "#9CA3AF", fontWeight: 600 }}>{s("not_found")}</Typography>
              </Box>
            ) : (
              <>
                {isScheduled && (
                  <Box sx={{ bgcolor: T, borderRadius: "16px", p: 2.5, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", boxShadow: `0 4px 16px ${T}40` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VideoCallOutlined sx={{ fontSize: 22, color: "#fff" }} />
                      <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{s("interview_banner.title")}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, ml: { xs: 0, sm: "auto" } }}>
                      {interviewDate && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarTodayOutlined sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }} />
                          <Typography sx={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{interviewDate}</Typography>
                        </Box>
                      )}
                      {interviewTime && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <AccessTimeOutlined sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }} />
                          <Typography sx={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{interviewTime}</Typography>
                        </Box>
                      )}
                      {interviewLink && (
                        <Button variant="contained" size="small"
                          startIcon={<LinkOutlined sx={{ fontSize: 14 }} />}
                          onClick={() => window.open(interviewLink, "_blank")}
                          sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem", bgcolor: "#fff", color: T, borderRadius: "8px", boxShadow: "none", px: 1.5, "&:hover": { bgcolor: TBG, boxShadow: "none" } }}
                        >
                          {s("interview_banner.join")}
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T}, ${TL})` }} />
                  <Box sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                      <Box sx={{ width: 52, height: 52, borderRadius: "12px", bgcolor: TBG, border: `1px solid ${TBRD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <WorkOutlineOutlined sx={{ fontSize: 24, color: T }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                          <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY }}>{title}</Typography>
                          <Chip label={statusLabel(rawStatus)} size="small" sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
                        </Box>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
                          {location && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                              <LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                              <Typography sx={{ fontSize: "0.78rem", color: "#6B7280" }}>{location}</Typography>
                            </Box>
                          )}
                          {employmentType && <Chip label={employmentType} size="small" sx={{ height: 20, fontSize: "0.67rem", bgcolor: "#F3F4F6", color: "#374151" }} />}
                          {workMode && <Chip label={workMode} size="small" sx={{ height: 20, fontSize: "0.67rem", bgcolor: "#F3F4F6", color: "#374151" }} />}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, ml: "auto" }}>
                            <CalendarTodayOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                            <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>{s("applied_on", { date: fmtDate(app.appliedAt || app.createdAt) })}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {salary && (salary.min || salary.max) && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BusinessCenterOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />
                          <Typography sx={{ fontSize: "0.82rem", color: "#374151", fontWeight: 600 }}>
                            {salary.min && salary.max ? `${salary.min} – ${salary.max}` : salary.min || salary.max} {salary.currency || ""}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>

                {(app.matchScore != null || app.cvAnalysis?.analysisScore != null) && (() => {
                  const score = app.matchScore ?? app.cvAnalysis?.analysisScore;
                  const scoreColor = score >= 70 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
                  const r = 34; const circ = 2 * Math.PI * r;
                  const filled = (Math.min(score, 100) / 100) * circ;
                  return (
                    <Section icon={<BusinessCenterOutlined sx={{ fontSize: 14, color: T }} />} title={s("cv_match_score.title")}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                        <Box sx={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                          <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                            <circle cx={40} cy={40} r={r} fill="none" stroke={`${scoreColor}18`} strokeWidth={7} />
                            <circle cx={40} cy={40} r={r} fill="none" stroke={scoreColor} strokeWidth={7}
                              strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
                          </svg>
                          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}%</Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: NAVY }}>
                            {score >= 70 ? s("cv_match_score.strong") : score >= 50 ? s("cv_match_score.good") : s("cv_match_score.low")}
                          </Typography>
                          <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mt: 0.5 }}>
                            {s("cv_match_score.subtitle", { score })}
                          </Typography>
                        </Box>
                      </Box>
                    </Section>
                  );
                })()}

                {description && (
                  <Section icon={<WorkOutlineOutlined sx={{ fontSize: 14, color: T }} />} title={s("job_description")}>
                    <Typography sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{description}</Typography>
                  </Section>
                )}

                {requirements.length > 0 && (
                  <Section icon={<BusinessCenterOutlined sx={{ fontSize: 14, color: T }} />} title={s("requirements")}>
                    <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                      {requirements.map((r: string, i: number) => (
                        <Box component="li" key={i} sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8 }}>{r}</Box>
                      ))}
                    </Box>
                  </Section>
                )}
              </>
            )}
          </Box>

          {/* ── RIGHT: status timeline ── */}
          <Box sx={{ display: { xs: "none", lg: "flex" }, flexDirection: "column", gap: 2, position: "sticky", top: 16 }}>

            {app && !loading && (
              <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.25 }}>
                  {s("details")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                  {location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOnOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{location}</Typography>
                    </Box>
                  )}
                  {employmentType && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <WorkOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{employmentType}</Typography>
                    </Box>
                  )}
                  {workMode && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BusinessCenterOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
                      <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{workMode}</Typography>
                    </Box>
                  )}
                  <Divider />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarTodayOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{s("applied_on", { date: fmtDate(app.appliedAt || app.createdAt) })}</Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

        </Box>
      </Box>
    </Box>
  );
};

export default dynamic(() => Promise.resolve(CandidateApplicationDetailPage), { ssr: false });
