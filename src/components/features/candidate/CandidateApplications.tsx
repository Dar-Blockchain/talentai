import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Skeleton, Button } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardIos";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";
const PURPLE        = "#8310FF";
const PURPLE_BG     = "#F5F0FF";
const PURPLE_BORDER = "#DDD6FE";

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  applied:              { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE",  label: "Applied" },
  pending:              { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A",  label: "Pending" },
  shortlisted:          { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0",  label: "Shortlisted" },
  accepted:             { bg: TEAL_BG,   color: TEAL,      border: TEAL_BORDER,label: "Accepted" },
  rejected:             { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA",  label: "Rejected" },
  withdrawn:            { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB",  label: "Withdrawn" },
  interview_scheduled:  { bg: PURPLE_BG, color: PURPLE, border: PURPLE_BORDER, label: "Interview Scheduled" },
  interview_completed:  { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0",  label: "Interview Completed" },
  viewed:               { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1",  label: "Viewed" },
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const PAGE_SIZE = 2;

const CandidateApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("api_token");
    if (!token) { setLoading(false); return; }
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}job-applications/candidate/my?page=${page}&limit=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const list = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
        setApplications(list);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.totalCount || list.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 3, mb: 2.5, borderRadius: "16px", border: "1px solid #E5E7EB", bgcolor: "#fff" }}>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: "0.95rem" }}>My Applications</Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.25 }}>Track all your job applications</Typography>
        </Box>
        {totalCount > 0 && (
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: "20px", bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}` }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: TEAL }}>{totalCount} total</Typography>
          </Box>
        )}
      </Box>

      {/* Loading */}
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
                <Skeleton variant="rounded" width={80} height={22} sx={{ borderRadius: 6 }} />
              </Box>
              <Skeleton variant="text" width="30%" height={12} />
            </Box>
          ))}
        </Box>

      ) : applications.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
            <WorkOutlineOutlined sx={{ fontSize: 26, color: "#9CA3AF" }} />
          </Box>
          <Typography sx={{ fontWeight: 600, color: "#374151", fontSize: "0.88rem", mb: 0.5 }}>No applications yet</Typography>
          <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem" }}>Apply to job posts via interview links to see them here</Typography>
        </Box>

      ) : (
        <>
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

            return (
              <Box
                key={app._id || i}
                sx={{
                  borderRadius: "14px",
                  border: `1px solid ${sc.border}`,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.15s",
                  "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
                }}
              >
                {/* Top accent line */}
                <Box sx={{ height: 3, bgcolor: sc.color, opacity: 0.8 }} />

                <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>

                  {/* Title row */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
                      bgcolor: sc.bg,
                      border: `1px solid ${sc.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <WorkOutlineOutlined sx={{ fontSize: 18, color: sc.color }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {title}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75, mt: 0.5 }}>
                        {location && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                            <LocationOnOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                            <Typography sx={{ fontSize: "0.7rem", color: "#6B7280" }}>{location}</Typography>
                          </Box>
                        )}
                        {employmentType && (
                          <Chip label={employmentType} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 600, bgcolor: "#F3F4F6", color: "#6B7280", border: "none" }} />
                        )}
                        {workMode && (
                          <Chip label={workMode} size="small" sx={{ height: 16, fontSize: "0.6rem", fontWeight: 600, bgcolor: "#F3F4F6", color: "#6B7280", border: "none" }} />
                        )}
                      </Box>
                    </Box>
                    <Chip
                      label={sc.label}
                      size="small"
                      sx={{ height: 22, fontSize: "0.67rem", fontWeight: 700, bgcolor: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, flexShrink: 0 }}
                    />
                  </Box>

                  {/* Footer */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 0.5, borderTop: "1px solid #F3F4F6" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarTodayOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                      <Typography sx={{ fontSize: "0.68rem", color: "#9CA3AF" }}>Applied {fmtDate(app.appliedAt || app.createdAt)}</Typography>
                    </Box>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardOutlined sx={{ fontSize: "9px !important" }} />}
                      onClick={() => router.push(`/dashboard/candidate/applications/${app._id}`)}
                      sx={{
                        textTransform: "none", fontWeight: 700, fontSize: "0.72rem",
                        color: "#fff", bgcolor: sc.color, borderRadius: "8px",
                        px: 1.5, py: 0.5, minWidth: 0,
                        boxShadow: "none",
                        "&:hover": { opacity: 0.85, boxShadow: "none" },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>

                </Box>
              </Box>
            );
          })}
        </Box>
        {totalPages > 1 && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 3 }}>
            <Button
              size="small"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              sx={{
                minWidth: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB",
                color: "#374151", fontWeight: 600, fontSize: "0.8rem",
                "&:disabled": { opacity: 0.35 },
                "&:hover:not(:disabled)": { bgcolor: "#F3F4F6" },
              }}
            >
              ‹
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                size="small"
                onClick={() => setPage(p)}
                sx={{
                  minWidth: 32, height: 32, borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem",
                  border: p === page ? "1px solid #8310FF" : "1px solid #E5E7EB",
                  bgcolor: p === page ? PURPLE_BG : "transparent",
                  color: p === page ? PURPLE : "#374151",
                  "&:hover": { bgcolor: p === page ? PURPLE_BG : "#F3F4F6" },
                }}
              >
                {p}
              </Button>
            ))}
            <Button
              size="small"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              sx={{
                minWidth: 32, height: 32, borderRadius: "8px", border: "1px solid #E5E7EB",
                color: "#374151", fontWeight: 600, fontSize: "0.8rem",
                "&:disabled": { opacity: 0.35 },
                "&:hover:not(:disabled)": { bgcolor: "#F3F4F6" },
              }}
            >
              ›
            </Button>
          </Box>
        )}
        </>
      )}
    </Box>
  );
};

export default CandidateApplications;
