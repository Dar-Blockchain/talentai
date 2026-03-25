import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import {
  Box, Typography, Avatar, Chip, Divider, Skeleton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from "@mui/material";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import CodeOutlined from "@mui/icons-material/CodeOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import axiosInstance from "@/utils/axiosInstance";

const AVATAR_COLORS = ["#0D9488", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const getCvUrl = (app: any): string | null => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  if (app.profile?.resume) return `${base}images/Users/${app.profile.resume}`;
  if (app.cvAnalysis?.sourceUrl) {
    const src = app.cvAnalysis.sourceUrl as string;
    if (src.startsWith("http")) return src;
    return `${base}${src.replace(/^public\//, "")}`;
  }
  return null;
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  applied:     { bg: "#EFF6FF", color: "#2563EB" },
  pending:     { bg: "#FFFBEB", color: "#D97706" },
  shortlisted: { bg: "#F0FDF4", color: "#16A34A" },
  accepted:    { bg: "#F0FDFA", color: "#0D9488" },
  rejected:    { bg: "#FEF2F2", color: "#DC2626" },
  withdrawn:   { bg: "#F3F4F6", color: "#6B7280" },
};

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3, mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);

const ApplicationDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteDate, setInviteDate] = useState<Dayjs | null>(null);
  const [inviteTime, setInviteTime] = useState<Dayjs | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteDone, setInviteDone] = useState(false);

  const handleInvite = async () => {
    if (!id || !inviteDate || !inviteTime || !inviteLink) return;
    setInviteSending(true);
    try {
      await axiosInstance.post(`job-applications/${id}/invite-to-interview`, {
        interviewDate: dayjs(inviteDate).format("YYYY-MM-DD"),
        interviewTime: dayjs(inviteTime).format("HH:mm"),
        interviewLink: inviteLink,
      });
      setInviteDone(true);
      setTimeout(() => { setInviteOpen(false); setInviteDone(false); }, 1500);
    } catch {
      // ignore
    } finally {
      setInviteSending(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    axiosInstance.get(`job-applications/${id}`)
      .then((res) => setApp(res.data?.data ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const profile = app?.profile || {};
  const cv = app?.cvAnalysis || {};
  const name = profile.firstName && profile.lastName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : cv.name || "Candidate";
  const email = (profile.userId as any)?.email || profile.contactInformation?.email || "";
  const phone = profile.phone || cv.phone || "";
  const location = profile.contactInformation?.location || cv.location || "";
  const title = cv.title || "";
  const summary = cv.summary || "";
  const skills: string[] = cv.skills || profile.skills?.map((s: any) => s.name) || [];
  const experience = cv.experience || [];
  const education = cv.education || [];
  const cvScore = app?.matchScore ?? cv.analysisScore ?? null;
  const postTitle = app?.post?.jobDetails?.title || "—";
  const status = (app?.status || "applied").toLowerCase();
  const sc = STATUS_STYLE[status] ?? STATUS_STYLE.applied;
  const cvUrl = app ? getCvUrl(app) : null;

  return (
    <DashboardLayout>
      <PageHeader
        title={loading ? "Application" : name}
        subtitle={loading ? "" : postTitle}
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Applications", href: "/company/applications" },
          { label: loading ? "..." : name },
        ]}
      />

      {loading ? (
        <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <Skeleton variant="circular" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="25%" height={16} sx={{ mt: 0.5 }} />
              <Skeleton variant="text" width="35%" height={14} sx={{ mt: 0.5 }} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        </Box>
      ) : !app ? (
        <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", py: 10, textAlign: "center" }}>
          <Typography sx={{ color: "#9CA3AF" }}>Application not found</Typography>
        </Box>
      ) : (
        <>
          {/* Profile card */}
          <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 3, mb: 2, display: "flex", alignItems: "flex-start", gap: 2.5, flexWrap: "wrap" }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: AVATAR_COLORS[0], fontSize: "20px", fontWeight: 700, flexShrink: 0 }}>
              {getInitials(name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>{name}</Typography>
                <Chip label={status.charAt(0).toUpperCase() + status.slice(1)} size="small"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color }} />
              </Box>
              {title && <Typography sx={{ fontSize: "0.85rem", color: "#6B7280", mb: 0.75 }}>{title}</Typography>}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {email && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><EmailOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{email}</Typography></Box>}
                {phone && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><PhoneOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{phone}</Typography></Box>}
                {location && <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><LocationOnOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.8rem", color: "#6B7280" }}>{location}</Typography></Box>}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><CalendarTodayOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} /><Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Applied {fmtDate(app.appliedAt || app.createdAt)}</Typography></Box>
              </Box>
            </Box>
            {/* Right panel: score + actions */}
            <Box sx={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, bgcolor: "#FAFAFA", border: "1px solid #F3F4F6", borderRadius: "14px", px: 3, py: 2.5, minWidth: 160 }}>
              {cvScore != null && (() => {
                const scoreColor = cvScore >= 70 ? "#059669" : cvScore >= 50 ? "#D97706" : "#DC2626";
                const r = 34; const circ = 2 * Math.PI * r;
                const filled = (Math.min(cvScore, 100) / 100) * circ;
                return (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                    <Box sx={{ position: "relative", width: 80, height: 80 }}>
                      <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={40} cy={40} r={r} fill="none" stroke={`${scoreColor}18`} strokeWidth={7} />
                        <circle cx={40} cy={40} r={r} fill="none" stroke={scoreColor} strokeWidth={7}
                          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
                      </svg>
                      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography sx={{ fontSize: "1.1rem", fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{cvScore}%</Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>CV Score</Typography>
                  </Box>
                );
              })()}
              <Divider sx={{ width: "100%", borderColor: "#E5E7EB" }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%" }}>
                {cvUrl && (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DescriptionOutlined sx={{ fontSize: 15 }} />}
                    onClick={() => window.open(cvUrl, "_blank")}
                    sx={{
                      textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                      borderRadius: "10px", height: 36,
                      color: "#374151", borderColor: "#E5E7EB", bgcolor: "#fff",
                      "&:hover": { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" },
                      boxShadow: "none",
                    }}
                  >
                    View CV
                  </Button>
                )}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<VideoCallOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => {
                    setInviteDate(null);
                    setInviteTime(null);
                    const postId = app?.post?._id || "";
                    const companyId = app?.company?._id || app?.post?.user || "";
                    const base = typeof window !== "undefined" ? window.location.origin : "";
                    setInviteLink(postId ? `${base}/interview/hr/?jobId=${postId}&companyId=${companyId}&ref=link` : "");
                    setInviteOpen(true);
                  }}
                  sx={{
                    textTransform: "none", fontWeight: 600, fontSize: "0.78rem",
                    borderRadius: "10px", height: 36,
                    bgcolor: "#8310FF", boxShadow: "none", color: "#fff",
                    "&:hover": { bgcolor: "#6d0ddb", boxShadow: "none", color: "#fff" },
                  }}
                >
                  Invite to Interview
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Summary */}
          {summary && (
            <Section icon={<WorkOutlineOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />} title="Summary">
              <Typography sx={{ fontSize: "0.85rem", color: "#4B5563", lineHeight: 1.7 }}>{summary}</Typography>
            </Section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Section icon={<WorkOutlineOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />} title="Experience">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {experience.map((exp: any, j: number) => (
                  <Box key={j}>
                    {j > 0 && <Divider sx={{ mb: 2 }} />}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{exp.title || exp.position || "—"}</Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#6B7280" }}>{exp.company}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                        {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Present"}
                      </Typography>
                    </Box>
                    {exp.description && (
                      <Typography sx={{ fontSize: "0.8rem", color: "#4B5563", mt: 0.75, lineHeight: 1.6 }}>{exp.description}</Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Section icon={<SchoolOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />} title="Education">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {education.map((edu: any, j: number) => (
                  <Box key={j}>
                    {j > 0 && <Divider sx={{ mb: 1.5 }} />}
                    <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{edu.degree}</Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "#6B7280" }}>{edu.institution}</Typography>
                      </Box>
                      {edu.year && <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF" }}>{edu.year}</Typography>}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Section icon={<CodeOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />} title="Skills">
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {skills.map((s: string) => (
                  <Chip key={s} label={s} size="small" sx={{ height: 24, fontSize: "0.75rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#374151" }} />
                ))}
              </Box>
            </Section>
          )}
        </>
      )}
      {/* ── Invite to Interview Modal ── */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 0.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VideoCallOutlined sx={{ color: "#8310FF", fontSize: 22 }} />
            Invite to Interview
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <DatePicker
                label="Date"
                value={inviteDate}
                onChange={(v) => setInviteDate(v as Dayjs | null)}
                disablePast
                slotProps={{ textField: { size: "small", sx: { flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px" } } } }}
              />
              <TimePicker
                label="Time"
                value={inviteTime}
                onChange={(v) => setInviteTime(v as Dayjs | null)}
                slotProps={{ textField: { size: "small", sx: { flex: 1, "& .MuiOutlinedInput-root": { borderRadius: "10px" } } } }}
              />
            </Box>
          </LocalizationProvider>
          <TextField
            label="Interview Link"
            fullWidth
            size="small"
            value={inviteLink}
            disabled
            helperText="Auto-generated from the job post"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          {inviteDone && (
            <Typography sx={{ fontSize: "0.82rem", color: "#059669", fontWeight: 600, textAlign: "center" }}>
              ✓ Invitation sent successfully!
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ textTransform: "none", color: "#6B7280", borderRadius: "10px" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleInvite}
            disabled={inviteSending || !inviteDate || !inviteTime || !inviteLink}
            sx={{
              textTransform: "none", fontWeight: 600, borderRadius: "10px",
              bgcolor: "#8310FF", boxShadow: "none",
              "&:hover": { bgcolor: "#6d0ddb", boxShadow: "none" },
            }}
          >
            {inviteSending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;
