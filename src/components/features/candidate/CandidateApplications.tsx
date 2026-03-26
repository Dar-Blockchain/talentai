import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Skeleton, Divider, Button } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardIos";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  applied:              { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", label: "Applied" },
  pending:              { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", label: "Pending" },
  shortlisted:          { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", label: "Shortlisted" },
  accepted:             { bg: "#F0FDFA", color: "#0D9488", border: "#99F6E4", label: "Accepted" },
  rejected:             { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", label: "Rejected" },
  withdrawn:            { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB", label: "Withdrawn" },
  interview_scheduled:  { bg: "#F5F0FF", color: "#8310FF", border: "#DDD6FE", label: "Interview Scheduled" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("api_token");
    if (!token) { setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}job-applications/candidate/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        setApplications(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ px: 5, py: 3, mb: 2, color: "#000", borderRadius: "12px", border: "1px solid rgba(84,98,116,0.1)", backgroundColor: "white" }}>
      <Typography variant="h5" sx={{
        fontWeight: 600, color: "#000000", fontSize: "20px", mb: 3, position: "relative",
        "&::after": { content: '""', position: "absolute", bottom: "-4px", left: 0, width: "38px", height: "5px", background: "#8310FF", borderRadius: "2px" },
      }}>
        My Applications
      </Typography>

      {loading ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: "10px" }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: 6 }} />
            </Box>
          ))}
        </Box>
      ) : applications.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WorkOutlineOutlined sx={{ fontSize: 28, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: "#374151", fontSize: "0.9rem", mb: 0.5 }}>No applications yet</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}>Apply to job posts via interview links to see them here</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {applications.map((app: any, i: number) => {
            const post = app.post || {};
            const jd = post.jobDetails || {};
            const title = jd.title || "—";
            const location = jd.location || "";
            const employmentType = jd.employmentType || "";
            const workMode = jd.workMode || "";
            const rawStatus = (app.status || "applied").toLowerCase();
            const sc = STATUS_STYLE[rawStatus] ?? STATUS_STYLE.applied;
            const isScheduled = rawStatus === "interview_scheduled";
            const interviewDate = app.interviewDate || app.interview?.date || null;
            const interviewTime = app.interviewTime || app.interview?.time || null;
            const interviewLink = app.interviewLink || app.interview?.link || null;

            return (
              <Box
                key={app._id || i}
                sx={{
                  borderRadius: "12px",
                  border: `1px solid ${isScheduled ? "#DDD6FE" : "#E5E7EB"}`,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Interview scheduled banner */}
                {isScheduled && (
                  <Box sx={{ bgcolor: "#8310FF", px: 2.5, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <VideoCallOutlined sx={{ fontSize: 15, color: "#fff" }} />
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>Interview Scheduled</Typography>
                    {(interviewDate || interviewTime) && (
                      <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.8)", ml: "auto" }}>
                        {[interviewDate, interviewTime].filter(Boolean).join(" · ")}
                      </Typography>
                    )}
                  </Box>
                )}

                <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {/* Top row */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: "10px", flexShrink: 0, bgcolor: isScheduled ? "rgba(131,16,255,0.08)" : "rgba(131,16,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <WorkOutlineOutlined sx={{ fontSize: 20, color: "#8310FF" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                        {title}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 0.4 }}>
                        {location && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                            <LocationOnOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                            <Typography sx={{ fontSize: "0.72rem", color: "#6B7280" }}>{location}</Typography>
                          </Box>
                        )}
                        {employmentType && <Chip label={employmentType} size="small" sx={{ height: 17, fontSize: "0.63rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#6B7280" }} />}
                        {workMode && <Chip label={workMode} size="small" sx={{ height: 17, fontSize: "0.63rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#6B7280" }} />}
                      </Box>
                    </Box>
                    {!isScheduled && (
                      <Chip label={sc.label} size="small" sx={{ height: 22, fontSize: "0.68rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, flexShrink: 0 }} />
                    )}
                  </Box>

                  <Divider />

                  {/* Footer */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <CalendarTodayOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>Applied {fmtDate(app.appliedAt || app.createdAt)}</Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardOutlined sx={{ fontSize: "10px !important" }} />}
                      onClick={() => router.push(`/dashboard/candidate/applications/${app._id}`)}
                      sx={{
                        textTransform: "none", fontWeight: 600, fontSize: "0.72rem",
                        color: "#8310FF", p: 0, minWidth: 0,
                        "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                      }}
                    >
                      Details
                    </Button>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default CandidateApplications;
