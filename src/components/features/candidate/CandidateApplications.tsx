import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Skeleton, Divider } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import Cookies from "js-cookie";

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  applied:     { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  pending:     { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  shortlisted: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0" },
  accepted:    { bg: "#F0FDFA", color: "#0D9488", border: "#99F6E4" },
  rejected:    { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  withdrawn:   { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <Box
      sx={{
        px: 5,
        py: 3,
        mb: 2,
        color: "#000",
        borderRadius: "12px",
        border: "1px solid rgba(84,98,116,0.1)",
        backgroundColor: "white",
      }}
    >
      {/* Title — same style as CandidateInterviews */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          color: "#000000",
          fontSize: "20px",
          mb: 3,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: "-4px",
            left: 0,
            width: "38px",
            height: "5px",
            background: "#8310FF",
            borderRadius: "2px",
          },
        }}
      >
        My Applications
      </Typography>

      {/* Cards grid */}
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
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem" }}>
            Apply to job posts via interview links to see them here
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          {applications.map((app: any, i: number) => {
            const post = app.post || {};
            const jd = post.jobDetails || {};
            const title = jd.title || "—";
            const company = post.companyName || post.user?.companyName || "";
            const location = jd.location || "";
            const employmentType = jd.employmentType || "";
            const workMode = jd.workMode || "";
            const status = (app.status || "applied").toLowerCase();
            const sc = STATUS_STYLE[status] ?? STATUS_STYLE.applied;

            return (
              <Box
                key={app._id || i}
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(131,16,255,0.08)",
                    borderColor: "rgba(131,16,255,0.25)",
                  },
                }}
              >
                {/* Top row: icon + title + status */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box sx={{
                    width: 42, height: 42, borderRadius: "10px", flexShrink: 0,
                    bgcolor: "rgba(131,16,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <WorkOutlineOutlined sx={{ fontSize: 20, color: "#8310FF" }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
                      {title}
                    </Typography>
                    {company && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.3 }}>
                        <BusinessOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{company}</Typography>
                      </Box>
                    )}
                  </Box>
                  <Chip
                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                    size="small"
                    sx={{
                      height: 22, fontSize: "0.68rem", fontWeight: 700,
                      bgcolor: sc.bg, color: sc.color,
                      border: `1px solid ${sc.border}`,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                <Divider />

                {/* Meta row */}
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
                  {location && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                      <LocationOnOutlined sx={{ fontSize: 13, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: "0.73rem", color: "#6B7280" }}>{location}</Typography>
                    </Box>
                  )}
                  {employmentType && (
                    <Chip label={employmentType} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#6B7280", border: "none" }} />
                  )}
                  {workMode && (
                    <Chip label={workMode} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 500, bgcolor: "#F3F4F6", color: "#6B7280", border: "none" }} />
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, ml: "auto" }}>
                    <CalendarTodayOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
                    <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>{fmtDate(app.appliedAt || app.createdAt)}</Typography>
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
