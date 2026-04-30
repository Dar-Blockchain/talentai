import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { Box, Typography, Chip, Skeleton, Divider, Button } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTime";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import Cookies from "js-cookie";

const T  = "#0D9488";
const TBG = "#F0FDFA";
const TBORDER = "#99F6E4";

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  applied:             { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", label: "Applied" },
  pending:             { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Pending" },
  shortlisted:         { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Shortlisted" },
  accepted:            { bg: TBG,       color: T,         border: TBORDER,   label: "Accepted" },
  rejected:            { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Rejected" },
  withdrawn:           { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", label: "Withdrawn" },
  interview_scheduled: { bg: TBG,       color: T,         border: TBORDER,   label: "Interview Scheduled" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", p: 3, mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);

const CandidateApplicationDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token = Cookies.get("api_token");
    if (!token) { setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}job-applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => setApp(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
    <DashboardLayout>
      <PageHeader
        title={loading ? "Application" : title}
        subtitle="View your application details"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard/candidate" },
          { label: "Applications" },
          { label: loading ? "..." : title },
        ]}
        icon={AssignmentOutlined}
      />

      {loading ? (
        <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", p: 3 }}>
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton variant="text" width="30%" height={18} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mt: 2 }} />
        </Box>
      ) : !app ? (
        <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", py: 10, textAlign: "center" }}>
          <Typography sx={{ color: "#9CA3AF" }}>Application not found</Typography>
        </Box>
      ) : (
        <>
          {/* Interview scheduled banner */}
          {isScheduled && (
            <Box sx={{ bgcolor: T, borderRadius: "14px", p: 2.5, mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VideoCallOutlined sx={{ fontSize: 22, color: "#fff" }} />
                <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>Your interview is scheduled!</Typography>
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
                    sx={{
                      textTransform: "none", fontWeight: 700, fontSize: "0.78rem",
                      bgcolor: "#fff", color: T, borderRadius: "8px", boxShadow: "none", px: 1.5,
                      "&:hover": { bgcolor: TBG, boxShadow: "none" },
                    }}
                  >
                    Join Interview
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Job card */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #E5E7EB", overflow: "hidden", mb: 2 }}>
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T}, #14B8A6)` }} />
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ width: 52, height: 52, borderRadius: "12px", bgcolor: TBG, border: `1px solid ${TBORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <WorkOutlineOutlined sx={{ fontSize: 24, color: T }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: "#111827" }}>{title}</Typography>
                    <Chip label={sc.label} size="small" sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }} />
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
                      <Typography sx={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Applied {fmtDate(app.appliedAt || app.createdAt)}</Typography>
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

          {description && (
            <Section icon={<WorkOutlineOutlined sx={{ fontSize: 15, color: T }} />} title="Job Description">
              <Typography sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{description}</Typography>
            </Section>
          )}

          {requirements.length > 0 && (
            <Section icon={<BusinessCenterOutlined sx={{ fontSize: 15, color: T }} />} title="Requirements">
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {requirements.map((r: string, i: number) => (
                  <Box component="li" key={i} sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.8 }}>{r}</Box>
                ))}
              </Box>
            </Section>
          )}

          {(app.matchScore != null || app.cvAnalysis?.analysisScore != null) && (() => {
            const score = app.matchScore ?? app.cvAnalysis?.analysisScore;
            const scoreColor = score >= 70 ? "#059669" : score >= 50 ? "#D97706" : "#DC2626";
            const r = 34; const circ = 2 * Math.PI * r;
            const filled = (Math.min(score, 100) / 100) * circ;
            return (
              <Section icon={<BusinessCenterOutlined sx={{ fontSize: 15, color: T }} />} title="CV Match Score">
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
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>
                      {score >= 70 ? "Strong Match" : score >= 50 ? "Good Match" : "Low Match"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", mt: 0.5 }}>
                      Your profile matches {score}% of the job requirements.
                    </Typography>
                  </Box>
                </Box>
              </Section>
            );
          })()}
        </>
      )}
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(CandidateApplicationDetailPage), { ssr: false });
